"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import { useAuth } from "@/context/AuthContext";
import EditReviewDialog, { EditableReview } from "@/components/EditReviewDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import ReviewCard from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";

type SortKey = "recent" | "helpful";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  user: { id: number; name: string };
  shoe: { id?: number; brand: string; model: string };
  shoeId?: number;
  helpfulCount: number;
  notHelpfulCount: number;
  userVote: number;
  fit?: "SMALL" | "TRUE_TO_SIZE" | "BIG" | null;
  cushion?: "SOFT" | "BALANCED" | "FIRM" | null;
  stability?: "NEUTRAL" | "MODERATE_SUPPORT" | "HIGH_SUPPORT" | null;
  mileage?: number | null;
  paceMinutes?: number | null; // legacy
  paceSeconds?: number | null; // legacy
  weight?: number | null; // legacy
  paceRange?: string | null;
  weightRange?: string | null;
  categories?: string[] | null;
  retired?: boolean | null;
}

const PAGE_SIZE = 15;

export default function AllReviewsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [editing, setEditing] = useState<EditableReview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: number }>({ open: false });

  const [sort, setSort] = useState<SortKey>(() => {
    return searchParams?.get("sort") === "helpful" ? "helpful" : "recent";
  });
  const [page, setPage] = useState<number>(() => {
    const param = Number.parseInt(searchParams?.get("page") ?? "1", 10);
    return Number.isFinite(param) && param > 0 ? param : 1;
  });

  function updateQuery(nextSort: SortKey, nextPage: number) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("sort", nextSort);
    params.set("page", String(nextPage));
    const query = params.toString();
    router.replace(query ? `/reviews/all?${query}` : "/reviews/all");
  }

  useEffect(() => {
    const incomingSort = searchParams?.get("sort") === "helpful" ? "helpful" : "recent";
    if (incomingSort !== sort) {
      setSort(incomingSort);
    }
    const param = Number.parseInt(searchParams?.get("page") ?? "1", 10);
    const incomingPage = Number.isFinite(param) && param > 0 ? param : 1;
    if (incomingPage !== page) {
      setPage(incomingPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function fetchReviews() {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("http://localhost:3001/reviews", { headers });
      const data = await res.json();
      const normalized: Review[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.reviews)
          ? data.reviews
          : [];
      setReviews(normalized);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    if (sort === "helpful") {
      sorted.sort((a, b) => {
        const helpfulDiff = (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0);
        if (helpfulDiff !== 0) return helpfulDiff;
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      });
    } else {
      sorted.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      });
    }
    return sorted;
  }, [reviews, sort]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedReviews.length / PAGE_SIZE));
  }, [sortedReviews.length]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
      updateQuery(sort, totalPages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, totalPages]);

  const paginatedReviews = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedReviews.slice(start, start + PAGE_SIZE);
  }, [sortedReviews, page]);

  async function handleVote(reviewId: number, value: 1 | -1) {
    if (!user) {
      alert("You need to be logged in to vote on reviews.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unable to find your session. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to record vote");
      }
      const updated: Review = await res.json();
      setReviews((prev) =>
        prev.map((review) => (review.id === reviewId ? { ...review, ...updated } : review)),
      );
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to record vote");
    }
  }

  function openConfirm(id: number) {
    setConfirmOpen({ open: true, id });
  }

  async function handleConfirmDelete() {
    const id = confirmOpen.id;
    if (!id) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/reviews/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setConfirmOpen({ open: false });
    if (res.ok) fetchReviews();
    else alert("Failed to delete review");
  }

  function handleSortChange(nextSort: SortKey) {
    if (sort === nextSort) return;
    setSort(nextSort);
    setPage(1);
    updateQuery(nextSort, 1);
  }

  function changePage(nextPage: number) {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    if (clamped === page) return;
    setPage(clamped);
    updateQuery(sort, clamped);
  }

  const renderReviewCard = (review: Review, index: number) => (
    <ReviewCard
      key={review.id}
      id={review.id}
      rating={review.rating}
      comment={review.comment}
      createdAt={review.createdAt}
      updatedAt={review.updatedAt}
      userName={review.user.name}
      userId={review.user.id}
      shoeBrand={review.shoe.brand}
      shoeModel={review.shoe.model}
      formattedDate={formatDateISOToMMDDYYYY(review.createdAt)}
      canEdit={user?.id !== undefined && review.user.id === user.id}
      onEdit={() =>
        setEditing({
          id: review.id,
          rating: review.rating,
          comment: review.comment ?? "",
          fit: review.fit ?? null,
          cushion: review.cushion ?? null,
          stability: review.stability ?? null,
          mileage: review.mileage ?? null,
          paceMinutes: review.paceMinutes ?? null,
          paceSeconds: review.paceSeconds ?? null,
          weight: review.weight ?? null,
              paceRange: review.paceRange ?? null,
              weightRange: review.weightRange ?? null,
              retired: review.retired ?? null,
            })
          }
      onDelete={() => openConfirm(review.id)}
      showLink={!!(review.shoeId || review.shoe.id)}
      shoeId={review.shoeId || review.shoe.id}
      helpfulCount={review.helpfulCount}
      notHelpfulCount={review.notHelpfulCount}
      userVote={review.userVote}
      votingDisabled={!user || review.user.id === user?.id}
      onVote={(value) => handleVote(review.id, value)}
      position={index}
      fit={review.fit ?? undefined}
      cushion={review.cushion ?? undefined}
      stability={review.stability ?? undefined}
      mileage={review.mileage ?? undefined}
      paceMinutes={review.paceMinutes ?? undefined}
      paceSeconds={review.paceSeconds ?? undefined}
      weight={review.weight ?? undefined}
      paceRange={review.paceRange ?? undefined}
      weightRange={review.weightRange ?? undefined}
      categories={review.categories ?? undefined}
      retired={review.retired ?? undefined}
    />
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">All Reviews</h1>
          <p className="text-sm text-muted-foreground">
            Explore the full catalogue of community impressions. Switch between recency and helpfulness to find the insights you need.
          </p>
        </div>
        <Link
          href="/reviews"
          className="text-sm font-semibold uppercase tracking-[0.2em] text-primary hover:text-primary/80"
        >
          Back to overview
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/60 p-1">
          <Button
            type="button"
            variant={sort === "recent" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleSortChange("recent")}
          >
            Most Recent
          </Button>
          <Button
            type="button"
            variant={sort === "helpful" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleSortChange("helpful")}
          >
            Most Helpful
          </Button>
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {sortedReviews.length} review{sortedReviews.length === 1 ? "" : "s"}
        </span>
      </div>

      {paginatedReviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedReviews.map((review, index) => renderReviewCard(review, index))}
        </div>
      )}

      <nav className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground">
        <Button type="button" variant="ghost" disabled={page <= 1} onClick={() => changePage(page - 1)}>
          <span className="mr-1">‹</span> Previous
        </Button>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, idx) => {
            const pageNumber = idx + 1;
            const isActive = pageNumber === page;
            const shouldRender =
              pageNumber <= 3 ||
              pageNumber === totalPages ||
              Math.abs(pageNumber - page) <= 1;

            if (!shouldRender) {
              if (pageNumber === 4 || pageNumber === totalPages - 1) {
                return <span key={`ellipsis-${pageNumber}`} className="px-1">…</span>;
              }
              return null;
            }

          return (
            <Button
              key={pageNumber}
              type="button"
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => changePage(pageNumber)}
              className={isActive ? "ring-1 ring-border" : undefined}
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>
      <Button
        type="button"
        variant="ghost"
        disabled={page >= totalPages}
        onClick={() => changePage(page + 1)}
      >
        Next <span className="ml-1">›</span>
      </Button>
    </nav>

      <EditReviewDialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        review={editing}
        onSaved={() => fetchReviews()}
      />
      <ConfirmDialog
        open={confirmOpen.open}
        title="Delete review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmOpen({ open: false })}
      />
    </div>
  );
}


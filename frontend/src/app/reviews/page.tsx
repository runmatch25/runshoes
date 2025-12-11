"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import { useAuth } from '@/context/AuthContext';
import EditReviewDialog, { EditableReview } from '@/components/EditReviewDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import ReviewCard from '@/components/ReviewCard';
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type SortOption = "recent" | "helpful" | "rating_high" | "rating_low" | "none";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const { user } = useAuth();
  const [editing, setEditing] = useState<EditableReview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: number }>({ open: false });
  const [voteConfirm, setVoteConfirm] = useState<{ open: boolean; reviewId?: number; value?: 1 | -1 }>({
    open: false,
  });
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState<string>("any");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("none");

  async function fetchReviews() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("http://localhost:3001/reviews", {
        headers,
      });
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

  async function submitVote(reviewId: number, value: 1 | -1) {
    if (!user) {
      alert('You need to be logged in to vote on reviews.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Unable to find your session. Please log in again.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to record vote');
      }
      const updated: Review = await res.json();
      setReviews((prev) =>
        prev.map((review) => (review.id === reviewId ? { ...review, ...updated } : review)),
      );
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to record vote');
    }
  }

  function handleVoteClick(review: Review, value: 1 | -1) {
    if (!user) {
      alert('You need to be logged in to vote on reviews.');
      return;
    }
    if (review.userVote === value) {
      setVoteConfirm({ open: true, reviewId: review.id, value });
      return;
    }
    submitVote(review.id, value);
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...reviews];

    // Search filter
    const searchTerm = search.trim().toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter((review) => {
        const userName = review.user.name.toLowerCase();
        const brand = review.shoe.brand.toLowerCase();
        const model = review.shoe.model.toLowerCase();
        const comment = review.comment.toLowerCase();
        return (
          userName.includes(searchTerm) ||
          brand.includes(searchTerm) ||
          model.includes(searchTerm) ||
          comment.includes(searchTerm)
        );
      });
    }

    // Rating filter
    if (filterRating !== "any") {
      const minRating = parseInt(filterRating);
      filtered = filtered.filter((review) => review.rating >= minRating);
    }

    // Type filter (if we have shoe type info)
    if (filterType !== "all") {
      // This would need to be implemented based on your data structure
      // For now, we'll skip this filter
    }

    // Sort
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case "helpful":
        filtered.sort((a, b) => {
          const helpfulDiff = (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0);
          if (helpfulDiff !== 0) return helpfulDiff;
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case "rating_high":
        filtered.sort((a, b) => {
          const ratingDiff = b.rating - a.rating;
          if (ratingDiff !== 0) return ratingDiff;
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case "rating_low":
        filtered.sort((a, b) => {
          const ratingDiff = a.rating - b.rating;
          if (ratingDiff !== 0) return ratingDiff;
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
        break;
      default:
        // No sorting
        break;
    }

    return filtered;
  }, [reviews, search, filterRating, filterType, sortBy]);

  function openConfirm(id: number) {
    setConfirmOpen({ open: true, id });
  }

  async function handleConfirmDelete() {
    const id = confirmOpen.id;
    if (!id) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3001/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setConfirmOpen({ open: false });
    if (res.ok) fetchReviews();
    else alert('Failed to delete review');
  }

  const renderCards = (items: Review[]) => (
    <div className="flex flex-col gap-8">
      {items.map((review) => (
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
          onVote={(value) => handleVoteClick(review, value)}
          position={items.indexOf(review)}
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
      ))}
    </div>
  );

  const getSortButtonValue = (): "recent" | "helpful" | "rating" => {
    if (sortBy === "recent") return "recent";
    if (sortBy === "helpful") return "helpful";
    if (sortBy === "rating_high" || sortBy === "rating_low") return "rating";
    return "recent";
  };

  const handleSortClick = (value: "recent" | "helpful" | "rating") => {
    let newSort: SortOption;
    if (value === "rating") {
      newSort = sortBy === "rating_high" ? "rating_low" : "rating_high";
    } else if (value === "recent") {
      newSort = "recent";
    } else {
      newSort = "helpful";
    }
    setSortBy(newSort);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Page Header */}
        <section className="py-16 border-b-2 border-neutral-200">
          <div className="mb-8 animate-fade-in">
            <span className="tracking-widest text-[#007bff] block mb-2 font-bold">REVIEWS</span>
            <h1 
              className="text-5xl lg:text-7xl leading-[0.9] mb-4 relative" 
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
            >
              ALL RUNNER<br />
              REVIEWS
              <div className="absolute -bottom-2 left-0 w-24 h-1 bg-[#007bff]"></div>
            </h1>
            <p className="text-neutral-600 text-lg max-w-2xl leading-relaxed">
              Explore honest reviews from runners across the community. Search by runner name, shoe brand, or review content. Filter and sort to find the insights you need.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in animate-delay-200">
            {/* Search */}
            <div className="border-2 border-black flex items-center md:col-span-2 hover:shadow-black-crisp transition-all duration-300">
              <Search className="size-5 ml-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="SEARCH BY RUNNER, SHOE, OR REVIEW"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 tracking-wider placeholder:text-neutral-400 rounded-none"
              />
            </div>

            {/* Rating Filter */}
            <Select
              value={filterRating}
              onValueChange={(value) => setFilterRating(value)}
            >
              <SelectTrigger className="border-2 border-black tracking-wider h-12 rounded-none hover:border-[#007bff] transition-colors">
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="MIN RATING" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">ANY RATING</SelectItem>
                <SelectItem value="5">5 STARS</SelectItem>
                <SelectItem value="4">4+ STARS</SelectItem>
                <SelectItem value="3">3+ STARS</SelectItem>
                <SelectItem value="2">2+ STARS</SelectItem>
                <SelectItem value="1">1+ STARS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-4 mt-6 animate-fade-in animate-delay-300">
            <div className="flex items-center gap-2 text-neutral-600">
              <SlidersHorizontal className="size-4" />
              <span className="tracking-wider font-bold">SORT BY:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={getSortButtonValue() === "recent" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleSortClick("recent")}
                className={
                  getSortButtonValue() === "recent"
                    ? "gradient-blue-vibrant text-white hover:opacity-90 rounded-none shadow-blue-sm"
                    : "hover:bg-[#007bff] hover:text-white border-2 border-transparent hover:border-[#007bff] rounded-none transition-all"
                }
              >
                RECENT
              </Button>
              <Button
                variant={getSortButtonValue() === "helpful" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleSortClick("helpful")}
                className={
                  getSortButtonValue() === "helpful"
                    ? "gradient-blue-vibrant text-white hover:opacity-90 rounded-none shadow-blue-sm"
                    : "hover:bg-[#007bff] hover:text-white border-2 border-transparent hover:border-[#007bff] rounded-none transition-all"
                }
              >
                HELPFUL
              </Button>
              <Button
                variant={getSortButtonValue() === "rating" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleSortClick("rating")}
                className={
                  getSortButtonValue() === "rating"
                    ? "gradient-blue-vibrant text-white hover:opacity-90 rounded-none shadow-blue-sm"
                    : "hover:bg-[#007bff] hover:text-white border-2 border-transparent hover:border-[#007bff] rounded-none transition-all"
                }
              >
                RATING
              </Button>
            </div>
          </div>
        </section>

        {/* Reviews List */}
        <section className="py-16">
          <div className="mb-8 animate-fade-in">
            <p className="text-neutral-600 tracking-wider font-bold">
              SHOWING <span className="text-black">{filteredAndSortedReviews.length}</span> OF <span className="text-black">{reviews.length}</span> REVIEWS
            </p>
          </div>

          {filteredAndSortedReviews.length > 0 ? (
            renderCards(filteredAndSortedReviews)
          ) : (
            <div className="text-center py-20">
              <div className="inline-block mb-6">
                <Search className="size-16 text-neutral-300" />
              </div>
              <h3 className="text-2xl tracking-wider mb-2 font-bold">NO REVIEWS FOUND</h3>
              <p className="text-neutral-600">Try adjusting your filters or search query</p>
            </div>
          )}
        </section>
      </div>

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
      <ConfirmDialog
        open={voteConfirm.open}
        title="Remove vote"
        description="Are you sure you want to remove your vote from this review?"
        onConfirm={() => {
          if (voteConfirm.reviewId && voteConfirm.value) {
            submitVote(voteConfirm.reviewId, voteConfirm.value);
          }
          setVoteConfirm({ open: false });
        }}
        onClose={() => setVoteConfirm({ open: false })}
        confirmLabel="Remove vote"
        confirmVariant="default"
      />
    </div>
  );
}

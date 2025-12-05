"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import ReviewForm from "@/components/ReviewForm";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from '@/components/ConfirmDialog';
import EditReviewDialog, { EditableReview } from '@/components/EditReviewDialog';
import ReviewCard from '@/components/ReviewCard';
import { StarRating } from "@/components/StarRating";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  user: { id: number; name: string };
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

interface Shoe {
  id: number;
  brand: string;
  model: string;
  type: string;
}

export default function ShoeClient({ shoeId }: { shoeId: number }) {
  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { user } = useAuth();
  const [editing, setEditing] = useState<EditableReview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: number }>({ open: false });
  const [voteConfirm, setVoteConfirm] = useState<{ open: boolean; reviewId?: number; value?: 1 | -1 }>({
    open: false,
  });

  const fetchShoe = useCallback(async () => {
    try {
      const resShoe = await fetch(`http://localhost:3001/shoes/${shoeId}`);
      const shoeData: Shoe = await resShoe.json();
      setShoe(shoeData);
    } catch (err) {
      console.error(err);
    }
  }, [shoeId]);

  const fetchReviews = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const resReviews = await fetch(`http://localhost:3001/reviews/shoe/${shoeId}`, {
        headers,
      });
      const reviewData: Review[] = await resReviews.json();
      setReviews(reviewData);
    } catch (err) {
      console.error(err);
    }
  }, [shoeId]);

  const submitVote = useCallback(
    async (reviewId: number, value: 1 | -1) => {
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

        const updatedReview: Review = await res.json();
        setReviews((prev) =>
          prev.map((review) => (review.id === reviewId ? { ...review, ...updatedReview } : review)),
        );
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : 'Failed to record vote');
      }
    },
    [user],
  );

  const handleVoteClick = (review: Review, value: 1 | -1) => {
    if (!user) {
      alert('You need to be logged in to vote on reviews.');
      return;
    }
    if (review.userVote === value) {
      setVoteConfirm({ open: true, reviewId: review.id, value });
      return;
    }
    submitVote(review.id, value);
  };

  useEffect(() => {
    fetchShoe();
    fetchReviews();
  }, [fetchReviews, fetchShoe]);

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

  if (!shoe) return <div className="text-foreground">Loading...</div>;

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">{shoe.brand} {shoe.model}</h1>
        <div className="flex items-center gap-2">
          <StarRating value={averageRating} readOnly size="lg" />
          <span className="text-sm text-muted-foreground">
            {averageRating > 0 ? averageRating.toFixed(1) : "No ratings yet"}
          </span>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Reviews</h2>
        {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet.</p>}
        <div className="flex flex-col gap-8">
          {reviews.map((r, index) => (
            <ReviewCard
              key={r.id}
              id={r.id}
              rating={r.rating}
              comment={r.comment}
              createdAt={r.createdAt}
              updatedAt={r.updatedAt}
              userName={r.user.name}
              shoeBrand={shoe?.brand}
              shoeModel={shoe?.model}
              formattedDate={formatDateISOToMMDDYYYY(r.createdAt)}
              canEdit={user?.id !== undefined && r.user.id === user.id}
              onEdit={() =>
                setEditing({
                  id: r.id,
                  rating: r.rating,
                  comment: r.comment ?? "",
                  fit: r.fit ?? null,
                  cushion: r.cushion ?? null,
                  stability: r.stability ?? null,
                  mileage: r.mileage ?? null,
                  paceMinutes: r.paceMinutes ?? null,
                  paceSeconds: r.paceSeconds ?? null,
                  weight: r.weight ?? null,
                  paceRange: r.paceRange ?? null,
                  weightRange: r.weightRange ?? null,
                  retired: r.retired ?? null,
                })
              }
              onDelete={() => openConfirm(r.id)}
              showLink={false}
              helpfulCount={r.helpfulCount}
              notHelpfulCount={r.notHelpfulCount}
              userVote={r.userVote}
              votingDisabled={!user || r.user.id === user?.id}
              onVote={(value) => handleVoteClick(r, value)}
              position={index}
              fit={r.fit ?? undefined}
              cushion={r.cushion ?? undefined}
              stability={r.stability ?? undefined}
              mileage={r.mileage ?? undefined}
              paceMinutes={r.paceMinutes ?? undefined}
              paceSeconds={r.paceSeconds ?? undefined}
              weight={r.weight ?? undefined}
              paceRange={r.paceRange ?? undefined}
              weightRange={r.weightRange ?? undefined}
              categories={r.categories ?? undefined}
              retired={r.retired ?? undefined}
            />
          ))}
        </div>
      </section>

      <EditReviewDialog open={Boolean(editing)} onClose={() => setEditing(null)} review={editing} onSaved={() => fetchReviews()} />
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

      <ReviewForm shoeId={shoeId} onReviewAdded={() => { fetchReviews(); }} />
    </div>
  );
}

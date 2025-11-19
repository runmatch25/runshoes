"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ConfirmDialog from '@/components/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import EditReviewDialog, { EditableReview } from '@/components/EditReviewDialog';
import ReviewWizard from "@/components/ReviewWizard";
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import ReviewCard from '@/components/ReviewCard';
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Shoe {
  id: number;
  brand: string;
  model: string;
  type: string;
  imageUrl?: string | null;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string | null;
  fit?: 'SMALL' | 'TRUE_TO_SIZE' | 'BIG' | null;
  cushion?: 'SOFT' | 'BALANCED' | 'FIRM' | null;
  stability?: 'NEUTRAL' | 'MODERATE_SUPPORT' | 'HIGH_SUPPORT' | null;
  mileage?: number | null;
  paceMinutes?: number | null; // legacy
  paceSeconds?: number | null; // legacy
  user: { id: number; name: string; weight?: number | null };
  weight?: number | null; // legacy
  paceRange?: string | null;
  weightRange?: string | null;
  helpfulCount: number;
  notHelpfulCount: number;
  userVote: number;
}

export default function ShoePage() {
  const params = useParams();
  const shoeId = Number(params.id);

  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { user } = useAuth();
  const [editing, setEditing] = useState<EditableReview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: number }>({ open: false });
  const [voteConfirm, setVoteConfirm] = useState<{ open: boolean; reviewId?: number; value?: 1 | -1 }>({
    open: false,
  });
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const fetchShoe = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:3001/shoes/${shoeId}`);
      const data = await res.json();
      setShoe(data);
    } catch (err) {
      console.error(err);
    }
  }, [shoeId]);

  const fetchReviews = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`http://localhost:3001/shoes/${shoeId}/reviews`, {
        headers,
      });
      const data = await res.json();
      setReviews(data);
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
        const updated: Review = await res.json();
        setReviews((prev) =>
          prev.map((review) => (review.id === reviewId ? { ...review, ...updated } : review)),
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

  useEffect(() => {
    fetchShoe();
    fetchReviews();
  }, [fetchReviews, fetchShoe]);

  if (!shoe) return <div className="text-foreground">Loading shoe...</div>;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const roundedRating = Math.round(averageRating);
  const FALLBACK_IMAGE = "/images/shoes/placeholder-volt.svg";
  const resolvedImageSrc = shoe.imageUrl && shoe.imageUrl.trim().length > 0 ? shoe.imageUrl : FALLBACK_IMAGE;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Header Section with Image */}
        <section className="py-16 border-b-2 border-neutral-200 relative overflow-hidden">
          {/* Animated background accent */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
            <div className="w-full h-full gradient-blue-light"></div>
          </div>
          
          <div className="relative z-10">
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-20 items-center">
              {/* Left: Image */}
              <div className="animate-fade-in lg:col-span-1">
                <div className="aspect-square bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] overflow-hidden border-2 border-black shadow-black-crisp-lg hover:shadow-blue-lg transition-all duration-500 relative max-w-md mx-auto lg:mx-0">
                  <ImageWithFallback
                    src={resolvedImageSrc}
                    alt={`${shoe.brand} ${shoe.model}`}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110 hover:rotate-2"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#007bff]/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Right: Shoe Info */}
              <div className="animate-fade-in animate-delay-200 lg:col-span-2">
                <div className="mb-8">
                  <span className="tracking-widest text-[#007bff] block mb-2 font-bold">{shoe.type.toUpperCase()}</span>
                  <h1 
                    className="text-5xl lg:text-7xl leading-[0.9] mb-4 relative" 
                    style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
                  >
                    {shoe.brand.toUpperCase()}<br />
                    {shoe.model.toUpperCase()}
                    <div className="absolute -bottom-2 left-0 w-24 h-1 bg-[#007bff]"></div>
                  </h1>
                </div>

                {/* Rating */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-6 ${
                            star <= roundedRating
                              ? 'fill-[#007bff] text-[#007bff]'
                              : 'fill-neutral-200 text-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="tracking-wider text-2xl font-bold text-neutral-700">
                      {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                    </span>
                    {reviews.length > 0 && (
                      <span className="tracking-wider text-sm text-neutral-500">
                        ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Button */}
                <Dialog
                  open={reviewDialogOpen}
                  onOpenChange={(open) => {
                    setReviewDialogOpen(open);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="gradient-blue-vibrant text-white hover:opacity-90 rounded-none shadow-blue-sm px-8 py-6 text-lg tracking-wider transition-all">
                      REVIEW THIS SHOE
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Review {shoe.brand} {shoe.model}</DialogTitle>
                    </DialogHeader>
                    {reviewDialogOpen ? (
                      <ReviewWizard
                        key={shoeId}
                        initialShoeId={shoeId}
                        layout="modal"
                        onSuccess={() => {
                          fetchReviews();
                          setReviewDialogOpen(false);
                          fetchShoe();
                        }}
                      />
                    ) : null}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16">
          <div className="mb-8 animate-fade-in">
            <span className="tracking-widest text-[#007bff] block mb-2 font-bold">002</span>
            <h2 className="text-4xl lg:text-5xl tracking-tighter font-bold relative inline-block">
              REVIEWS
              <div className="absolute -bottom-1 left-0 w-16 h-1 bg-[#007bff]"></div>
            </h2>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-20 border border-neutral-200">
              <p className="text-neutral-600 mb-4 tracking-wide">No reviews yet.</p>
              <Dialog
                open={reviewDialogOpen}
                onOpenChange={(open) => {
                  setReviewDialogOpen(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-[#007bff] text-white hover:bg-[#0056b3] tracking-wider rounded-none">
                    BE THE FIRST TO REVIEW
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Review {shoe.brand} {shoe.model}</DialogTitle>
                  </DialogHeader>
                  {reviewDialogOpen ? (
                    <ReviewWizard
                      key={shoeId}
                      initialShoeId={shoeId}
                      layout="modal"
                      onSuccess={() => {
                        fetchReviews();
                        setReviewDialogOpen(false);
                        fetchShoe();
                      }}
                    />
                  ) : null}
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {reviews.map((review, index) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  rating={review.rating}
                  comment={review.comment}
                  createdAt={review.createdAt}
                  userName={review.user.name}
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
                    })
                  }
                  onDelete={() => openConfirm(review.id)}
                  showLink={false}
                  helpfulCount={review.helpfulCount}
                  notHelpfulCount={review.notHelpfulCount}
                  userVote={review.userVote}
                  votingDisabled={!user || review.user.id === user?.id}
                  onVote={(value) => handleVoteClick(review, value)}
                  position={index}
                  fit={review.fit ?? undefined}
                  cushion={review.cushion ?? undefined}
                  stability={review.stability ?? undefined}
                  mileage={review.mileage ?? undefined}
                  paceMinutes={review.paceMinutes ?? undefined}
                  paceSeconds={review.paceSeconds ?? undefined}
                  weight={review.weight ?? review.user.weight ?? undefined}
                  paceRange={review.paceRange ?? undefined}
                  weightRange={review.weightRange ?? undefined}
                />
              ))}
            </div>
          )}
        </section>
      </div>

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
    </div>
  );
}

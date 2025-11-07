"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ConfirmDialog from '@/components/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import EditReviewDialog from '@/components/EditReviewDialog';
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { Pencil, Trash2 } from "lucide-react";
// Removed inline ReviewForm per new flow

interface Shoe {
  id: number;
  brand: string;
  model: string;
  type: string;
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
  paceMinutes?: number | null;
  paceSeconds?: number | null;
  user: { id?: number; name: string; weight?: number | null };
}

export default function ShoePage() {
  const params = useParams();
  const shoeId = Number(params.id);

  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { user } = useAuth();
  const [editing, setEditing] = useState<{ id: number; rating: number; comment: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: number }>({ open: false });

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
      const res = await fetch(`http://localhost:3001/shoes/${shoeId}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  }, [shoeId]);

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

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
      <Card className="border border-border/80 bg-card/90 backdrop-blur">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-card-foreground">
            {shoe.brand} {shoe.model}
          </CardTitle>
          <p className="text-sm text-muted-foreground uppercase tracking-[0.3em]">
            {shoe.type}
          </p>
          <div className="flex items-center gap-2">
            <StarRating value={averageRating} readOnly size="lg" />
            <span className="text-sm font-medium text-muted-foreground">
              {averageRating > 0 ? averageRating.toFixed(1) : "No ratings yet"}
            </span>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {reviews.length === 0 && (
          <p className="text-muted-foreground">No reviews yet.</p>
        )}

        {reviews.map((review) => (
          <Card
            key={review.id}
            className="relative border border-border/70 bg-card/80 p-1 backdrop-blur"
          >
            <CardContent className="pb-12">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {review.user.name}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating value={review.rating} readOnly size="md" />
                    <span className="text-xs text-muted-foreground">({review.rating}/5)</span>
                  </div>
                </div>
                {user?.id && review.user.id === user.id && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditing({ id: review.id, rating: review.rating, comment: review.comment })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => openConfirm(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {review.fit && (
                  <span className="rounded-full border border-border px-3 py-1 uppercase tracking-[0.2em]">
                    Fit: {review.fit}
                  </span>
                )}
                {review.cushion && (
                  <span className="rounded-full border border-border px-3 py-1 uppercase tracking-[0.2em]">
                    Cushion: {review.cushion}
                  </span>
                )}
                {review.stability && (
                  <span className="rounded-full border border-border px-3 py-1 uppercase tracking-[0.2em]">
                    Stability: {review.stability}
                  </span>
                )}
                {typeof review.mileage === "number" && (
                  <span className="rounded-full border border-border px-3 py-1 uppercase tracking-[0.2em]">
                    Mileage: {review.mileage}
                  </span>
                )}
                {(typeof review.paceMinutes === "number" || typeof review.paceSeconds === "number") && (
                  <span className="rounded-full border border-border px-3 py-1 uppercase tracking-[0.2em]">
                    Pace: {review.paceMinutes ?? 0}m {review.paceSeconds ?? 0}s
                  </span>
                )}
                {typeof review.user.weight === "number" && (
                  <span className="rounded-full border border-border px-3 py-1 uppercase tracking-[0.2em]">
                    Weight: {review.user.weight}
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm text-card-foreground/90 leading-relaxed">
                {review.comment}
              </p>
            </CardContent>
            <span className="absolute bottom-4 right-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {formatDateISOToMMDDYYYY(review.createdAt)}
            </span>
          </Card>
        ))}
      </div>

      <EditReviewDialog open={Boolean(editing)} onClose={() => setEditing(null)} review={editing} onSaved={() => fetchReviews()} />
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

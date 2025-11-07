"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import ReviewForm from "@/components/ReviewForm";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from '@/components/ConfirmDialog';
import EditReviewDialog from '@/components/EditReviewDialog';
import { StarRating } from "@/components/StarRating";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string | null;
  user: { id: number; name: string };
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
  const [editing, setEditing] = useState<{ id: number; rating: number; comment: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: number }>({ open: false });

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
      const resReviews = await fetch(`http://localhost:3001/reviews/shoe/${shoeId}`);
      const reviewData: Review[] = await resReviews.json();
      setReviews(reviewData);
    } catch (err) {
      console.error(err);
    }
  }, [shoeId]);

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
        {reviews.map((r) => (
          <Card key={r.id} className="relative border border-border/70 bg-card/80 p-1">
            <CardContent className="space-y-3 pb-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{r.user.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <StarRating value={r.rating} readOnly size="sm" />
                    <span>({r.rating}/5)</span>
                  </div>
                </div>
                {user?.id === r.user.id && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditing({ id: r.id, rating: r.rating, comment: r.comment })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => openConfirm(r.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-sm text-card-foreground/90 leading-relaxed">{r.comment}</p>
            </CardContent>
            <span className="absolute bottom-4 right-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {formatDateISOToMMDDYYYY(r.createdAt)}
            </span>
          </Card>
        ))}
      </section>

      <EditReviewDialog open={Boolean(editing)} onClose={() => setEditing(null)} review={editing} onSaved={() => fetchReviews()} />
      <ConfirmDialog
        open={confirmOpen.open}
        title="Delete review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmOpen({ open: false })}
      />

      <ReviewForm shoeId={shoeId} onReviewAdded={() => { fetchReviews(); }} />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import EditReviewDialog from '@/components/EditReviewDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { Pencil, Trash2 } from "lucide-react";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string | null;
  shoe: { id: number; brand: string; model: string };
}

export default function ProfilePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [editing, setEditing] = useState<{ id: number; rating: number; comment: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: number }>({ open: false });
  const router = useRouter();

  const fetchReviews = useCallback(async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/reviews/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Failed to fetch reviews", res.statusText);
      setReviews([]);
      return;
    }

    const data = await res.json();
    const normalizedReviews: Review[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.reviews)
        ? data.reviews
        : [];

    setReviews(normalizedReviews);
  }, []);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUserName(data.name);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchUser();
    fetchReviews();
  }, [fetchReviews, fetchUser, router]);

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

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome, {userName || "Runner"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your reviews and revisit the shoes you&apos;ve rated.
        </p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground">You haven&apos;t left any reviews yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="relative border border-border/70 bg-card/90 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle>{review.shoe.brand} {review.shoe.model}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StarRating value={review.rating} readOnly size="md" />
                <p className="text-sm text-card-foreground/90 leading-relaxed">{review.comment}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/shoes/${review.shoe.id}`)}>
                    View Shoe
                  </Button>
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
              </CardContent>
              <span className="absolute bottom-4 right-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {formatDateISOToMMDDYYYY(review.createdAt)}
              </span>
            </Card>
          ))}
        </div>
      )}
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

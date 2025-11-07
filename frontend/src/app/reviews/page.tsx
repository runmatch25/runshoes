"use client";

import { useEffect, useState } from "react";
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import { useAuth } from '@/context/AuthContext';
import EditReviewDialog from '@/components/EditReviewDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import ReviewCard from '@/components/ReviewCard';

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string | null;
  user: { id?: number; name: string };
  shoe: { id?: number; brand: string; model: string };
  shoeId?: number;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const { user } = useAuth();
  const [editing, setEditing] = useState<{ id: number; rating: number; comment: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: number }>({ open: false });

  async function fetchReviews() {
    try {
      const res = await fetch("http://localhost:3001/reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

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
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          id={review.id}
          rating={review.rating}
          comment={review.comment}
          createdAt={review.createdAt}
          userName={review.user.name}
          shoeBrand={review.shoe.brand}
          shoeModel={review.shoe.model}
          formattedDate={formatDateISOToMMDDYYYY(review.createdAt)}
          canEdit={user?.id !== undefined && review.user.id === user.id}
          onEdit={() => setEditing({ id: review.id, rating: review.rating, comment: review.comment })}
          onDelete={() => openConfirm(review.id)}
          showLink={!!(review.shoeId || review.shoe.id)}
          shoeId={review.shoeId || review.shoe.id}
        />
      ))}
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

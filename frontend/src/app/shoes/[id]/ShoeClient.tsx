"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Divider, IconButton } from "@mui/material";
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import Rating from "@mui/material/Rating";
import ReviewForm from "@/components/ReviewForm";
import { useAuth } from "@/context/AuthContext";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '@/components/ConfirmDialog';
import EditReviewDialog from '@/components/EditReviewDialog';

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

  async function fetchShoe() {
    try {
      const resShoe = await fetch(`http://localhost:3001/shoes/${shoeId}`);
      const shoeData: Shoe = await resShoe.json();
      setShoe(shoeData);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchReviews() {
    try {
      const resReviews = await fetch(`http://localhost:3001/reviews/shoe/${shoeId}`);
      const reviewData: Review[] = await resReviews.json();
      setReviews(reviewData);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchShoe();
    fetchReviews();
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

  if (!shoe) return <Typography>Loading...</Typography>;

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <Box p={4}>
      <Typography variant="h4">{shoe.brand} {shoe.model}</Typography>
      <Divider sx={{ my: 2 }} />

      {/* Average Rating Display */}
      <Box display="flex" alignItems="center" mb={2}>
        <Rating value={averageRating} precision={0.1} readOnly />
        <Typography variant="body1" ml={1}>
          {averageRating > 0 ? averageRating.toFixed(1) : "No ratings yet"}
        </Typography>
      </Box>

      <Typography variant="h5" gutterBottom>Reviews</Typography>
      {reviews.length === 0 && <Typography>No reviews yet.</Typography>}
      {reviews.map((r) => (
        <Box key={r.id} mb={2} sx={{ position: 'relative', p: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <Box sx={{ pb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2">{r.user.name} — {r.rating}/5</Typography>
              {user?.id === r.user.id && (
                <Box>
                  <IconButton size="small" onClick={() => setEditing({ id: r.id, rating: r.rating, comment: r.comment })}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openConfirm(r.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
            <Typography variant="body2">{r.comment}</Typography>
            <Divider sx={{ my: 1 }} />
          </Box>
          <Typography variant="caption" sx={{ position: 'absolute', right: 12, bottom: 8, color: 'rgba(255,255,255,0.7)' }}>{formatDateISOToMMDDYYYY(r.createdAt)}</Typography>
        </Box>
      ))}

      <EditReviewDialog open={Boolean(editing)} onClose={() => setEditing(null)} review={editing} onSaved={() => fetchReviews()} />
      <ConfirmDialog
        open={confirmOpen.open}
        title="Delete review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmOpen({ open: false })}
      />

      <ReviewForm shoeId={shoeId} onReviewAdded={() => {
        // refresh reviews after a new review is posted
        (async () => {
          try {
            const res = await fetch(`http://localhost:3001/reviews/shoe/${shoeId}`);
            const data: Review[] = await res.json();
            setReviews(data);
          } catch (err) {
            console.error(err);
          }
        })();
      }} />
    </Box>
  );
}

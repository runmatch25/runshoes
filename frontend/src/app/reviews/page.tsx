"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Rating, IconButton } from "@mui/material";
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import { useAuth } from '@/context/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditReviewDialog from '@/components/EditReviewDialog';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string | null;
  user: { id?: number; name: string };
  shoe: { brand: string; model: string };
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
    <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", mt: 4 }}>
      {reviews.map((review) => (
        <Card
          key={review.id}
          sx={{
            position: "relative",
            backdropFilter: "blur(12px)",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 8px 30px rgba(146, 254, 157, 0.4)",
            },
          }}
        >
          <CardContent sx={{ pb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                {review.user.name} reviewed {review.shoe.brand} {review.shoe.model}
              </Typography>
              {user?.id && review.user.id === user.id && (
                <Box>
                  <IconButton size="small" onClick={() => setEditing({ id: review.id, rating: review.rating, comment: review.comment })}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openConfirm(review.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
            <Rating value={review.rating} readOnly sx={{ mt: 1 }} />
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              {review.comment}
            </Typography>
          </CardContent>
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              right: 12,
              bottom: 10,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {formatDateISOToMMDDYYYY(review.createdAt)}
          </Typography>
        </Card>
      ))}
      <EditReviewDialog open={Boolean(editing)} onClose={() => setEditing(null)} review={editing} onSaved={() => fetchReviews()} />
      <ConfirmDialog
        open={confirmOpen.open}
        title="Delete review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmOpen({ open: false })}
      />
    </Box>
  );
}

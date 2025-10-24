"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Card, CardContent, Typography, Rating, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import EditReviewDialog from '@/components/EditReviewDialog';
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import ReviewForm from "@/components/ReviewForm";

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
  user: { id?: number; name: string };
}

export default function ShoePage() {
  const params = useParams();
  const shoeId = Number(params.id);

  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { user } = useAuth();
  const [editing, setEditing] = useState<{ id: number; rating: number; comment: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: number }>({ open: false });

  const fetchShoe = async () => {
    try {
      const res = await fetch(`http://localhost:3001/shoes/${shoeId}`);
      const data = await res.json();
      setShoe(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:3001/shoes/${shoeId}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
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
  }, [shoeId]);

  if (!shoe) return <Typography>Loading shoe...</Typography>;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mt: 4 }}>
      {/* Shoe Info */}
      <Card
        sx={{
          p: 4,
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {shoe.brand} {shoe.model}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          Type: {shoe.type}
        </Typography>

        {/* Average rating display */}
        <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
          <Rating value={averageRating} precision={0.1} readOnly />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {averageRating > 0 ? averageRating.toFixed(1) : "No ratings yet"}
          </Typography>
        </Box>
      </Card>

      {/* Reviews */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}
      >
        {reviews.length === 0 && <Typography>No reviews yet.</Typography>}

        {reviews.map((review) => (
            <Card
              key={review.id}
              sx={{
                position: 'relative',
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
                    {review.user.name}
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
              <Typography variant="caption" sx={{ position: 'absolute', right: 12, bottom: 10, color: 'rgba(255,255,255,0.7)' }}>{formatDateISOToMMDDYYYY(review.createdAt)}</Typography>
            </Card>
        ))}
      </Box>

      {/* Review Form */}
      <ReviewForm shoeId={shoeId} onReviewAdded={fetchReviews} />
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

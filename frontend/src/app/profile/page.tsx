"use client";

import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Rating, Button, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '@/context/AuthContext';
import EditReviewDialog from '@/components/EditReviewDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import { useRouter } from "next/navigation";

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
  const { user } = useAuth();
  const [editing, setEditing] = useState<{ id: number; rating: number; comment: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: number }>({ open: false });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchUser();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function fetchReviews() {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/reviews/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setReviews(data);
  }

  async function fetchUser() {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUserName(data.name);
  }

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
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Welcome, {userName || "User"}
      </Typography>

      {reviews.length === 0 ? (
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          You haven’t left any reviews yet.
        </Typography>
      ) : (
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
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
                    boxShadow: "0 8px 30px rgba(255,255,255,0.2)",
                  },
              }}
            >
                <CardContent sx={{ pb: 6 }}>
                <Typography variant="h6">
                  {review.shoe.brand} {review.shoe.model}
                </Typography>
                <Rating value={review.rating} readOnly sx={{ mt: 1 }} />
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  {review.comment}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => router.push(`/shoes/${review.shoe.id}`)}
                  >
                    View Shoe
                  </Button>
                  <IconButton size="small" onClick={() => setEditing({ id: review.id, rating: review.rating, comment: review.comment })}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openConfirm(review.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
              <Typography
                variant="caption"
                sx={{ position: "absolute", right: 12, bottom: 10, color: "rgba(255,255,255,0.7)" }}
              >
                {formatDateISOToMMDDYYYY(review.createdAt)}
              </Typography>
            </Card>
          ))}
        </Box>
      )}
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

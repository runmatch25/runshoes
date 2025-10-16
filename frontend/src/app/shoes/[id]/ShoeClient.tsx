"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import Rating from "@mui/material/Rating";
import ReviewForm from "@/components/ReviewForm";

interface Review {
  id: number;
  rating: number;
  comment: string;
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

  useEffect(() => {
    async function fetchData() {
      try {
        const resShoe = await fetch(`http://localhost:3001/shoes/${shoeId}`);
        const shoeData: Shoe = await resShoe.json();
        setShoe(shoeData);

        const resReviews = await fetch(`http://localhost:3001/reviews/shoe/${shoeId}`);
        const reviewData: Review[] = await resReviews.json();
        setReviews(reviewData);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [shoeId]);

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
        <Box key={r.id} mb={2}>
          <Typography variant="subtitle2">{r.user.name} — {r.rating}/5</Typography>
          <Typography variant="body2">{r.comment}</Typography>
          <Divider sx={{ my: 1 }} />
        </Box>
      ))}

      <ReviewForm shoeId={shoeId} />
    </Box>
  );
}

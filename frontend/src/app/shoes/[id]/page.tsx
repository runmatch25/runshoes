"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Card, CardContent, Typography, Rating } from "@mui/material";
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
  user: { name: string };
}

export default function ShoePage() {
  const params = useParams(); // get ID from URL
  const shoeId = Number(params.id);

  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Fetch shoe info
  useEffect(() => {
    fetch(`http://localhost:3001/shoes/${shoeId}`)
      .then((res) => res.json())
      .then((data) => setShoe(data))
      .catch((err) => console.error(err));
  }, [shoeId]);

  // Fetch reviews for this shoe
  useEffect(() => {
    fetch(`http://localhost:3001/shoes/${shoeId}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error(err));
  }, [shoeId]);

  if (!shoe) return <Typography>Loading shoe...</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mt: 4 }}>
      {/* Shoe Info Card */}
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
      </Card>

      {/* Reviews Section */}
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {reviews.map((review) => (
          <Card
            key={review.id}
            sx={{
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
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                {review.user.name}
              </Typography>
              <Rating value={review.rating} readOnly sx={{ mt: 1 }} />
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {review.comment}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Review Form */}
      <ReviewForm shoeId={shoeId} />
    </Box>
  );
}

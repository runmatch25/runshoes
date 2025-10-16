"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Rating } from "@mui/material";

interface Review {
  id: number;
  rating: number;
  comment: string;
  user: { name: string };
  shoe: { brand: string; model: string };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", mt: 4 }}>
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
              {review.user.name} reviewed {review.shoe.brand} {review.shoe.model}
            </Typography>
            <Rating value={review.rating} readOnly sx={{ mt: 1 }} />
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              {review.comment}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

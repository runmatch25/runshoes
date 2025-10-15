"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";

export default function NewReviewPage() {
  const [shoeId, setShoeId] = useState("");
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState<number | null>(3);
  const [comment, setComment] = useState("");
  const [pace, setPace] = useState("");
  const [weight, setWeight] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:3001/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shoeId,
        userId,
        rating,
        comment,
        pace,
        weight,
      }),
    });
    router.push("/reviews");
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add a New Review
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Shoe ID"
          fullWidth
          value={shoeId}
          onChange={(e) => setShoeId(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="User ID"
          fullWidth
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Rating
          name="rating"
          value={rating}
          onChange={(_, newValue) => setRating(newValue)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Comment"
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Pace (min/km)"
          fullWidth
          value={pace}
          onChange={(e) => setPace(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Weight (kg)"
          fullWidth
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" fullWidth>
          Add Review
        </Button>
      </form>
    </Box>
  );
}

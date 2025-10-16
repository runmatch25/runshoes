"use client";

import { useState } from "react";
import { Box, Button, Rating, TextField, Typography } from "@mui/material";

export default function ReviewForm({ shoeId }: { shoeId: number }) {
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState("");

  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first!");
      return;
    }

    const res = await fetch("http://localhost:3001/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shoeId, rating, comment }),
    });

    const data = await res.json();
    alert(data.message || "Review posted!");
  }

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Leave a Review
      </Typography>
      <Rating
        value={rating}
        onChange={(_, newValue) => setRating(newValue)}
        precision={1}
        size="large"
      />
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Comment"
        margin="normal"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!rating || !comment}
      >
        Submit Review
      </Button>
    </Box>
  );
}

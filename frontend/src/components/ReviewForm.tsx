"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";

interface ReviewFormProps {
  shoeId: number;
  onReviewAdded: () => void; // callback to refresh reviews
}

export default function ReviewForm({ shoeId, onReviewAdded }: ReviewFormProps) {
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState("");

  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shoeId, rating, comment }),
      });

      if (!res.ok) throw new Error("Failed to post review");

      setComment("");
      setRating(0);

      onReviewAdded(); // refresh reviews
    } catch (err) {
      console.error(err);
      alert("Error submitting review");
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold">Leave a Review</h3>
      <div className="flex items-center gap-3">
        <StarRating value={rating ?? 0} onChange={(val) => setRating(val)} size="lg" />
        {rating ? <span className="text-sm text-muted-foreground">{rating}/5</span> : null}
      </div>
      <Textarea
        rows={3}
        placeholder="How does this shoe feel?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button onClick={handleSubmit} disabled={!rating || !comment.trim()}>
        Submit Review
      </Button>
    </div>
  );
}

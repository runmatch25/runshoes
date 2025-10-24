"use client";

import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import Rating from "@mui/material/Rating";

interface Props {
  open: boolean;
  onClose: () => void;
  review: { id: number; rating: number; comment: string } | null;
  onSaved?: (updated: any) => void;
}

export default function EditReviewDialog({ open, onClose, review, onSaved }: Props) {
  const [rating, setRating] = useState<number | null>(review ? review.rating : 0);
  const [comment, setComment] = useState<string>(review ? review.comment : "");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setRating(review ? review.rating : 0);
    setComment(review ? review.comment : "");
  }, [review]);

  async function handleSave() {
    if (!review) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to edit reviews");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) throw new Error("Failed to update review");
      const data = await res.json();
      onSaved && onSaved(data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error updating review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Review</DialogTitle>
      <DialogContent>
        <Rating value={rating} onChange={(_, v) => setRating(v)} precision={1} />
        <TextField fullWidth multiline rows={4} label="Comment" margin="normal" value={comment} onChange={(e) => setComment(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading || !rating || !comment}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";

interface Props {
  open: boolean;
  onClose: () => void;
  review: { id: number; rating: number; comment: string } | null;
  onSaved?: (updated: ReviewResponse) => void;
}

interface ReviewResponse {
  id: number;
  rating: number;
  comment: string;
  [key: string]: unknown;
}

export default function EditReviewDialog({ open, onClose, review, onSaved }: Props) {
  const [rating, setRating] = useState<number>(review ? review.rating : 0);
  const [comment, setComment] = useState<string>(review ? review.comment : "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
      const data: ReviewResponse = await res.json();
      if (onSaved) {
        onSaved(data);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error updating review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <StarRating value={rating} onChange={(val) => setRating(val)} size="lg" />
            <span className="text-sm text-muted-foreground">{rating}/5</span>
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share how this shoe performs..."
          />
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !rating || !comment.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

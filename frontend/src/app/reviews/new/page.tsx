"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";

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
    <div className="mx-auto mt-8 max-w-md">
      <Card className="border border-border/70 bg-card/80">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-xl font-semibold text-foreground">Add a New Review</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Shoe ID"
              value={shoeId}
              onChange={(e) => setShoeId(e.target.value)}
            />
            <Input
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <StarRating value={rating ?? 0} onChange={(val) => setRating(val)} size="lg" />
              <span className="text-sm text-muted-foreground">{rating}/5</span>
            </div>
            <Textarea
              placeholder="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Input
              placeholder="Pace (min/km)"
              value={pace}
              onChange={(e) => setPace(e.target.value)}
            />
            <Input
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Add Review
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

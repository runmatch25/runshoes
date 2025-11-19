"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { useUnitPreferences } from "@/context/UnitPreferencesContext";

const KM_PER_MILE = 1.60934;

export default function NewReviewPage() {
  const [shoeId, setShoeId] = useState("");
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState<number | null>(3);
  const [comment, setComment] = useState("");
  const [pace, setPace] = useState("");
  const [weight, setWeight] = useState("");
  const router = useRouter();
  const { distanceUnit, distanceLabel, weightLabel, toBaseWeight } = useUnitPreferences();

  const parsePaceInput = (raw: string): number | undefined => {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    if (trimmed.includes(":")) {
      const [minPart, secPart = "0"] = trimmed.split(":");
      const minutes = Number.parseFloat(minPart);
      const seconds = Number.parseFloat(secPart);
      if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return undefined;
      return minutes + seconds / 60;
    }
    const numeric = Number.parseFloat(trimmed);
    return Number.isFinite(numeric) ? numeric : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weightNumber = weight.trim() === "" ? undefined : Number.parseFloat(weight);
    const payloadWeight =
      weightNumber !== undefined && Number.isFinite(weightNumber)
        ? toBaseWeight(weightNumber)
        : undefined;

    const paceNumber = parsePaceInput(pace);
    const payloadPace =
      paceNumber !== undefined
        ? distanceUnit === "kilometers"
          ? paceNumber
          : paceNumber / KM_PER_MILE
        : undefined;

    await fetch("http://localhost:3001/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shoeId,
        userId,
        rating,
        comment,
        pace: payloadPace,
        weight: payloadWeight,
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
              placeholder={`Pace (min/${distanceLabel})`}
              value={pace}
              onChange={(e) => setPace(e.target.value)}
            />
            <Input
              placeholder={`Weight (${weightLabel})`}
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

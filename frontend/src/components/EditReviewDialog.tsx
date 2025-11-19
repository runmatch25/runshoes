"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUnitPreferences } from "@/context/UnitPreferencesContext";

export type EditableReview = {
  id: number;
  rating: number;
  comment: string;
  fit?: "SMALL" | "TRUE_TO_SIZE" | "BIG" | null;
  cushion?: "SOFT" | "BALANCED" | "FIRM" | null;
  stability?: "NEUTRAL" | "MODERATE_SUPPORT" | "HIGH_SUPPORT" | null;
  mileage?: number | null;
  paceMinutes?: number | null; // legacy
  paceSeconds?: number | null; // legacy
  weight?: number | null; // legacy
  paceRange?: string | null;
  weightRange?: string | null;
};

interface Props {
  open: boolean;
  onClose: () => void;
  review: EditableReview | null;
  onSaved?: (updated: ReviewResponse) => void;
}

interface ReviewResponse {
  id: number;
  rating: number;
  comment: string;
  [key: string]: unknown;
}

const NONE_OPTION = "NONE";

const fitOptions = [
  { value: NONE_OPTION, label: "Not set" },
  { value: "SMALL", label: "Runs small" },
  { value: "TRUE_TO_SIZE", label: "True to size" },
  { value: "BIG", label: "Runs big" },
] as const;

const cushionOptions = [
  { value: NONE_OPTION, label: "Not set" },
  { value: "SOFT", label: "Soft" },
  { value: "BALANCED", label: "Balanced" },
  { value: "FIRM", label: "Firm" },
] as const;

const stabilityOptions = [
  { value: NONE_OPTION, label: "Not set" },
  { value: "NEUTRAL", label: "Neutral" },
  { value: "MODERATE_SUPPORT", label: "Moderate support" },
  { value: "HIGH_SUPPORT", label: "High support" },
] as const;

const paceRangeOptionsImperial = [
  {
    value: "pace-mile-slower-than-11",
    label: ">11:00/mile",
  },
  {
    value: "pace-mile-9-31-to-10-59",
    label: "9:31 – 10:59/mile",
  },
  {
    value: "pace-mile-8-01-to-9-30",
    label: "8:01 – 9:30/mile",
  },
  {
    value: "pace-mile-6-31-to-8-00",
    label: "6:31 – 8:00/mile",
  },
  {
    value: "pace-mile-5-51-to-6-30",
    label: "5:51 – 6:30/mile",
  },
  {
    value: "pace-mile-faster-than-5-50",
    label: "<5:50/mile",
  },
] as const;

const paceRangeOptionsMetric = [
  {
    value: "pace-km-slower-than-6-50",
    label: ">6:50/km",
  },
  {
    value: "pace-km-5-35-to-6-49",
    label: "5:35 – 6:49/km",
  },
  {
    value: "pace-km-4-40-to-5-34",
    label: "4:40 – 5:34/km",
  },
  {
    value: "pace-km-3-45-to-4-39",
    label: "3:45 – 4:39/km",
  },
  {
    value: "pace-km-3-15-to-3-44",
    label: "3:15 – 3:44/km",
  },
  {
    value: "pace-km-faster-than-3-15",
    label: "<3:15/km",
  },
] as const;

const weightRangeOptionsImperial = [
  {
    value: "weight-lbs-under-130",
    label: "<130 lbs",
  },
  {
    value: "weight-lbs-130-150",
    label: "130 – 150 lbs",
  },
  {
    value: "weight-lbs-150-170",
    label: "150 – 170 lbs",
  },
  {
    value: "weight-lbs-170-190",
    label: "170 – 190 lbs",
  },
  {
    value: "weight-lbs-190-210",
    label: "190 – 210 lbs",
  },
  {
    value: "weight-lbs-over-210",
    label: ">210 lbs",
  },
] as const;

const weightRangeOptionsMetric = [
  {
    value: "weight-kg-under-60",
    label: "<60 kg",
  },
  {
    value: "weight-kg-60-70",
    label: "60 – 70 kg",
  },
  {
    value: "weight-kg-70-80",
    label: "70 – 80 kg",
  },
  {
    value: "weight-kg-80-90",
    label: "80 – 90 kg",
  },
  {
    value: "weight-kg-90-100",
    label: "90 – 100 kg",
  },
  {
    value: "weight-kg-over-100",
    label: ">100 kg",
  },
] as const;

export default function EditReviewDialog({ open, onClose, review, onSaved }: Props) {
  const {
    toDisplayDistance,
    toBaseDistance,
    distanceUnit,
    weightUnit,
  } = useUnitPreferences();

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [fit, setFit] = useState<string>(NONE_OPTION);
  const [cushion, setCushion] = useState<string>(NONE_OPTION);
  const [stability, setStability] = useState<string>(NONE_OPTION);
  const [mileage, setMileage] = useState<string>("");
  const [paceRange, setPaceRange] = useState<string>(NONE_OPTION);
  const [weightRange, setWeightRange] = useState<string>(NONE_OPTION);
  const [loading, setLoading] = useState(false);

  const ratingLabel = useMemo(() => (rating ? `${rating}/5` : "0/5"), [rating]);

  useEffect(() => {
    if (!review) {
      setRating(0);
      setComment("");
      setFit(NONE_OPTION);
      setCushion(NONE_OPTION);
      setStability(NONE_OPTION);
      setMileage("");
      setPaceRange(NONE_OPTION);
      setWeightRange(NONE_OPTION);
      return;
    }

    setRating(review.rating ?? 0);
    setComment(review.comment ?? "");
    setFit(review.fit ?? NONE_OPTION);
    setCushion(review.cushion ?? NONE_OPTION);
    setStability(review.stability ?? NONE_OPTION);

    // Mileage: display as integer
    const displayMileage = review.mileage != null ? toDisplayDistance(review.mileage) : null;
    setMileage(
      displayMileage != null
        ? Math.round(displayMileage).toString()
        : "",
    );

    // Pace: use range if available, otherwise NONE
    setPaceRange(review.paceRange ?? NONE_OPTION);

    // Weight: use range if available, otherwise NONE
    setWeightRange(review.weightRange ?? NONE_OPTION);
  }, [
    review,
    toDisplayDistance,
    distanceUnit,
  ]);

  async function handleSave() {
    if (!review) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to edit reviews");
      return;
    }

    // Mileage: convert to base units and round to integer
    const mileageNumber = mileage.trim() === "" ? null : Number.parseFloat(mileage);
    const mileageBase =
      mileageNumber !== null && Number.isFinite(mileageNumber)
        ? Math.round(toBaseDistance(mileageNumber))
        : null;

    const body = {
      rating,
      comment,
      fit: fit === NONE_OPTION ? null : (fit as EditableReview["fit"]),
      cushion: cushion === NONE_OPTION ? null : (cushion as EditableReview["cushion"]),
      stability: stability === NONE_OPTION ? null : (stability as EditableReview["stability"]),
      mileage: mileageBase ?? (mileage.trim() === "" ? null : undefined),
      paceRange: paceRange === NONE_OPTION ? null : paceRange,
      weightRange: weightRange === NONE_OPTION ? null : weightRange,
    };

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update review");
      const data: ReviewResponse = await res.json();
      onSaved?.(data);
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
          <DialogDescription>
            Update the details of your review. Fields left blank will be cleared.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <StarRating value={rating} onChange={(val) => setRating(val)} size="lg" />
              <span className="text-sm text-muted-foreground">{ratingLabel}</span>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Required fields marked with *
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Fit</Label>
              <Select value={fit} onValueChange={setFit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fit" />
                </SelectTrigger>
                <SelectContent>
                  {fitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cushion</Label>
              <Select value={cushion} onValueChange={setCushion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cushion" />
                </SelectTrigger>
                <SelectContent>
                  {cushionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Stability</Label>
              <Select value={stability} onValueChange={setStability}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stability" />
                </SelectTrigger>
                <SelectContent>
                  {stabilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mileage ({distanceUnit === "kilometers" ? "km" : "mi"})</Label>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder={`Total ${distanceUnit === "kilometers" ? "km" : "mi"}`}
              />
            </div>

            <div className="space-y-2">
              <Label>Pace range</Label>
              <Select value={paceRange} onValueChange={setPaceRange}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    distanceUnit === "kilometers"
                      ? "Select pace range per km"
                      : "Select pace range per mile"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION}>Not set</SelectItem>
                  {(distanceUnit === "kilometers" ? paceRangeOptionsMetric : paceRangeOptionsImperial).map(
                    (option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Weight range</Label>
              <Select value={weightRange} onValueChange={setWeightRange}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select weight range (${weightUnit})`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION}>Not set</SelectItem>
                  {(weightUnit === "kg" ? weightRangeOptionsMetric : weightRangeOptionsImperial).map(
                    (option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Review <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share how this shoe performs..."
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !rating || !comment.trim()}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

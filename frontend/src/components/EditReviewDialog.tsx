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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnitPreferences } from "@/context/UnitPreferencesContext";
import ConfirmDialog from "@/components/ConfirmDialog";

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
  retired?: boolean | null;
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
    value: "pace-mile-faster-than-6-00",
    label: "<6:00/mile",
  },
  {
    value: "pace-mile-6-00-to-6-59",
    label: "6:00 – 6:59/mile",
  },
  {
    value: "pace-mile-7-00-to-7-59",
    label: "7:00 – 7:59/mile",
  },
  {
    value: "pace-mile-8-00-to-8-59",
    label: "8:00 – 8:59/mile",
  },
  {
    value: "pace-mile-9-00-to-9-59",
    label: "9:00 – 9:59/mile",
  },
  {
    value: "pace-mile-10-00-to-10-59",
    label: "10:00 – 10:59/mile",
  },
  {
    value: "pace-mile-11-00-to-11-59",
    label: "11:00 – 11:59/mile",
  },
  {
    value: "pace-mile-12-00-or-slower",
    label: "≥12:00/mile",
  },
] as const;

const paceRangeOptionsMetric = [
  {
    value: "pace-km-faster-than-3-45",
    label: "<3:45/km",
  },
  {
    value: "pace-km-3-45-to-4-19",
    label: "3:45 – 4:19/km",
  },
  {
    value: "pace-km-4-20-to-4-59",
    label: "4:20 – 4:59/km",
  },
  {
    value: "pace-km-5-00-to-5-39",
    label: "5:00 – 5:39/km",
  },
  {
    value: "pace-km-5-40-to-6-19",
    label: "5:40 – 6:19/km",
  },
  {
    value: "pace-km-6-20-to-6-59",
    label: "6:20 – 6:59/km",
  },
  {
    value: "pace-km-7-00-to-7-29",
    label: "7:00 – 7:29/km",
  },
  {
    value: "pace-km-7-30-or-slower",
    label: "≥7:30/km",
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
    distanceLabel,
    weightUnit,
    weightLabel,
  } = useUnitPreferences();

  const [rating, setRating] = useState<number>(3);
  const [comment, setComment] = useState<string>("");
  const [fit, setFit] = useState<string>(NONE_OPTION);
  const [cushion, setCushion] = useState<string>(NONE_OPTION);
  const [stability, setStability] = useState<string>(NONE_OPTION);
  const [mileage, setMileage] = useState<string>("");
  const [paceRange, setPaceRange] = useState<string>(NONE_OPTION);
  const [weightRange, setWeightRange] = useState<string>(NONE_OPTION);
  const [retired, setRetired] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  
  // Store original values to detect changes
  const [originalValues, setOriginalValues] = useState<{
    rating: number;
    comment: string;
    fit: string;
    cushion: string;
    stability: string;
    mileage: string;
    paceRange: string;
    weightRange: string;
    retired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!review) {
      setRating(3);
      setComment("");
      setFit(NONE_OPTION);
      setCushion(NONE_OPTION);
      setStability(NONE_OPTION);
      setMileage("");
      setPaceRange(NONE_OPTION);
      setWeightRange(NONE_OPTION);
      setRetired(false);
      setOriginalValues(null);
      return;
    }

    const initialRating = review.rating ?? 3;
    const initialComment = review.comment ?? "";
    const initialFit = review.fit ?? NONE_OPTION;
    const initialCushion = review.cushion ?? NONE_OPTION;
    const initialStability = review.stability ?? NONE_OPTION;
    const initialRetired = review.retired ?? false;

    // Mileage: display as integer
    const displayMileage = review.mileage != null ? toDisplayDistance(review.mileage) : null;
    const initialMileage = displayMileage != null
      ? Math.round(displayMileage).toString()
      : "";

    // Pace: use range if available, otherwise NONE
    // Handle empty string, null, and undefined
    let paceRangeValue = NONE_OPTION;
    if (review.paceRange && typeof review.paceRange === 'string' && review.paceRange.trim() !== "") {
      paceRangeValue = review.paceRange.trim();
    }

    // Weight: use range if available, otherwise NONE
    // Handle empty string, null, and undefined
    const weightRangeValue = (review.weightRange && typeof review.weightRange === 'string' && review.weightRange.trim() !== "") 
      ? review.weightRange.trim()
      : NONE_OPTION;

    // Set current values
    setRating(initialRating);
    setComment(initialComment);
    setFit(initialFit);
    setCushion(initialCushion);
    setStability(initialStability);
    setMileage(initialMileage);
    setPaceRange(paceRangeValue);
    setWeightRange(weightRangeValue);
    setRetired(initialRetired);

    // Store original values for change detection
    setOriginalValues({
      rating: initialRating,
      comment: initialComment,
      fit: initialFit,
      cushion: initialCushion,
      stability: initialStability,
      mileage: initialMileage,
      paceRange: paceRangeValue,
      weightRange: weightRangeValue,
      retired: initialRetired,
    });
  }, [
    review,
    toDisplayDistance,
    distanceUnit,
  ]);

  // Check if any fields have been changed
  function hasUnsavedChanges(): boolean {
    if (!originalValues) return false;

    return (
      rating !== originalValues.rating ||
      comment.trim() !== originalValues.comment.trim() ||
      fit !== originalValues.fit ||
      cushion !== originalValues.cushion ||
      stability !== originalValues.stability ||
      mileage.trim() !== originalValues.mileage.trim() ||
      paceRange !== originalValues.paceRange ||
      weightRange !== originalValues.weightRange ||
      retired !== originalValues.retired
    );
  }

  function handleClose() {
    if (hasUnsavedChanges() && !showConfirmDialog) {
      setPendingClose(true);
      setShowConfirmDialog(true);
    } else if (!hasUnsavedChanges()) {
      onClose();
    }
  }

  function handleConfirmClose() {
    setShowConfirmDialog(false);
    setPendingClose(false);
    onClose();
  }

  function handleCancelClose() {
    setShowConfirmDialog(false);
    setPendingClose(false);
  }

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
      retired: retired,
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
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen && !showConfirmDialog) {
            handleClose();
          }
        }}
      >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto my-4 sm:my-0">
        <DialogHeader>
          <div className="mb-6">
            <span className="tracking-widest text-[#007bff] block mb-2 font-bold">EDIT</span>
            <DialogTitle 
              className="text-4xl lg:text-5xl leading-[0.9] mb-4 relative" 
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
            >
              REVIEW
              <div className="absolute -bottom-2 left-0 w-16 h-1 bg-[#007bff]"></div>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3">
              <label className="block mb-2 tracking-wider text-base">
                OVERALL RATING *
              </label>
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-all hover:scale-125 active:scale-95"
                  >
                    <Star
                      className={cn(
                        "size-6 transition-all duration-200",
                        star <= rating
                          ? 'fill-[#007bff] text-[#007bff] drop-shadow-md'
                          : 'text-neutral-300 hover:text-neutral-400'
                      )}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="tracking-wide text-neutral-600">
                  {rating} out of 5 stars
                </p>
              )}
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
              Required fields marked with *
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block tracking-wider text-base mb-3">
                FIT
              </label>
              <Select value={fit} onValueChange={setFit}>
                <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
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
              <label className="block tracking-wider text-base mb-3">
                CUSHION
              </label>
              <Select value={cushion} onValueChange={setCushion}>
                <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
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
              <label className="block tracking-wider text-base mb-3">
                STABILITY
              </label>
              <Select value={stability} onValueChange={setStability}>
                <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
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
              <label className="block tracking-wider text-base mb-3">
                MILEAGE ON SHOE ({distanceLabel.toUpperCase()})
              </label>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={0.1}
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder={distanceUnit === "kilometers" ? "Enter total kilometers" : "Enter total miles"}
                className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="block tracking-wider text-base mb-3">
                PACE RANGE
              </label>
              <Select 
                value={paceRange} 
                onValueChange={setPaceRange}
              >
                <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
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
              <label className="block tracking-wider text-base mb-3">
                WEIGHT RANGE
              </label>
              <Select 
                value={weightRange || NONE_OPTION} 
                onValueChange={setWeightRange}
                key={`weight-${weightRange}-${weightUnit}`}
              >
                <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
                  <SelectValue placeholder={`Select weight range (${weightLabel})`} />
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
            <label className="block tracking-wider text-base mb-3">
              SHOE STATUS
            </label>
            <div className="flex items-center space-x-3 px-3 border-2 border-black rounded-sm h-14 shadow-sm hover:shadow-blue-sm transition-all">
              <Checkbox
                id="retired-edit"
                checked={retired}
                onCheckedChange={(checked) => setRetired(checked === true)}
                className="border-2 border-black data-[state=checked]:bg-[#007bff] data-[state=checked]:border-[#007bff]"
              />
              <label
                htmlFor="retired-edit"
                className="text-sm tracking-wider cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
              >
                Shoe has been retired
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                    aria-label="Learn more about retired shoes"
                  >
                    <Info className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" side="top" align="end">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">About Retired Shoes</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Check this box if the shoe has been retired due to wear or excessive use. 
                      If the shoe is no longer in use because you don't like it, please indicate 
                      that in your review description instead.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block tracking-wider text-base mb-3">
              REVIEW <span className="text-[#007bff]">*</span>
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share how this shoe performs..."
              className="border-2 border-black tracking-wider shadow-sm hover:shadow-blue-sm transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !rating || !comment.trim()}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <ConfirmDialog
      open={showConfirmDialog}
      title="Unsaved Changes"
      description="You have unsaved changes. Are you sure you want to close? Your changes will be lost."
      onConfirm={handleConfirmClose}
      onClose={handleCancelClose}
      confirmLabel="Discard Changes"
      confirmVariant="destructive"
    />
    </>
  );
}

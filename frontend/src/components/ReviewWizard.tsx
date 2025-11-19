"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { ShoeCombobox } from "@/components/ShoeCombobox";
import { cn } from "@/lib/utils";
import { useUnitPreferences } from "@/context/UnitPreferencesContext";

type ShoeOption = { id: number; label: string; brand: string; model: string };

const fitOptions = [
  { value: "SMALL", label: "Runs small" },
  { value: "TRUE_TO_SIZE", label: "True to size" },
  { value: "BIG", label: "Runs big" },
] as const;

const cushionOptions = [
  { value: "SOFT", label: "Soft" },
  { value: "BALANCED", label: "Balanced" },
  { value: "FIRM", label: "Firm" },
] as const;

const stabilityOptions = [
  { value: "NEUTRAL", label: "Neutral" },
  { value: "MODERATE_SUPPORT", label: "Moderate support" },
  { value: "HIGH_SUPPORT", label: "High support" },
] as const;

const paceRangeOptionsImperial = [
  {
    value: "pace-mile-slower-than-11",
    label: ">11:00/mile",
    minutes: 11,
    seconds: 0,
  },
  {
    value: "pace-mile-9-31-to-10-59",
    label: "9:31 – 10:59/mile",
    minutes: 10,
    seconds: 15,
  },
  {
    value: "pace-mile-8-01-to-9-30",
    label: "8:01 – 9:30/mile",
    minutes: 8,
    seconds: 45,
  },
  {
    value: "pace-mile-6-31-to-8-00",
    label: "6:31 – 8:00/mile",
    minutes: 7,
    seconds: 15,
  },
  {
    value: "pace-mile-5-51-to-6-30",
    label: "5:51 – 6:30/mile",
    minutes: 6,
    seconds: 10,
  },
  {
    value: "pace-mile-faster-than-5-50",
    label: "<5:50/mile",
    minutes: 5,
    seconds: 30,
  },
] as const;

const paceRangeOptionsMetric = [
  {
    value: "pace-km-slower-than-6-50",
    label: ">6:50/km",
    minutes: 6,
    seconds: 50,
  },
  {
    value: "pace-km-5-35-to-6-49",
    label: "5:35 – 6:49/km",
    minutes: 6,
    seconds: 12,
  },
  {
    value: "pace-km-4-40-to-5-34",
    label: "4:40 – 5:34/km",
    minutes: 5,
    seconds: 7,
  },
  {
    value: "pace-km-3-45-to-4-39",
    label: "3:45 – 4:39/km",
    minutes: 4,
    seconds: 12,
  },
  {
    value: "pace-km-3-15-to-3-44",
    label: "3:15 – 3:44/km",
    minutes: 3,
    seconds: 30,
  },
  {
    value: "pace-km-faster-than-3-15",
    label: "<3:15/km",
    minutes: 3,
    seconds: 0,
  },
] as const;

const weightRangeOptionsImperial = [
  {
    value: "weight-lbs-under-130",
    label: "<130 lbs",
    average: 125,
  },
  {
    value: "weight-lbs-130-150",
    label: "130 – 150 lbs",
    average: 140,
  },
  {
    value: "weight-lbs-150-170",
    label: "150 – 170 lbs",
    average: 160,
  },
  {
    value: "weight-lbs-170-190",
    label: "170 – 190 lbs",
    average: 180,
  },
  {
    value: "weight-lbs-190-210",
    label: "190 – 210 lbs",
    average: 200,
  },
  {
    value: "weight-lbs-over-210",
    label: ">210 lbs",
    average: 220,
  },
] as const;

const weightRangeOptionsMetric = [
  {
    value: "weight-kg-under-60",
    label: "<60 kg",
    average: 55,
  },
  {
    value: "weight-kg-60-70",
    label: "60 – 70 kg",
    average: 65,
  },
  {
    value: "weight-kg-70-80",
    label: "70 – 80 kg",
    average: 75,
  },
  {
    value: "weight-kg-80-90",
    label: "80 – 90 kg",
    average: 85,
  },
  {
    value: "weight-kg-90-100",
    label: "90 – 100 kg",
    average: 95,
  },
  {
    value: "weight-kg-over-100",
    label: ">100 kg",
    average: 105,
  },
] as const;

const steps = [
  "Choose shoe",
  "Fit, cushion, stability",
  "Mileage & profile",
  "Rating & review",
] as const;

type FitValue = (typeof fitOptions)[number]["value"];
type CushionValue = (typeof cushionOptions)[number]["value"];
type StabilityValue = (typeof stabilityOptions)[number]["value"];

type ApiShoe = {
  id: number;
  brand: string;
  model: string;
};

interface ReviewSummaryProps {
  shoe?: string | null;
  fit: FitValue;
  cushion: CushionValue;
  stability: StabilityValue;
  fitTouched: boolean;
  cushionTouched: boolean;
  stabilityTouched: boolean;
  mileage: string;
  paceRangeLabel: string;
  paceTouched: boolean;
  rating: number;
  ratingTouched: boolean;
  comment: string;
  weightRangeLabel: string;
  weightTouched: boolean;
}

function ReviewSummary({
  shoe,
  fit,
  cushion,
  stability,
  fitTouched,
  cushionTouched,
  stabilityTouched,
  mileage,
  paceRangeLabel,
  paceTouched,
  rating,
  ratingTouched,
  comment,
  weightRangeLabel,
  weightTouched,
}: ReviewSummaryProps) {
  const { distanceLabel } = useUnitPreferences();
  const hasShoe = Boolean(shoe);
  const hasFit = fitTouched;
  const hasCushion = cushionTouched;
  const hasStability = stabilityTouched;
  const hasMileage = mileage.trim() !== "";
  const hasPace = paceTouched && paceRangeLabel.trim() !== "";
  const hasRating = ratingTouched;
  const hasComment = comment.trim() !== "";
  const hasWeight = weightTouched && weightRangeLabel.trim() !== "";

  if (
    !hasShoe &&
    !hasFit &&
    !hasCushion &&
    !hasStability &&
    !hasMileage &&
    !hasPace &&
    !hasRating &&
    !hasComment &&
    !hasWeight
  ) {
    return null;
  }

  return (
    <div className="rounded-md border border-border/60 bg-background/60 p-4 text-sm text-card-foreground/90">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Current selections
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {hasShoe && <SummaryRow label="Shoe" value={shoe ?? ""} />}
        {hasFit && <SummaryRow label="Fit" value={fit.replace(/_/g, " ")} />}
        {hasCushion && <SummaryRow label="Cushion" value={cushion.replace(/_/g, " ")} />}
        {hasStability && <SummaryRow label="Stability" value={stability.replace(/_/g, " ")} />}
        {hasMileage && <SummaryRow label="Mileage" value={`${mileage} ${distanceLabel}`} />}
        {hasPace && <SummaryRow label="Pace range" value={paceRangeLabel} />}
        {hasRating && <SummaryRow label="Rating" value={`${rating}/5`} />}
        {hasWeight && <SummaryRow label="Weight range" value={weightRangeLabel} />}
      </div>
      {hasComment && (
        <div className="mt-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Comment
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">{comment}</p>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

interface ReviewWizardProps {
  initialShoeId?: number | null;
  onSuccess?: (shoeId: number) => void;
  layout?: "page" | "modal";
}

export default function ReviewWizard({
  initialShoeId,
  onSuccess,
  layout = "page",
}: ReviewWizardProps) {
  const {
    distanceUnit,
    distanceLabel,
    toBaseDistance,
    toBasePace,
    weightUnit,
    weightLabel,
    toBaseWeight,
  } = useUnitPreferences();

  const [activeStep, setActiveStep] = useState(0);
  const [shoes, setShoes] = useState<ShoeOption[]>([]);
  const [selectedShoe, setSelectedShoe] = useState<ShoeOption | null>(null);

  const [fit, setFit] = useState<FitValue>("TRUE_TO_SIZE");
  const [cushion, setCushion] = useState<CushionValue>("BALANCED");
  const [stability, setStability] = useState<StabilityValue>("NEUTRAL");
  const [fitTouched, setFitTouched] = useState(false);
  const [cushionTouched, setCushionTouched] = useState(false);
  const [stabilityTouched, setStabilityTouched] = useState(false);

  const [mileage, setMileage] = useState<string>("");
  const [paceMinutes, setPaceMinutes] = useState<string>("");
  const [paceSeconds, setPaceSeconds] = useState<string>("");
  const [paceRange, setPaceRange] = useState<string>("");
  const [paceRangeLabel, setPaceRangeLabel] = useState<string>("");
  const [paceTouched, setPaceTouched] = useState(false);

  const [rating, setRating] = useState<number>(3);
  const [ratingTouched, setRatingTouched] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [weightRange, setWeightRange] = useState<string>("");
  const [weightRangeLabel, setWeightRangeLabel] = useState<string>("");
  const [weightTouched, setWeightTouched] = useState(false);
  const [weight, setWeight] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:3001/shoes");
      const data: ApiShoe[] = await res.json();
      const options: ShoeOption[] = (data || []).map((s) => ({
        id: s.id,
        brand: s.brand,
        model: s.model,
        label: `${s.brand} ${s.model}`,
      }));
      setShoes(options);
    })();
  }, []);

  useEffect(() => {
    if (initialShoeId == null || shoes.length === 0) return;
    const match = shoes.find((shoe) => shoe.id === initialShoeId) ?? null;
    if (match) {
      setSelectedShoe(match);
    }
  }, [initialShoeId, shoes]);

  useEffect(() => {
    setPaceRange("");
    setPaceRangeLabel("");
    setPaceMinutes("");
    setPaceSeconds("");
    setPaceTouched(false);
  }, [distanceUnit]);

  useEffect(() => {
    setWeightRange("");
    setWeightRangeLabel("");
    setWeight(null);
    setWeightTouched(false);
  }, [weightUnit]);

  const canContinue = useMemo(() => {
    if (activeStep === 0) return Boolean(selectedShoe);
    if (activeStep === 1) return Boolean(fit && cushion && stability && mileage);
    if (activeStep === 2) return Boolean(paceRange && weightRange);
    if (activeStep === 3) return Boolean(rating && comment.trim());
    return true;
  }, [
    activeStep,
    selectedShoe,
    fit,
    cushion,
    stability,
    mileage,
    paceRange,
    weightRange,
    rating,
    comment,
  ]);

  const handleNext = () =>
    setActiveStep((prev) => {
      if (prev === 1) {
        setFitTouched(true);
        setCushionTouched(true);
        setStabilityTouched(true);
      }
      return Math.min(prev + 1, steps.length - 1);
    });

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  function resetWizard() {
    setActiveStep(0);
    setFit("TRUE_TO_SIZE");
    setCushion("BALANCED");
    setStability("NEUTRAL");
    setFitTouched(false);
    setCushionTouched(false);
    setStabilityTouched(false);
    setMileage("");
    setPaceMinutes("");
    setPaceSeconds("");
    setPaceRange("");
    setPaceRangeLabel("");
    setPaceTouched(false);
    setRating(3);
    setRatingTouched(false);
    setComment("");
    setWeightRange("");
    setWeightRangeLabel("");
    setWeightTouched(false);
    setWeight(null);
    if (initialShoeId == null) {
      setSelectedShoe(null);
    }
  }

  async function submit() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      alert("Please login first");
      return;
    }

    if (!selectedShoe) {
      alert("Select a shoe before submitting");
      return;
    }

    if (!rating) {
      alert("Rating is required");
      return;
    }

    const mileageNumber = mileage.trim() === "" ? undefined : Number.parseFloat(mileage);
    const paceMinutesNumber =
      paceMinutes.trim() === "" ? undefined : Number.parseFloat(paceMinutes);
    const paceSecondsNumber =
      paceSeconds.trim() === "" ? undefined : Number.parseFloat(paceSeconds);
    const weightNumber = weight !== null && Number.isFinite(weight) ? Math.round(weight) : undefined;

    const mileageBase =
      mileageNumber !== undefined && Number.isFinite(mileageNumber)
        ? toBaseDistance(mileageNumber)
        : undefined;

    const basePace =
      paceMinutesNumber !== undefined &&
      paceSecondsNumber !== undefined &&
      Number.isFinite(paceMinutesNumber) &&
      Number.isFinite(paceSecondsNumber)
        ? toBasePace({
            minutes: paceMinutesNumber,
            seconds: paceSecondsNumber,
          })
        : null;

    const body = {
      shoeId: selectedShoe.id,
      rating,
      comment,
      fit,
      cushion,
      stability,
      mileage: mileageBase,
      paceRange: paceRange || undefined,
      weightRange: weightRange || undefined,
    };

    const res = await fetch("http://localhost:3001/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      alert(`Failed: ${err}`);
      return;
    }

    onSuccess?.(selectedShoe.id);
    resetWizard();
  }

  const isPageLayout = layout === "page";

  return (
    <div
      className={cn(
        "flex flex-col gap-8",
        isPageLayout ? "mx-auto max-w-4xl px-6 py-10" : "px-1 py-1"
      )}
    >
      {isPageLayout && (
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Review your shoe</h1>
          <p className="text-sm text-muted-foreground">
            Share detailed feedback to help runners pick the right pair.
          </p>
        </div>
      )}

      <ol className="flex flex-nowrap items-center gap-3 overflow-x-auto whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em]">
        {steps.map((label, idx) => {
          const status = idx === activeStep ? "active" : idx < activeStep ? "complete" : "upcoming";
          return (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-sm transition",
                  status === "active" && "border-primary bg-primary text-primary-foreground",
                  status === "complete" && "border-primary bg-primary/10 text-primary",
                  status === "upcoming" && "border-border text-muted-foreground"
                )}
              >
                {idx + 1}
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "text-xs tracking-[0.08em] transition",
                  status === "active" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </button>
              {idx < steps.length - 1 && <span className="text-muted-foreground opacity-40">/</span>}
            </li>
          );
        })}
      </ol>

      <Card className="border border-border/70 bg-card/80 backdrop-blur">
        <CardContent className={cn("space-y-6", isPageLayout ? "p-6" : "p-4")}>
          {activeStep === 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">Which shoe?</label>
              <ShoeCombobox
                options={shoes.map(({ id, label }) => ({ id, label }))}
                value={selectedShoe?.id ?? null}
                onSelect={(option) => {
                  if (!option) {
                    setSelectedShoe(null);
                    return;
                  }
                  const match = shoes.find((shoe) => shoe.id === option.id) ?? null;
                  setSelectedShoe(match);
                }}
              />
            </div>
          )}

          {activeStep === 1 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Fit</label>
                <Select
                  value={fit}
                  onValueChange={(value) => {
                    setFit(value as FitValue);
                    setFitTouched(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <label className="text-sm font-medium text-muted-foreground">Cushion</label>
                <Select
                  value={cushion}
                  onValueChange={(value) => {
                    setCushion(value as CushionValue);
                    setCushionTouched(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <label className="text-sm font-medium text-muted-foreground">Stability</label>
                <Select
                  value={stability}
                  onValueChange={(value) => {
                    setStability(value as StabilityValue);
                    setStabilityTouched(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <label className="text-sm font-medium text-muted-foreground">
                  Mileage on shoe ({distanceLabel})
                </label>
                <Input
                  type="number"
                  min={0}
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder={distanceUnit === "kilometers" ? "Total kilometers" : "Total miles"}
                />
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Pace range</label>
                <Select
                  value={paceRange}
                  onValueChange={(value) => {
                    const options =
                      distanceUnit === "kilometers" ? paceRangeOptionsMetric : paceRangeOptionsImperial;
                    const selected = options.find((option) => option.value === value);
                    setPaceRange(value);
                    setPaceRangeLabel(selected?.label ?? "");
                    setPaceTouched(true);
                    if (selected) {
                      setPaceMinutes(selected.minutes.toString());
                      setPaceSeconds(selected.seconds.toString());
                    } else {
                      setPaceMinutes("");
                      setPaceSeconds("");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        distanceUnit === "kilometers"
                          ? "Select pace range per km"
                          : "Select pace range per mile"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
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
                <label className="text-sm font-medium text-muted-foreground">Weight range</label>
                <Select
                  value={weightRange}
                  onValueChange={(value) => {
                    const options =
                      weightUnit === "kg" ? weightRangeOptionsMetric : weightRangeOptionsImperial;
                    const selected = options.find((option) => option.value === value);
                    setWeightRange(value);
                    setWeightRangeLabel(selected?.label ?? "");
                    setWeightTouched(true);
                    if (selected) {
                      setWeight(toBaseWeight(selected.average));
                    } else {
                      setWeight(null);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select weight range (${weightLabel})`} />
                  </SelectTrigger>
                  <SelectContent>
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
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <StarRating
                  value={rating}
                  onChange={(val) => {
                    setRating(val);
                    setRatingTouched(true);
                  }}
                  size="lg"
                />
                {ratingTouched ? (
                  <span className="text-sm text-muted-foreground">{rating}/5</span>
                ) : null}
              </div>
              <Textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell other runners about the fit, ride, and how you use this shoe."
              />
            </div>
          )}

          <ReviewSummary
            shoe={selectedShoe?.label}
            fit={fit}
            cushion={cushion}
            stability={stability}
            fitTouched={fitTouched}
            cushionTouched={cushionTouched}
            stabilityTouched={stabilityTouched}
            mileage={mileage}
            paceRangeLabel={paceRangeLabel}
            paceTouched={paceTouched}
            rating={rating}
            ratingTouched={ratingTouched}
            comment={comment}
            weightRangeLabel={weightRangeLabel}
            weightTouched={weightTouched}
          />

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            {activeStep < steps.length - 1 && (
              <Button disabled={!canContinue} onClick={handleNext}>
                Continue
              </Button>
            )}
            {activeStep === steps.length - 1 && (
              <Button onClick={submit}>
                Submit review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


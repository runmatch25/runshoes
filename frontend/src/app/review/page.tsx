"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

const steps = [
  "Choose shoe",
  "Fit, cushion, stability",
  "Mileage & pace",
  "Rating & review",
];

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
  paceMinutes: string;
  paceSeconds: string;
  rating: number;
  ratingTouched: boolean;
  comment: string;
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
  paceMinutes,
  paceSeconds,
  rating,
  ratingTouched,
  comment,
}: ReviewSummaryProps) {
  const hasShoe = Boolean(shoe);
  const hasFit = fitTouched;
  const hasCushion = cushionTouched;
  const hasStability = stabilityTouched;
  const hasMileage = mileage.trim() !== "";
  const hasPace = paceMinutes.trim() !== "" || paceSeconds.trim() !== "";
  const hasRating = ratingTouched;
  const hasComment = comment.trim() !== "";

  if (!hasShoe && !hasFit && !hasCushion && !hasStability && !hasMileage && !hasPace && !hasRating && !hasComment) {
    return null;
  }

  return (
    <div className="rounded-md border border-border/60 bg-background/60 p-4 text-sm text-card-foreground/90">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Current selections</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {hasShoe && <SummaryRow label="Shoe" value={shoe ?? ""} />}
        {hasFit && <SummaryRow label="Fit" value={fit.replace(/_/g, " ")} />}
        {hasCushion && <SummaryRow label="Cushion" value={cushion.replace(/_/g, " ")} />}
        {hasStability && <SummaryRow label="Stability" value={stability.replace(/_/g, " ")} />}
        {hasMileage && <SummaryRow label="Mileage" value={mileage} />}
        {hasPace && (
          <SummaryRow label="Pace" value={`${paceMinutes || "0"}m ${paceSeconds || "0"}s`} />
        )}
        {hasRating && <SummaryRow label="Rating" value={`${rating}/5`} />}
      </div>
      {hasComment && (
        <div className="mt-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Comment</div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">{comment}</p>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

export default function ReviewWizardPage() {
  const router = useRouter();

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

  const [rating, setRating] = useState<number>(3);
  const [ratingTouched, setRatingTouched] = useState(false);
  const [comment, setComment] = useState<string>("");

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

  const canContinue = useMemo(() => {
    if (activeStep === 0) return Boolean(selectedShoe);
    if (activeStep === 1) return Boolean(fit && cushion && stability);
    if (activeStep === 2) return Boolean(mileage && paceMinutes !== "" && paceSeconds !== "");
    if (activeStep === 3) return Boolean(rating && comment.trim());
    return true;
  }, [activeStep, selectedShoe, fit, cushion, stability, mileage, paceMinutes, paceSeconds, rating, comment]);

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

    const body = {
      shoeId: selectedShoe.id,
      rating,
      comment,
      fit,
      cushion,
      stability,
      mileage: mileage ? Number(mileage) : undefined,
      paceMinutes: paceMinutes === "" ? undefined : Number(paceMinutes),
      paceSeconds: paceSeconds === "" ? undefined : Number(paceSeconds),
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
    router.push(`/shoes/${selectedShoe.id}`);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">Review your shoe</h1>
        <p className="text-sm text-muted-foreground">Share detailed feedback to help runners pick the right pair.</p>
        <ol className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]">
          {steps.map((label, idx) => {
            const status = idx === activeStep ? "active" : idx < activeStep ? "complete" : "upcoming";
            return (
              <li key={label} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition",
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
                    "text-[10px] tracking-[0.18em] transition",
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
      </div>

      <Card className="border border-border/70 bg-card/80 backdrop-blur">
        <CardContent className="space-y-6 p-6">
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
            </div>
          )}

          {activeStep === 2 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Mileage on shoe</label>
                <Input
                  type="number"
                  min={0}
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="Total miles/km"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Avg pace minutes</label>
                <Input
                  type="number"
                  min={0}
                  value={paceMinutes}
                  onChange={(e) => setPaceMinutes(e.target.value)}
                  placeholder="Minutes"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Avg pace seconds</label>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={paceSeconds}
                  onChange={(e) => setPaceSeconds(e.target.value)}
                  placeholder="Seconds"
                />
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
            paceMinutes={paceMinutes}
            paceSeconds={paceSeconds}
            rating={rating}
            ratingTouched={ratingTouched}
            comment={comment}
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


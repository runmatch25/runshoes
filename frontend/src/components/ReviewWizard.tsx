"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ArrowRight, ArrowLeft, Star, Footprints, Users, Sparkles, Calendar, MapPin, Info } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

const categoryOptions = [
  { value: "Daily trainer", label: "Daily trainer" },
  { value: "Tempo", label: "Tempo" },
  { value: "Racing", label: "Racing" },
  { value: "Long run", label: "Long run" },
  { value: "Trail", label: "Trail" },
] as const;

// Category color mapping
const getCategoryColor = (category: string): { bg: string; text: string } => {
  switch (category) {
    case "Daily trainer":
      return { bg: "#007bff", text: "#ffffff" };
    case "Tempo":
      return { bg: "#FF8A3D", text: "#ffffff" };
    case "Racing":
      return { bg: "#E53935", text: "#ffffff" };
    case "Long run":
      return { bg: "#4CAF50", text: "#ffffff" };
    case "Trail":
      return { bg: "#6D4C41", text: "#ffffff" };
    default:
      return { bg: "#6b7280", text: "#ffffff" };
  }
};

const paceRangeOptionsImperial = [
  {
    value: "pace-mile-faster-than-6-00",
    label: "<6:00/mile",
    minutes: 5,
    seconds: 59,
  },
  {
    value: "pace-mile-6-00-to-6-59",
    label: "6:00 – 6:59/mile",
    minutes: 6,
    seconds: 30,
  },
  {
    value: "pace-mile-7-00-to-7-59",
    label: "7:00 – 7:59/mile",
    minutes: 7,
    seconds: 30,
  },
  {
    value: "pace-mile-8-00-to-8-59",
    label: "8:00 – 8:59/mile",
    minutes: 8,
    seconds: 30,
  },
  {
    value: "pace-mile-9-00-to-9-59",
    label: "9:00 – 9:59/mile",
    minutes: 9,
    seconds: 30,
  },
  {
    value: "pace-mile-10-00-to-10-59",
    label: "10:00 – 10:59/mile",
    minutes: 10,
    seconds: 30,
  },
  {
    value: "pace-mile-11-00-to-11-59",
    label: "11:00 – 11:59/mile",
    minutes: 11,
    seconds: 30,
  },
  {
    value: "pace-mile-12-00-or-slower",
    label: "≥12:00/mile",
    minutes: 12,
    seconds: 0,
  },
] as const;

const paceRangeOptionsMetric = [
  {
    value: "pace-km-faster-than-3-45",
    label: "<3:45/km",
    minutes: 3,
    seconds: 44,
  },
  {
    value: "pace-km-3-45-to-4-19",
    label: "3:45 – 4:19/km",
    minutes: 4,
    seconds: 2,
  },
  {
    value: "pace-km-4-20-to-4-59",
    label: "4:20 – 4:59/km",
    minutes: 4,
    seconds: 40,
  },
  {
    value: "pace-km-5-00-to-5-39",
    label: "5:00 – 5:39/km",
    minutes: 5,
    seconds: 20,
  },
  {
    value: "pace-km-5-40-to-6-19",
    label: "5:40 – 6:19/km",
    minutes: 6,
    seconds: 0,
  },
  {
    value: "pace-km-6-20-to-6-59",
    label: "6:20 – 6:59/km",
    minutes: 6,
    seconds: 40,
  },
  {
    value: "pace-km-7-00-to-7-29",
    label: "7:00 – 7:29/km",
    minutes: 7,
    seconds: 15,
  },
  {
    value: "pace-km-7-30-or-slower",
    label: "≥7:30/km",
    minutes: 7,
    seconds: 30,
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
  categories: string[];
  categoriesTouched: boolean;
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
  categories,
  categoriesTouched,
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
  const hasCategories = categoriesTouched && categories.length > 0;

  if (
    !hasShoe &&
    !hasFit &&
    !hasCushion &&
    !hasStability &&
    !hasMileage &&
    !hasPace &&
    !hasRating &&
    !hasComment &&
    !hasWeight &&
    !hasCategories
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
        {hasCategories && <SummaryRow label="Categories" value={categories.join(", ")} />}
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
  const [retired, setRetired] = useState<boolean>(false);
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
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesTouched, setCategoriesTouched] = useState(false);

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
    // Autofill paceRange and weightRange from user profile when reaching step 2
    // Only autofill if fields are empty (not manually set)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || activeStep !== 2) return;

    (async () => {
      try {
        const res = await fetch("http://localhost:3001/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const user = await res.json();
          if (user?.paceRange && paceRange === "") {
            // Only autofill if the user's paceRange matches the current unit
            const isMetricPace = user.paceRange.startsWith("pace-km-");
            const isMetricUnit = distanceUnit === "kilometers";
            if (isMetricPace === isMetricUnit) {
              const options = isMetricUnit ? paceRangeOptionsMetric : paceRangeOptionsImperial;
              const selected = options.find((opt) => opt.value === user.paceRange);
              if (selected) {
                setPaceRange(user.paceRange);
                setPaceRangeLabel(selected.label);
                setPaceMinutes(selected.minutes.toString());
                setPaceSeconds(selected.seconds.toString());
              }
            }
          }
          if (user?.weightRange && weightRange === "") {
            // Only autofill if the user's weightRange matches the current unit
            const isMetricWeight = user.weightRange.startsWith("weight-kg-");
            const isMetricUnit = weightUnit === "kg";
            if (isMetricWeight === isMetricUnit) {
              const options = isMetricUnit ? weightRangeOptionsMetric : weightRangeOptionsImperial;
              const selected = options.find((opt) => opt.value === user.weightRange);
              if (selected) {
                setWeightRange(user.weightRange);
                setWeightRangeLabel(selected.label);
                setWeight(toBaseWeight(selected.average));
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile for autofill:", error);
      }
    })();
  }, [activeStep, distanceUnit, weightUnit]); // Re-run when step changes to 2 or units change

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
    if (activeStep === 1) return Boolean(fit && cushion && stability);
    if (activeStep === 2) return Boolean(paceRange && weightRange && mileage);
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
    setRetired(false);
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
    setCategories([]);
    setCategoriesTouched(false);
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
      retired,
      paceRange: paceRange || undefined,
      weightRange: weightRange || undefined,
      categories: categories.length > 0 ? categories : undefined,
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

  const isStepComplete = (stepIndex: number) => {
    if (stepIndex === 0) return Boolean(selectedShoe);
    if (stepIndex === 1) return Boolean(fit && cushion && stability);
    if (stepIndex === 2) return Boolean(paceRange && weightRange && mileage);
    if (stepIndex === 3) return Boolean(rating && comment.trim());
    return false;
  };

  const stepDescriptions = [
    "Select the shoe you want to review",
    "How does the shoe perform?",
    "Your running profile",
    "Share your experience",
  ];

  const stepIcons = [
    Footprints, // Step 1: Choose shoe
    Users, // Step 2: Fit, cushion, stability
    Sparkles, // Step 3: Mileage & profile
    Star, // Step 4: Rating & review
  ];

  const stepTitles = [
    "Choose shoe",
    "Fit, cushion, stability",
    "Mileage & profile",
    "Rating & review",
  ];

  return (
    <div
      className={cn(
        "flex flex-col",
        isPageLayout ? "mx-auto max-w-[1400px] px-6 lg:px-12 py-6 lg:py-8" : "px-4 py-4"
      )}
    >
      {isPageLayout && (
        <>
          {/* Page Header */}
          <section className="py-6 lg:py-8 border-b-2 border-black mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="tracking-widest text-[#007bff] block mb-2">CONTRIBUTE</span>
                <h1 
                  className="text-5xl lg:text-7xl leading-[0.9]" 
                  style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
                >
                  REVIEW YOUR<br />
                  <span className="text-[#007bff]">SHOE</span>
                </h1>
              </div>
            </div>
            <p className="text-neutral-600 max-w-2xl leading-relaxed">
              Share detailed feedback to help runners pick the right pair
            </p>
          </section>
        </>
      )}

      {/* Mobile: Horizontal Progress Indicator */}
      <div className="lg:hidden mb-6">
        <div className="relative">
          {/* Connecting Lines */}
          <div className="absolute left-[12.5%] right-[12.5%] top-5 -z-10 h-0.5 bg-gray-200" />
          <div 
            className="absolute left-[12.5%] top-5 -z-10 h-0.5 bg-[#007bff] transition-all duration-500"
            style={{ width: `${(activeStep / (steps.length - 1)) * 75}%` }}
          />

          <div className="grid grid-cols-4">
            {steps.map((_, index) => {
              const Icon = stepIcons[index];
              const isActive = index === activeStep;
              const isComplete = index < activeStep && isStepComplete(index);
              return (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="relative z-10">
                    <div
                      className={cn(
                        "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                        isActive
                          ? "border-[#007bff] bg-[#007bff] text-white shadow-lg"
                          : isComplete
                          ? "border-[#007bff] bg-[#007bff] text-white"
                          : "border-gray-300 bg-white text-gray-400"
                      )}
                    >
                      {isComplete ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className={cn(
                          "h-5 w-5",
                          isActive ? "text-white" : "text-gray-400"
                        )} />
                      )}
                    </div>
                    <p className={cn(
                      "text-xs font-medium transition-colors",
                      isActive ? "text-[#007bff]" : isComplete ? "text-gray-900" : "text-gray-400"
                    )}>
                      {stepTitles[index]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two-column layout: Steps on left, Content on right */}
      <div className={cn(
        "grid gap-6",
        isPageLayout ? "lg:grid-cols-[300px_1fr]" : "lg:grid-cols-[250px_1fr]"
      )}>
        {/* Left: Vertical Progress Indicator */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div 
                className="absolute left-6 top-0 w-0.5 bg-[#007bff] transition-all duration-500"
                style={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
              />

              {/* Steps */}
              <div className="space-y-8">
                {steps.map((_, index) => {
                  const Icon = stepIcons[index];
                  const isActive = index === activeStep;
                  const isComplete = index < activeStep && isStepComplete(index);
                  const isPending = index > activeStep;

                  return (
                    <div key={index} className="relative flex items-start gap-4">
                      {/* Step circle */}
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300",
                            isActive
                              ? "border-[#007bff] bg-[#007bff] text-white shadow-lg"
                              : isComplete
                              ? "border-[#007bff] bg-[#007bff] text-white"
                              : "border-gray-300 bg-white text-gray-400"
                          )}
                        >
                          {isComplete ? (
                            <Check className="h-6 w-6" />
                          ) : (
                            <Icon className={cn(
                              "h-6 w-6",
                              isActive ? "text-white" : "text-gray-400"
                            )} />
                          )}
                        </div>
                      </div>

                      {/* Step info */}
                      <div className="flex-1 pt-1">
                        <div className={cn(
                          "text-sm font-medium mb-1",
                          isActive ? "text-[#007bff]" : isComplete ? "text-gray-900" : "text-gray-400"
                        )}>
                          Step {index + 1}
                        </div>
                        <div className={cn(
                          "text-base font-semibold mb-1",
                          isActive ? "text-gray-900" : isComplete ? "text-gray-700" : "text-gray-400"
                        )}>
                          {stepTitles[index]}
                        </div>
                        <div className={cn(
                          "text-xs",
                          isActive ? "text-gray-600" : "text-gray-400"
                        )}>
                          {stepDescriptions[index]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Step Content */}
        <Card className={cn(
          "border-2 border-black shadow-black-crisp bg-white min-h-[600px]"
        )}>
          <CardContent className={cn("space-y-6", isPageLayout ? "p-6 lg:p-8" : "p-6 lg:p-8")}>
          {activeStep === 0 && (
            <div className="space-y-6">
              {/* Step Header */}
              <div className="mb-6">
                <div className="text-sm text-[#007bff] mb-2 font-medium">Step 1</div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Choose shoe
                </h2>
                <p className="text-gray-600">Which shoe are you reviewing?</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block mb-3 tracking-wider text-base">
                    WHICH SHOE? *
                  </label>
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
                    variant="bold"
                  />
                </div>
                <div>
                  <label className="block mb-3 tracking-wider text-base">
                    CATEGORIES
                  </label>
                  <p className="mb-4 text-sm text-neutral-600">
                    Select all categories that apply to this shoe
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((option) => {
                      const isSelected = categories.includes(option.value);
                      const colors = isSelected ? getCategoryColor(option.value) : null;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setCategoriesTouched(true);
                            if (isSelected) {
                              setCategories(categories.filter((c) => c !== option.value));
                            } else {
                              setCategories([...categories, option.value]);
                            }
                          }}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                            isSelected
                              ? "text-white border-2 shadow-sm hover:shadow-md"
                              : "bg-white text-neutral-700 border-2 border-black hover:bg-neutral-50 shadow-sm hover:shadow-md"
                          )}
                          style={
                            isSelected && colors
                              ? {
                                  backgroundColor: colors.bg,
                                  borderColor: colors.bg,
                                  color: colors.text,
                                }
                              : undefined
                          }
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* Current Selections - Show in both page and modal layouts */}
              {(selectedShoe || categories.length > 0) && (
                <div className="border-l-4 border-[#007bff] pl-6 py-4 bg-[#e6f2ff]/30 animate-slide-in-left">
                  <p className="text-xs tracking-widest text-[#007bff] mb-2">CURRENT SELECTIONS</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedShoe && (
                      <div>
                        <span className="text-neutral-500">SHOE:</span> <span className="font-bold">{selectedShoe.brand} {selectedShoe.model}</span>
                      </div>
                    )}
                    {categories.length > 0 && (
                      <div>
                        <span className="text-neutral-500">CATEGORIES:</span> <span className="font-bold">{categories.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-6">
              {/* Step Header */}
              <div className="mb-6">
                <div className="text-sm text-[#007bff] mb-2 font-medium">Step 2</div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Fit, cushion, stability
                </h2>
                <p className="text-gray-600">How does the shoe perform?</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="block tracking-wider text-base mb-3">
                    FIT *
                  </label>
                  <Select
                    value={fit}
                    onValueChange={(value) => {
                      setFit(value as FitValue);
                      setFitTouched(true);
                    }}
                  >
                    <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
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
                  <label className="block tracking-wider text-base mb-3">
                    CUSHION *
                  </label>
                  <Select
                    value={cushion}
                    onValueChange={(value) => {
                      setCushion(value as CushionValue);
                      setCushionTouched(true);
                    }}
                  >
                    <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
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
                  <label className="block tracking-wider text-base mb-3">
                    STABILITY *
                  </label>
                  <Select
                    value={stability}
                    onValueChange={(value) => {
                      setStability(value as StabilityValue);
                      setStabilityTouched(true);
                    }}
                  >
                    <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
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
              {/* Current Selections - Show in both page and modal layouts */}
              {(selectedShoe || fit || cushion || stability) && (
                <div className="border-l-4 border-[#007bff] pl-6 py-4 bg-[#e6f2ff]/30 animate-slide-in-left">
                  <p className="text-xs tracking-widest text-[#007bff] mb-2">CURRENT SELECTIONS</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedShoe && (
                      <div>
                        <span className="text-neutral-500">SHOE:</span> <span className="font-bold">{selectedShoe.brand} {selectedShoe.model}</span>
                      </div>
                    )}
                    {fit && (
                      <div>
                        <span className="text-neutral-500">FIT:</span> <span className="font-bold">{fit.replace(/_/g, " ").toUpperCase()}</span>
                      </div>
                    )}
                    {cushion && (
                      <div>
                        <span className="text-neutral-500">CUSHION:</span> <span className="font-bold">{cushion.replace(/_/g, " ").toUpperCase()}</span>
                      </div>
                    )}
                    {stability && (
                      <div>
                        <span className="text-neutral-500">STABILITY:</span> <span className="font-bold">{stability.replace(/_/g, " ").toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6">
              {/* Step Header */}
              <div className="mb-6">
                <div className="text-sm text-[#007bff] mb-2 font-medium">Step 3</div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Mileage & profile
                </h2>
                <p className="text-gray-600">Tell us about your running</p>
              </div>
              <div className="space-y-6">
                {/* Top row: Pace range and Weight range */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block tracking-wider text-base mb-3">
                      PACE RANGE *
                    </label>
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
                      <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
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
                    <label className="block tracking-wider text-base mb-3">
                      WEIGHT RANGE *
                    </label>
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
                      <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
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

                {/* Bottom row: Mileage on left, Retired checkbox on right */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block tracking-wider text-base mb-3">
                      MILEAGE ON SHOE ({distanceLabel.toUpperCase()}) *
                    </label>
                    <Input
                      type="number"
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
                      SHOE STATUS
                    </label>
                    <div className="flex items-center space-x-3 px-3 border-2 border-black rounded-sm h-14 shadow-sm hover:shadow-blue-sm transition-all">
                      <Checkbox
                        id="retired"
                        checked={retired}
                        onCheckedChange={(checked) => setRetired(checked === true)}
                        className="border-2 border-black data-[state=checked]:bg-[#007bff] data-[state=checked]:border-[#007bff]"
                      />
                      <label
                        htmlFor="retired"
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
                </div>
              </div>
              {/* Current Selections - Show in both page and modal layouts */}
              {(selectedShoe || fit || cushion || stability || mileage || paceRange || weightRange || categories.length > 0 || retired) && (
                <div className="border-l-4 border-[#007bff] pl-6 py-4 bg-[#e6f2ff]/30 animate-slide-in-left">
                  <p className="text-xs tracking-widest text-[#007bff] mb-2">CURRENT SELECTIONS</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedShoe && (
                      <div>
                        <span className="text-neutral-500">SHOE:</span> <span className="font-bold">{selectedShoe.brand} {selectedShoe.model}</span>
                      </div>
                    )}
                    {fit && (
                      <div>
                        <span className="text-neutral-500">FIT:</span> <span className="font-bold">{fit.replace(/_/g, " ").toUpperCase()}</span>
                      </div>
                    )}
                    {cushion && (
                      <div>
                        <span className="text-neutral-500">CUSHION:</span> <span className="font-bold">{cushion.replace(/_/g, " ").toUpperCase()}</span>
                      </div>
                    )}
                    {stability && (
                      <div>
                        <span className="text-neutral-500">STABILITY:</span> <span className="font-bold">{stability.replace(/_/g, " ").toUpperCase()}</span>
                      </div>
                    )}
                    {mileage && (
                      <div>
                        <span className="text-neutral-500">MILEAGE:</span> <span className="font-bold">{mileage} {distanceLabel}</span>
                      </div>
                    )}
                    {paceRange && paceRangeLabel && (
                      <div>
                        <span className="text-neutral-500">PACE:</span> <span className="font-bold">{paceRangeLabel}</span>
                      </div>
                    )}
                    {weightRange && weightRangeLabel && (
                      <div>
                        <span className="text-neutral-500">WEIGHT:</span> <span className="font-bold">{weightRangeLabel}</span>
                      </div>
                    )}
                    {categories.length > 0 && (
                      <div>
                        <span className="text-neutral-500">CATEGORIES:</span> <span className="font-bold">{categories.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6">
              {/* Step Header */}
              <div className="mb-6">
                <div className="text-sm text-[#007bff] mb-2 font-medium">Step 4</div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Rating & review
                </h2>
                <p className="text-gray-600">Share your honest experience</p>
              </div>
              
              {/* Rating */}
              <div>
                <label className="block mb-4 tracking-wider text-base">
                  OVERALL RATING *
                </label>
                <div className="flex gap-3 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setRating(star);
                        setRatingTouched(true);
                      }}
                      onMouseEnter={() => setRatingTouched(true)}
                      className="transition-all hover:scale-125 active:scale-95"
                    >
                      <Star
                        className={cn(
                          "size-12 transition-all duration-200",
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
                    {rating === 1 && "Poor - Would not recommend"}
                    {rating === 2 && "Fair - Below expectations"}
                    {rating === 3 && "Good - Meets expectations"}
                    {rating === 4 && "Very Good - Exceeds expectations"}
                    {rating === 5 && "Excellent - Highly recommend"}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div>
                <label className="block mb-3 tracking-wider text-base">
                  YOUR REVIEW *
                </label>
                <Textarea
                  rows={10}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell other runners about the fit, ride, and how you use this shoe."
                  className="border-2 border-black min-h-[240px] resize-none tracking-wide shadow-sm hover:shadow-blue-sm transition-all"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-neutral-500 tracking-wide">
                    {comment.length} / 1000 characters
                  </p>
                  {comment.length >= 50 && (
                    <p className="text-sm text-[#007bff] tracking-wide">Looking good! ✓</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Review Summary - Show in both page and modal layouts when on step 3 */}
          {activeStep === 3 && rating > 0 && comment.length > 0 && (
            <div className="border-l-4 border-[#007bff] pl-6 py-4 bg-[#e6f2ff]/30 animate-slide-in-left">
              <p className="text-xs tracking-widest text-[#007bff] mb-2">REVIEW SUMMARY</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedShoe && (
                  <div>
                    <span className="text-neutral-500">SHOE:</span> <span className="font-bold">{selectedShoe.label}</span>
                  </div>
                )}
                {fitTouched && (
                  <div>
                    <span className="text-neutral-500">FIT:</span> <span className="font-bold">{fit.replace(/_/g, " ")}</span>
                  </div>
                )}
                {cushionTouched && (
                  <div>
                    <span className="text-neutral-500">CUSHION:</span> <span className="font-bold">{cushion.replace(/_/g, " ")}</span>
                  </div>
                )}
                {stabilityTouched && (
                  <div>
                    <span className="text-neutral-500">STABILITY:</span> <span className="font-bold">{stability.replace(/_/g, " ")}</span>
                  </div>
                )}
                {mileage && (
                  <div>
                    <span className="text-neutral-500">MILEAGE:</span> <span className="font-bold">{mileage} {distanceLabel}</span>
                  </div>
                )}
                {paceTouched && paceRangeLabel && (
                  <div>
                    <span className="text-neutral-500">PACE:</span> <span className="font-bold">{paceRangeLabel}</span>
                  </div>
                )}
                {weightTouched && weightRangeLabel && (
                  <div>
                    <span className="text-neutral-500">WEIGHT:</span> <span className="font-bold">{weightRangeLabel}</span>
                  </div>
                )}
                {categoriesTouched && categories.length > 0 && (
                  <div>
                    <span className="text-neutral-500">CATEGORIES:</span> <span className="font-bold">{categories.join(", ")}</span>
                  </div>
                )}
                {retired && (
                  <div>
                    <span className="text-neutral-500">STATUS:</span> <span className="font-bold text-orange-600">RETIRED</span>
                  </div>
                )}
                {ratingTouched && (
                  <div className="col-span-2">
                    <span className="text-neutral-500">RATING:</span> 
                    <span className="ml-2">
                      {[...Array(rating)].map((_, i) => (
                        <Star key={i} className="inline size-4 fill-[#007bff] text-[#007bff]" />
                      ))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={cn(
            "flex items-center justify-between",
            "mt-8 pt-6 border-t-2 border-black"
          )}>
            <Button
              variant="ghost"
              disabled={activeStep === 0}
              onClick={handleBack}
              className="border-2 border-black hover:bg-black hover:text-white transition-all h-14 px-8 tracking-wider shadow-sm hover:shadow-black-crisp group"
            >
              <ArrowLeft className="size-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              {activeStep === 0 ? 'CANCEL' : 'BACK'}
            </Button>
            {activeStep < steps.length - 1 && (
              <Button
                disabled={!canContinue}
                onClick={handleNext}
                className="gradient-blue-vibrant text-white hover:opacity-90 h-14 px-12 tracking-wider shadow-black-crisp hover:shadow-blue-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CONTINUE
                <ArrowRight className="size-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
            {activeStep === steps.length - 1 && (
              <Button
                onClick={submit}
                disabled={!canContinue}
                className="gradient-blue-vibrant text-white hover:opacity-90 h-14 px-12 tracking-wider shadow-black-crisp hover:shadow-blue-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="size-5 mr-2" />
                SUBMIT REVIEW
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}


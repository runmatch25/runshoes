"use client";

import { useState } from "react";
import { Star, Quote } from "lucide-react";
import { useUnitPreferences } from "@/context/UnitPreferencesContext";

interface FeaturedReview {
  id: number;
  rating: number;
  comment: string;
  shoeBrand: string;
  shoeModel: string;
  userName: string;
  paceMinutes?: number | null;
  paceSeconds?: number | null;
  paceRange?: string | null;
}

interface FeaturedReviewProps {
  reviews: FeaturedReview[];
}

// Pace range options mapping (with representative values for conversion)
const paceRangeOptionsImperial = [
  { value: "pace-mile-slower-than-11", label: ">11:00/mi", minutes: 11, seconds: 30 },
  { value: "pace-mile-9-31-to-10-59", label: "9:31 – 10:59/mi", minutes: 10, seconds: 15 },
  { value: "pace-mile-8-01-to-9-30", label: "8:01 – 9:30/mi", minutes: 8, seconds: 45 },
  { value: "pace-mile-6-31-to-8-00", label: "6:31 – 8:00/mi", minutes: 7, seconds: 15 },
  { value: "pace-mile-5-51-to-6-30", label: "5:51 – 6:30/mi", minutes: 6, seconds: 10 },
  { value: "pace-mile-faster-than-5-50", label: "<5:50/mi", minutes: 5, seconds: 45 },
];

const paceRangeOptionsMetric = [
  { value: "pace-km-slower-than-6-50", label: ">6:50/km", minutes: 7, seconds: 10 },
  { value: "pace-km-5-35-to-6-49", label: "5:35 – 6:49/km", minutes: 6, seconds: 12 },
  { value: "pace-km-4-40-to-5-34", label: "4:40 – 5:34/km", minutes: 5, seconds: 7 },
  { value: "pace-km-3-45-to-4-39", label: "3:45 – 4:39/km", minutes: 4, seconds: 12 },
  { value: "pace-km-3-15-to-3-44", label: "3:15 – 3:44/km", minutes: 3, seconds: 30 },
  { value: "pace-km-faster-than-3-15", label: "<3:15/km", minutes: 3, seconds: 7 },
];

const KM_PER_MILE = 1.60934;

// Convert pace from one system to another
const convertPace = (
  minutes: number,
  seconds: number,
  fromMetric: boolean,
  toMetric: boolean
): { minutes: number; seconds: number } => {
  if (fromMetric === toMetric) {
    return { minutes, seconds };
  }

  const totalSeconds = minutes * 60 + seconds;
  let convertedSeconds: number;

  if (fromMetric && !toMetric) {
    // Convert from km to mile (multiply by KM_PER_MILE)
    convertedSeconds = totalSeconds * KM_PER_MILE;
  } else {
    // Convert from mile to km (divide by KM_PER_MILE)
    convertedSeconds = totalSeconds / KM_PER_MILE;
  }

  const convertedMinutes = Math.floor(convertedSeconds / 60);
  const convertedSecs = Math.round(convertedSeconds % 60);
  return {
    minutes: convertedMinutes,
    seconds: convertedSecs >= 60 ? 0 : convertedSecs,
  };
};

// Find the closest matching pace range in target system
const findMatchingPaceRange = (
  minutes: number,
  seconds: number,
  targetOptions: typeof paceRangeOptionsMetric
): string | null => {
  const totalSeconds = minutes * 60 + seconds;
  let closestRange: (typeof paceRangeOptionsMetric)[number] | null = null;
  let minDiff = Infinity;

  for (const range of targetOptions) {
    if (range.minutes === undefined || range.seconds === undefined) continue;
    const rangeSeconds = range.minutes * 60 + range.seconds;
    const diff = Math.abs(totalSeconds - rangeSeconds);
    if (diff < minDiff) {
      minDiff = diff;
      closestRange = range;
    }
  }

  return closestRange?.value || null;
};

const getPaceRangeLabel = (paceRange?: string | null, distanceUnit?: string): string | null => {
  if (!paceRange) return null;

  const isMetricRange = paceRange.startsWith("pace-km-");
  const isImperialRange = paceRange.startsWith("pace-mile-");
  const targetIsMetric = distanceUnit === "kilometers";

  // If the range matches the current system, use it directly
  if ((isMetricRange && targetIsMetric) || (isImperialRange && !targetIsMetric)) {
    const options = targetIsMetric ? paceRangeOptionsMetric : paceRangeOptionsImperial;
    return options.find(opt => opt.value === paceRange)?.label || null;
  }

  // Need to convert between systems
  let sourceOptions: typeof paceRangeOptionsMetric;
  if (isMetricRange) {
    sourceOptions = paceRangeOptionsMetric;
  } else if (isImperialRange) {
    sourceOptions = paceRangeOptionsImperial as typeof paceRangeOptionsMetric;
  } else {
    return null;
  }

  const sourceRange = sourceOptions.find(opt => opt.value === paceRange);
  if (!sourceRange || sourceRange.minutes === undefined || sourceRange.seconds === undefined) {
    return null;
  }

  // Convert the representative pace to the target system
  const converted = convertPace(
    sourceRange.minutes,
    sourceRange.seconds,
    isMetricRange,
    targetIsMetric
  );

  // Find the matching range in the target system
  const targetOptions = targetIsMetric ? paceRangeOptionsMetric : paceRangeOptionsImperial;
  const matchingRange = findMatchingPaceRange(converted.minutes, converted.seconds, targetOptions);
  
  if (matchingRange) {
    return targetOptions.find(opt => opt.value === matchingRange)?.label || null;
  }

  return null;
};

export default function FeaturedReview({ reviews }: FeaturedReviewProps) {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const { toDisplayPace, distanceUnit } = useUnitPreferences();

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const currentReview = reviews[currentReviewIndex] || reviews[0];
  
  // Format pace display - prioritize pace range over exact pace
  const getPaceDisplay = (): string => {
    // First, try to use pace range if available
    if (currentReview.paceRange) {
      const label = getPaceRangeLabel(currentReview.paceRange, distanceUnit);
      if (label) {
        // Return the full range label (e.g., "9:31 – 10:59/mi" or ">11:00/mile")
        return label;
      }
    }
    // Fall back to exact pace only if pace range is not available
    if (currentReview.paceMinutes !== null && currentReview.paceMinutes !== undefined) {
      const displayPace = toDisplayPace({ 
        minutes: currentReview.paceMinutes, 
        seconds: currentReview.paceSeconds || 0 
      });
      if (displayPace) {
        const unit = distanceUnit === "kilometers" ? "KM" : "MI";
        const paddedSeconds = displayPace.seconds.toString().padStart(2, "0");
        return `${displayPace.minutes}:${paddedSeconds} /${unit}`;
      }
    }
    return "N/A";
  };

  return (
    <div className="relative animate-slide-in-right">
      {/* Background Image */}
      <div className="aspect-[3/4] bg-gradient-to-br from-[#e6f2ff] to-[#b3d9ff] overflow-hidden border-2 border-black shadow-black-crisp-lg hover:shadow-blue-lg transition-all duration-500">
        <img
          src="https://images.unsplash.com/photo-1758506971661-33fe941ca1e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uZXIlMjB0cmFjayUyMGJsYWNrJTIwd2hpdGV8ZW58MXx8fHwxNzYzNDE2NjU1fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Runner"
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
        />
      </div>
      
      {/* Overlaid Review Card */}
      <div className="absolute bottom-6 left-6 right-6 border-2 border-black p-6 bg-white shadow-black-crisp hover:shadow-blue-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-xs tracking-widest text-[#007bff] mb-1">FEATURED REVIEW</div>
            <h3 className="text-lg tracking-wider mb-2">
              {currentReview.shoeBrand.toUpperCase()} {currentReview.shoeModel.toUpperCase()}
            </h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const fraction = Math.max(0, Math.min(1, currentReview.rating - (star - 1)));
                return (
                  <div key={star} className="relative">
                    <Star className="size-4 fill-neutral-200 text-neutral-200" />
                    {fraction > 0 && (
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${fraction * 100}%` }}
                      >
                        <Star className="size-4 fill-[#007bff] text-[#007bff]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <Quote className="size-8 text-[#007bff] opacity-20 flex-shrink-0" />
        </div>

        <p className="leading-relaxed mb-4 text-neutral-700 line-clamp-3">
          "{currentReview.comment}"
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <div>
            <div className="text-xs tracking-widest text-neutral-500">
              PACE: <span className="text-[#007bff]">{getPaceDisplay()}</span>
            </div>
          </div>
          <div className="text-xs tracking-wider text-neutral-600">
            {currentReview.userName.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Review Switcher */}
      {reviews.length > 1 && (
        <div className="absolute top-4 right-4 flex gap-2">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentReviewIndex(index)}
              className={`h-2 transition-all duration-300 border border-white ${
                index === currentReviewIndex 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`View review ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Unsplash Badge */}
      <div className="absolute top-4 left-4 bg-white px-3 py-1.5 border-2 border-black shadow-black-crisp">
        <span className="tracking-wider text-xs">UNSPLASH</span>
      </div>
    </div>
  );
}


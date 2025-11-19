"use client";

import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import { useUnitPreferences } from "@/context/UnitPreferencesContext";

interface ReviewCardProps {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string | null;
  userName: string;
  shoeBrand?: string;
  shoeModel?: string;
  formattedDate?: string;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  showLink?: boolean;
  shoeId?: number;
  helpfulCount?: number;
  notHelpfulCount?: number;
  userVote?: number;
  votingDisabled?: boolean;
  onVote?: (value: 1 | -1) => void;
  position?: number;
  // Figma design fields
  fit?: 'SMALL' | 'TRUE_TO_SIZE' | 'BIG' | string;
  cushion?: 'SOFT' | 'BALANCED' | 'FIRM' | string;
  stability?: 'NEUTRAL' | 'MODERATE_SUPPORT' | 'HIGH_SUPPORT' | string;
  mileage?: number;
  paceMinutes?: number; // legacy
  paceSeconds?: number; // legacy
  weight?: number; // legacy
  paceRange?: string; // pace range identifier
  weightRange?: string; // weight range identifier
}

// Format enum values for display
const formatFit = (fit?: string): string => {
  if (!fit) return 'N/A';
  return fit.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatCushion = (cushion?: string): string => {
  if (!cushion) return 'N/A';
  return cushion.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatStability = (stability?: string): string => {
  if (!stability) return 'N/A';
  return stability.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Range options mapping (matching ReviewWizard)
const paceRangeOptionsImperial = [
  { value: "pace-mile-slower-than-11", label: ">11:00/mile" },
  { value: "pace-mile-9-31-to-10-59", label: "9:31 – 10:59/mile" },
  { value: "pace-mile-8-01-to-9-30", label: "8:01 – 9:30/mile" },
  { value: "pace-mile-6-31-to-8-00", label: "6:31 – 8:00/mile" },
  { value: "pace-mile-5-51-to-6-30", label: "5:51 – 6:30/mile" },
  { value: "pace-mile-faster-than-5-50", label: "<5:50/mile" },
];

const paceRangeOptionsMetric = [
  { value: "pace-km-slower-than-6-50", label: ">6:50/km" },
  { value: "pace-km-5-35-to-6-49", label: "5:35 – 6:49/km" },
  { value: "pace-km-4-40-to-5-34", label: "4:40 – 5:34/km" },
  { value: "pace-km-3-45-to-4-39", label: "3:45 – 4:39/km" },
  { value: "pace-km-3-15-to-3-44", label: "3:15 – 3:44/km" },
  { value: "pace-km-faster-than-3-15", label: "<3:15/km" },
];

const weightRangeOptionsImperial = [
  { value: "weight-lbs-under-130", label: "<130 lbs" },
  { value: "weight-lbs-130-150", label: "130 – 150 lbs" },
  { value: "weight-lbs-150-170", label: "150 – 170 lbs" },
  { value: "weight-lbs-170-190", label: "170 – 190 lbs" },
  { value: "weight-lbs-190-210", label: "190 – 210 lbs" },
  { value: "weight-lbs-over-210", label: ">210 lbs" },
];

const weightRangeOptionsMetric = [
  { value: "weight-kg-under-60", label: "<60 kg" },
  { value: "weight-kg-60-70", label: "60 – 70 kg" },
  { value: "weight-kg-70-80", label: "70 – 80 kg" },
  { value: "weight-kg-80-90", label: "80 – 90 kg" },
  { value: "weight-kg-90-100", label: "90 – 100 kg" },
  { value: "weight-kg-over-100", label: ">100 kg" },
];

// Helper function to get range label from identifier
const getPaceRangeLabel = (paceRange?: string, distanceUnit?: string): string | null => {
  if (!paceRange) return null;
  const options = distanceUnit === "kilometers" ? paceRangeOptionsMetric : paceRangeOptionsImperial;
  return options.find(opt => opt.value === paceRange)?.label || null;
};

const getWeightRangeLabel = (weightRange?: string, weightUnit?: string): string | null => {
  if (!weightRange) return null;
  const options = weightUnit === "kg" ? weightRangeOptionsMetric : weightRangeOptionsImperial;
  return options.find(opt => opt.value === weightRange)?.label || null;
};

export default function ReviewCard({
  rating,
  comment,
  userName,
  createdAt,
  formattedDate,
  canEdit = false,
  onEdit,
  onDelete,
  showLink = true,
  shoeId,
  helpfulCount = 0,
  notHelpfulCount = 0,
  userVote = 0,
  votingDisabled = false,
  onVote,
  position = 0,
  fit,
  cushion,
  stability,
  mileage,
  paceMinutes,
  paceSeconds,
  weight,
  paceRange,
  weightRange,
}: ReviewCardProps) {
  const { formatDistance, formatPace, formatWeight, distanceUnit, weightUnit } = useUnitPreferences();
  // Create subtle depth variations with different border styles
  const getBorderStyle = () => {
    const styles = [
      'border-black',
      'border-neutral-800',
      'border-neutral-700',
      'border-neutral-600',
    ];
    return styles[position % styles.length];
  };

  const getBackgroundStyle = () => {
    const styles = [
      'bg-white',
      'bg-neutral-50',
      'bg-white',
      'bg-neutral-50/50',
    ];
    return styles[position % styles.length];
  };

  // Stagger effect
  const getTransform = () => {
    const offset = (position % 2) * 8;
    return {
      transform: `translateX(${offset}px)`
    };
  };

  const displayDate = formattedDate || (createdAt ? formatDateISOToMMDDYYYY(createdAt) : '');

  return (
    <div 
      className={`${getBackgroundStyle()} border ${getBorderStyle()} hover:shadow-[12px_12px_0px_0px_rgba(0,123,255,0.3)] transition-all duration-300 h-full`}
      style={getTransform()}
    >
      <div className="p-5 lg:p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h3 className="text-xl tracking-tight mb-2 font-bold">{userName.toUpperCase()}</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`size-4 ${
                      star <= rating
                        ? 'fill-[#007bff] text-[#007bff]'
                        : 'fill-neutral-200 text-neutral-200'
                    }`}
                  />
                ))}
              </div>
              <span className="tracking-wider text-sm">{rating}.0</span>
            </div>
          </div>
          {displayDate && (
            <span className="tracking-widest text-xs text-neutral-400 whitespace-nowrap">{displayDate}</span>
          )}
        </div>

        {/* Horizontal Layout: Comment on Left, Stats on Right */}
        <div className="flex gap-4 flex-1">
          {/* Left Side: Comment */}
          <div className="flex-1 flex flex-col min-w-0">
            <p className="text-base leading-relaxed text-neutral-700 flex-1 mb-4">
              {comment}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-neutral-200">
              {onVote && (
                <>
                  <Button 
                    variant="ghost" 
                    className="hover:bg-[#007bff]/10 hover:text-[#007bff] gap-2 tracking-wider transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onVote(1);
                    }}
                    disabled={votingDisabled}
                  >
                    <ThumbsUp className="size-4" />
                    <span>{helpfulCount}</span>
                  </Button>
                </>
              )}
              {canEdit && (
                <div className="ml-auto flex items-center gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      className="tracking-wider"
                    >
                      EDIT
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="tracking-wider text-destructive hover:text-destructive"
                    >
                      DELETE
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Stats in 2 Columns */}
          {(fit || cushion || stability || mileage !== undefined || (paceRange && paceRange.trim()) || paceMinutes !== undefined || (weightRange && weightRange.trim()) || weight !== undefined) && (
            <div className="flex-shrink-0 pl-4 border-l border-neutral-200 w-64">
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                {fit && (
                  <div className="border-l-2 border-[#007bff] pl-2">
                    <span className="tracking-widest text-xs text-neutral-400 block mb-1">FIT</span>
                    <span className="tracking-wider text-sm block">{formatFit(fit)}</span>
                  </div>
                )}
                {cushion && (
                  <div className="border-l-2 border-[#007bff] pl-2">
                    <span className="tracking-widest text-xs text-neutral-400 block mb-1">CUSHION</span>
                    <span className="tracking-wider text-sm block">{formatCushion(cushion)}</span>
                  </div>
                )}
                {stability && (
                  <div className="border-l-2 border-[#007bff] pl-2">
                    <span className="tracking-widest text-xs text-neutral-400 block mb-1">STABILITY</span>
                    <span className="tracking-wider text-sm block">{formatStability(stability)}</span>
                  </div>
                )}
                {mileage !== undefined && (
                  <div className="border-l-2 border-[#007bff] pl-2">
                    <span className="tracking-widest text-xs text-neutral-400 block mb-1">MILEAGE</span>
                    <span className="tracking-wider text-sm block">{formatDistance(mileage) ?? 'N/A'}</span>
                  </div>
                )}
                {paceRange && paceRange.trim() ? (
                  <div className="border-l-2 border-[#007bff] pl-2">
                    <span className="tracking-widest text-xs text-neutral-400 block mb-1">PACE</span>
                    <span className="tracking-wider text-sm block">{getPaceRangeLabel(paceRange, distanceUnit) ?? 'N/A'}</span>
                  </div>
                ) : paceMinutes !== undefined && paceMinutes !== null ? (
                  <div className="border-l-2 border-[#007bff] pl-2">
                    <span className="tracking-widest text-xs text-neutral-400 block mb-1">PACE</span>
                    <span className="tracking-wider text-sm block">{formatPace({ minutes: paceMinutes, seconds: paceSeconds }) ?? 'N/A'}</span>
                  </div>
                ) : null}
                {weightRange && weightRange.trim() ? (
                  <div className="border-l-2 border-[#007bff] pl-2">
                    <span className="tracking-widest text-xs text-neutral-400 block mb-1">WEIGHT</span>
                    <span className="tracking-wider text-sm block">{getWeightRangeLabel(weightRange, weightUnit) ?? 'N/A'}</span>
                  </div>
                ) : weight !== undefined && weight !== null ? (
                  <div className="border-l-2 border-[#007bff] pl-2">
                    <span className="tracking-widest text-xs text-neutral-400 block mb-1">WEIGHT</span>
                    <span className="tracking-wider text-sm block">{formatWeight(weight) ?? 'N/A'}</span>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

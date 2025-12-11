"use client";

import { Star, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import { useUnitPreferences } from "@/context/UnitPreferencesContext";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

interface ReviewCardProps {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  userName: string;
  userId?: number; // User ID for linking to profile
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
  categories?: string[]; // shoe categories
  retired?: boolean; // shoe has been retired
}

interface UserProfileSummary {
  id: number;
  name: string;
  nickname?: string | null;
  useNickname?: boolean | null;
  paceRange?: string | null;
  weightRange?: string | null;
  experience?: string | null;
  pronation?: string | null;
  createdAt?: string | null;
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
// Include representative values for conversion
const paceRangeOptionsImperial = [
  { value: "pace-mile-faster-than-6-00", label: "<6:00/mile", minutes: 5, seconds: 59 },
  { value: "pace-mile-6-00-to-6-59", label: "6:00 – 6:59/mile", minutes: 6, seconds: 30 },
  { value: "pace-mile-7-00-to-7-59", label: "7:00 – 7:59/mile", minutes: 7, seconds: 30 },
  { value: "pace-mile-8-00-to-8-59", label: "8:00 – 8:59/mile", minutes: 8, seconds: 30 },
  { value: "pace-mile-9-00-to-9-59", label: "9:00 – 9:59/mile", minutes: 9, seconds: 30 },
  { value: "pace-mile-10-00-to-10-59", label: "10:00 – 10:59/mile", minutes: 10, seconds: 30 },
  { value: "pace-mile-11-00-to-11-59", label: "11:00 – 11:59/mile", minutes: 11, seconds: 30 },
  { value: "pace-mile-12-00-or-slower", label: "≥12:00/mile", minutes: 12, seconds: 0 },
];

const paceRangeOptionsMetric = [
  { value: "pace-km-faster-than-3-45", label: "<3:45/km", minutes: 3, seconds: 44 },
  { value: "pace-km-3-45-to-4-19", label: "3:45 – 4:19/km", minutes: 4, seconds: 2 },
  { value: "pace-km-4-20-to-4-59", label: "4:20 – 4:59/km", minutes: 4, seconds: 40 },
  { value: "pace-km-5-00-to-5-39", label: "5:00 – 5:39/km", minutes: 5, seconds: 20 },
  { value: "pace-km-5-40-to-6-19", label: "5:40 – 6:19/km", minutes: 6, seconds: 0 },
  { value: "pace-km-6-20-to-6-59", label: "6:20 – 6:59/km", minutes: 6, seconds: 40 },
  { value: "pace-km-7-00-to-7-29", label: "7:00 – 7:29/km", minutes: 7, seconds: 15 },
  { value: "pace-km-7-30-or-slower", label: "≥7:30/km", minutes: 7, seconds: 30 },
];

const weightRangeOptionsImperial = [
  { value: "weight-lbs-under-130", label: "<130 lbs", average: 125 },
  { value: "weight-lbs-130-150", label: "130 – 150 lbs", average: 140 },
  { value: "weight-lbs-150-170", label: "150 – 170 lbs", average: 160 },
  { value: "weight-lbs-170-190", label: "170 – 190 lbs", average: 180 },
  { value: "weight-lbs-190-210", label: "190 – 210 lbs", average: 200 },
  { value: "weight-lbs-over-210", label: ">210 lbs", average: 220 },
];

const weightRangeOptionsMetric = [
  { value: "weight-kg-under-60", label: "<60 kg", average: 55 },
  { value: "weight-kg-60-70", label: "60 – 70 kg", average: 65 },
  { value: "weight-kg-70-80", label: "70 – 80 kg", average: 75 },
  { value: "weight-kg-80-90", label: "80 – 90 kg", average: 85 },
  { value: "weight-kg-90-100", label: "90 – 100 kg", average: 95 },
  { value: "weight-kg-over-100", label: ">100 kg", average: 110 },
];

const KM_PER_MILE = 1.60934;
const LB_PER_KG = 2.20462;

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
    const rangeSeconds = range.minutes * 60 + range.seconds;
    const diff = Math.abs(totalSeconds - rangeSeconds);
    if (diff < minDiff) {
      minDiff = diff;
      closestRange = range;
    }
  }

  return closestRange?.value || null;
};

// Helper function to get range label from identifier with conversion
const getPaceRangeLabel = (paceRange?: string, distanceUnit?: string): string | null => {
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

// Find the closest matching weight range in target system
const findMatchingWeightRange = (
  weight: number,
  targetOptions: typeof weightRangeOptionsMetric
): string | null => {
  let closestRange: (typeof weightRangeOptionsMetric)[number] | null = null;
  let minDiff = Infinity;

  for (const range of targetOptions) {
    if (range.average === undefined) continue;
    const diff = Math.abs(weight - range.average);
    if (diff < minDiff) {
      minDiff = diff;
      closestRange = range;
    }
  }

  return closestRange?.value || null;
};

const getWeightRangeLabel = (weightRange?: string, weightUnit?: string): string | null => {
  if (!weightRange) return null;

  const isMetricRange = weightRange.startsWith("weight-kg-");
  const isImperialRange = weightRange.startsWith("weight-lbs-");
  const targetIsMetric = weightUnit === "kg";

  // If the range matches the current system, use it directly
  if ((isMetricRange && targetIsMetric) || (isImperialRange && !targetIsMetric)) {
    const options = targetIsMetric ? weightRangeOptionsMetric : weightRangeOptionsImperial;
    return options.find(opt => opt.value === weightRange)?.label || null;
  }

  // Need to convert between systems
  let sourceOptions: typeof weightRangeOptionsMetric;
  if (isMetricRange) {
    sourceOptions = weightRangeOptionsMetric;
  } else if (isImperialRange) {
    sourceOptions = weightRangeOptionsImperial as typeof weightRangeOptionsMetric;
  } else {
    return null;
  }

  const sourceRange = sourceOptions.find(opt => opt.value === weightRange);
  if (!sourceRange || sourceRange.average === undefined) {
    return null;
  }

  // Convert the representative weight to the target system
  let convertedWeight: number;
  if (isMetricRange && !targetIsMetric) {
    // Convert from kg to lbs
    convertedWeight = sourceRange.average * LB_PER_KG;
  } else {
    // Convert from lbs to kg
    convertedWeight = sourceRange.average / LB_PER_KG;
  }

  // Find the matching range in the target system
  const targetOptions = targetIsMetric ? weightRangeOptionsMetric : weightRangeOptionsImperial;
  const matchingRange = findMatchingWeightRange(convertedWeight, targetOptions);
  
  if (matchingRange) {
    return targetOptions.find(opt => opt.value === matchingRange)?.label || null;
  }

  return null;
};

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

export default function ReviewCard({
  id,
  rating,
  comment,
  userName,
  userId,
  createdAt,
  updatedAt,
  formattedDate,
  canEdit = false,
  onEdit,
  onDelete,
  showLink = true,
  shoeId,
  shoeBrand,
  shoeModel,
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
  categories,
  retired,
}: ReviewCardProps) {
  const { formatDistance, formatPace, formatWeight, distanceUnit, weightUnit } = useUnitPreferences();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileSummary | null>(null);
  const [reviewStats, setReviewStats] = useState<{ reviewsCount: number; shoesCount: number } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
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

  const fetchProfile = useCallback(async () => {
    if (!userId || profileLoading) return;
    if (profile && reviewStats) return; // already loaded

    setProfileLoading(true);
    setProfileError(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      // Fetch user profile
      const resProfile = await fetch(`http://localhost:3001/users/${userId}`, { headers });
      if (!resProfile.ok) throw new Error(`Failed to load profile (${resProfile.status})`);
      const dataProfile = await resProfile.json();
      setProfile(dataProfile);

      // Fetch user reviews to derive counts
      const resReviews = await fetch(`http://localhost:3001/reviews/user/${userId}`, { headers });
      if (resReviews.ok) {
        const dataReviews = await resReviews.json();
        const normalized: any[] = Array.isArray(dataReviews)
          ? dataReviews
          : Array.isArray(dataReviews?.reviews)
            ? dataReviews.reviews
            : [];
        const reviewsCount = normalized.length;
        const shoesCount = new Set(normalized.map((r: any) => r?.shoe?.id).filter(Boolean)).size;
        setReviewStats({ reviewsCount, shoesCount });
      } else {
        setReviewStats(null);
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      setProfileError("Could not load profile");
    } finally {
      setProfileLoading(false);
    }
  }, [userId, profile, reviewStats, profileLoading]);

  // Determine if review has been updated
  // Compare dates by converting to timestamps to handle string comparisons correctly
  const hasBeenUpdated = updatedAt && createdAt && new Date(updatedAt).getTime() !== new Date(createdAt).getTime();
  const createdDate = formattedDate || (createdAt ? formatDateISOToMMDDYYYY(createdAt) : '');
  const updatedDate = updatedAt ? formatDateISOToMMDDYYYY(updatedAt) : '';

  const handleCardClick = () => {
    if (shoeId && showLink) {
      router.push(`/shoes/${shoeId}#review-${id}`);
    }
  };

  const memberSince = profile?.createdAt
    ? (() => {
        const d = new Date(profile.createdAt);
        const month = d.toLocaleString("en-US", { month: "short" });
        const year = d.getFullYear();
        return `${month} ${year}`;
      })()
    : null;

  const paceRangeLabel =
    profile?.paceRange ? getPaceRangeLabel(profile.paceRange, distanceUnit) : null;

  const weightRangeLabel =
    profile?.weightRange ? getWeightRangeLabel(profile.weightRange, weightUnit) : null;

  const displayName = useMemo(() => {
    const source = profile?.useNickname && profile?.nickname
      ? profile.nickname
      : profile?.name || userName;
    return source.trim();
  }, [profile?.useNickname, profile?.nickname, profile?.name, userName]);

  const splitName = useMemo(() => {
    const parts = displayName.split(" ");
    const first = parts.shift() ?? "";
    const rest = parts.join(" ").trim();
    return { first, rest };
  }, [displayName]);

  const initials = useMemo(() => {
    const first = splitName.first?.[0] ?? "";
    const second = splitName.rest?.[0] ?? "";
    return (first + second).toUpperCase() || "R";
  }, [splitName.first, splitName.rest]);

  const reviewsCount = reviewStats?.reviewsCount ?? (profile as any)?.reviewsCount ?? "—";
  const shoesCount = reviewStats?.shoesCount ?? (profile as any)?.shoesCount ?? "—";

  const experienceLabel = profile?.experience
    ? profile.experience.replace(/_/g, " ").toUpperCase()
    : null;

  const experienceStyle = useMemo(() => {
    const base = {
      BEGINNER: { bg: "#ecfdf3", border: "#22c55e", text: "#15803d" },
      INTERMEDIATE: { bg: "#fffbeb", border: "#facc15", text: "#b45309" },
      ADVANCED: { bg: "#f5f3ff", border: "#a78bfa", text: "#7c3aed" },
      ELITE: { bg: "#fef2f2", border: "#ef4444", text: "#b91c1c" },
    } as const;
    if (!profile?.experience) return null;
    const key = profile.experience as keyof typeof base;
    return base[key] ?? null;
  }, [profile?.experience]);

  const isClickable = shoeId && showLink;

  return (
    <div 
      className={`${getBackgroundStyle()} border ${getBorderStyle()} hover:shadow-[12px_12px_0px_0px_rgba(0,123,255,0.3)] transition-all duration-300 h-full ${isClickable ? 'cursor-pointer' : ''}`}
      style={getTransform()}
      onClick={isClickable ? handleCardClick : undefined}
    >
      <div className="p-5 lg:p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div 
              className="relative inline-block group"
              onMouseEnter={fetchProfile}
            >
              {userId ? (
                <Link 
                  href={`/users/${userId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xl tracking-tight mb-2 font-bold hover:text-[#007bff] transition-colors inline-block"
                >
                  {userName.toUpperCase()}
                </Link>
              ) : (
                <h3 className="text-xl tracking-tight mb-2 font-bold">{userName.toUpperCase()}</h3>
              )}

              {userId && (
                <div className="absolute left-0 top-full mt-3 w-[260px] z-30 hidden group-hover:block">
                  <div className="relative">
                    <div className="relative bg-white border border-neutral-200 shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-4 font-sans">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className="text-3xl mb-2 leading-[0.85] text-neutral-900 hover:text-[#007bff] transition-colors"
                            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
                          >
                            {splitName.first.toUpperCase()}
                            {splitName.rest ? (
                              <>
                                <br />
                                {splitName.rest.toUpperCase()}
                              </>
                            ) : null}
                          </p>
                        </div>
                        {experienceLabel && experienceStyle ? (
                          <div className="flex-shrink-0">
                            <span
                              className="text-[10px] font-semibold tracking-[0.18em] px-2 py-0.5 inline-flex items-center justify-center rounded-full uppercase"
                              style={{
                                backgroundColor: experienceStyle.bg,
                                border: `1px solid ${experienceStyle.border}`,
                                color: experienceStyle.text,
                              }}
                            >
                              {experienceLabel}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {profileLoading && (
                        <p className="text-sm text-neutral-500 mt-2">Loading profile…</p>
                      )}
                      {profileError && (
                        <p className="text-sm text-red-500 mt-2">{profileError}</p>
                      )}

                      {!profileLoading && !profileError && (
                        <div className="mt-3 space-y-3 text-neutral-800">
                          <hr className="border-neutral-200" />
                          <div className="grid grid-cols-2 gap-3 text-center">
                            <div>
                              <p className="text-[10px] tracking-[0.18em] text-neutral-500 mb-1 uppercase">Reviews</p>
                              <p className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{reviewsCount}</p>
                            </div>
                            <div>
                              <p className="text-[10px] tracking-[0.18em] text-neutral-500 mb-1 uppercase">Shoes</p>
                              <p className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{shoesCount}</p>
                            </div>
                          </div>

                          <hr className="border-neutral-200" />
                          <div className="grid grid-cols-2 gap-3 text-center justify-items-center">
                            <div>
                              <p className="text-[10px] tracking-[0.18em] text-neutral-500 mb-1 uppercase">Avg Pace</p>
                              <p className="text-[17px] font-medium text-neutral-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{paceRangeLabel || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] tracking-[0.18em] text-neutral-500 mb-1 uppercase">Pronation</p>
                              <p className="text-[17px] font-medium text-neutral-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {profile?.pronation
                                  ? profile.pronation.charAt(0) + profile.pronation.slice(1).toLowerCase()
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {shoeBrand && shoeModel && (
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-[#007bff] tracking-wider font-semibold">
                  {shoeBrand.toUpperCase()} {shoeModel.toUpperCase()}
                </p>
                {retired && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold tracking-wider border border-orange-300 rounded">
                    RETIRED
                  </span>
                )}
              </div>
            )}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {categories.map((category) => {
                  const colors = getCategoryColor(category);
                  return (
                    <span
                      key={category}
                      className="px-3 py-1 rounded-full text-xs font-medium tracking-wide"
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                      }}
                    >
                      {category}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = rating >= star;
                  const fraction = Math.max(0, Math.min(1, rating - (star - 1)));
                  return (
                    <div key={star} className="relative">
                      <Star
                        className="size-4 fill-neutral-200 text-neutral-200"
                      />
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
              <span className="tracking-wider text-sm">{rating.toFixed(1)}</span>
            </div>
          </div>
          {createdDate && (
            <div className="flex flex-col items-end gap-1">
              {hasBeenUpdated ? (
                <>
                  <span className="tracking-widest text-xs text-neutral-400 whitespace-nowrap">
                    Updated {updatedDate}
                  </span>
                  <span className="tracking-widest text-xs text-neutral-300 whitespace-nowrap">
                    Created {createdDate}
                  </span>
                </>
              ) : (
                <span className="tracking-widest text-xs text-neutral-400 whitespace-nowrap">{createdDate}</span>
              )}
            </div>
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

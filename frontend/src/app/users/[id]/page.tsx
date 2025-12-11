"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import { Button } from "@/components/ui/button";
import ReviewCard from "@/components/ReviewCard";
import { ArrowRight, Users, TrendingUp, User } from "lucide-react";
import { useUnitPreferences } from "@/context/UnitPreferencesContext";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  shoe: { id: number; brand: string; model: string };
  fit?: "SMALL" | "TRUE_TO_SIZE" | "BIG" | null;
  cushion?: "SOFT" | "BALANCED" | "FIRM" | null;
  stability?: "NEUTRAL" | "MODERATE_SUPPORT" | "HIGH_SUPPORT" | null;
  mileage?: number | null;
  paceMinutes?: number | null; // legacy
  paceSeconds?: number | null; // legacy
  weight?: number | null; // legacy
  paceRange?: string | null;
  weightRange?: string | null;
  categories?: string[] | null;
  retired?: boolean | null;
  helpfulCount?: number;
  notHelpfulCount?: number;
  userVote?: number;
  user?: { id: number; name: string };
}

interface User {
  id: number;
  name: string;
  paceRange?: string | null;
  weightRange?: string | null;
  experience?: string | null;
  pronation?: string | null;
  createdAt?: string | null;
  nickname?: string | null;
  useNickname?: boolean | null;
}

// Range options with representative values for conversion
const paceRangeOptionsImperial = [
  { value: "pace-mile-faster-than-6-00", label: "<6:00/mile", minutes: 5, seconds: 59 },
  { value: "pace-mile-6-00-to-6-59", label: "6:00 – 6:59/mile", minutes: 6, seconds: 30 },
  { value: "pace-mile-7-00-to-7-59", label: "7:00 – 7:59/mile", minutes: 7, seconds: 30 },
  { value: "pace-mile-8-00-to-8-59", label: "8:00 – 8:59/mile", minutes: 8, seconds: 30 },
  { value: "pace-mile-9-00-to-9-59", label: "9:00 – 9:59/mile", minutes: 9, seconds: 30 },
  { value: "pace-mile-10-00-to-10-59", label: "10:00 – 10:59/mile", minutes: 10, seconds: 30 },
  { value: "pace-mile-11-00-to-11-59", label: "11:00 – 11:59/mile", minutes: 11, seconds: 30 },
  { value: "pace-mile-12-00-or-slower", label: "≥12:00/mile", minutes: 12, seconds: 0 },
] as const;

const paceRangeOptionsMetric = [
  { value: "pace-km-faster-than-3-45", label: "<3:45/km", minutes: 3, seconds: 44 },
  { value: "pace-km-3-45-to-4-19", label: "3:45 – 4:19/km", minutes: 4, seconds: 2 },
  { value: "pace-km-4-20-to-4-59", label: "4:20 – 4:59/km", minutes: 4, seconds: 40 },
  { value: "pace-km-5-00-to-5-39", label: "5:00 – 5:39/km", minutes: 5, seconds: 20 },
  { value: "pace-km-5-40-to-6-19", label: "5:40 – 6:19/km", minutes: 6, seconds: 0 },
  { value: "pace-km-6-20-to-6-59", label: "6:20 – 6:59/km", minutes: 6, seconds: 40 },
  { value: "pace-km-7-00-to-7-29", label: "7:00 – 7:29/km", minutes: 7, seconds: 15 },
  { value: "pace-km-7-30-or-slower", label: "≥7:30/km", minutes: 7, seconds: 30 },
] as const;

const weightRangeOptionsImperial = [
  { value: "weight-lbs-under-130", label: "<130 lbs", average: 125 },
  { value: "weight-lbs-130-150", label: "130 – 150 lbs", average: 140 },
  { value: "weight-lbs-150-170", label: "150 – 170 lbs", average: 160 },
  { value: "weight-lbs-170-190", label: "170 – 190 lbs", average: 180 },
  { value: "weight-lbs-190-210", label: "190 – 210 lbs", average: 200 },
  { value: "weight-lbs-over-210", label: ">210 lbs", average: 220 },
] as const;

const weightRangeOptionsMetric = [
  { value: "weight-kg-under-60", label: "<60 kg", average: 55 },
  { value: "weight-kg-60-70", label: "60 – 70 kg", average: 65 },
  { value: "weight-kg-70-80", label: "70 – 80 kg", average: 75 },
  { value: "weight-kg-80-90", label: "80 – 90 kg", average: 85 },
  { value: "weight-kg-90-100", label: "90 – 100 kg", average: 95 },
  { value: "weight-kg-over-100", label: ">100 kg", average: 110 },
] as const;

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
    convertedSeconds = totalSeconds * KM_PER_MILE;
  } else {
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

// Get pace range label with conversion
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

// Get weight range label with conversion
const getWeightRangeLabel = (weightRange?: string | null, weightUnit?: string): string | null => {
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
    convertedWeight = sourceRange.average * LB_PER_KG;
  } else {
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

export default function UserProfilePage() {
  const params = useParams();
  const userId = Number(params.id);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { distanceUnit, weightUnit, formatDistance } = useUnitPreferences();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:3001/users/${userId}`);

      if (!res.ok) {
        if (res.status === 404) {
          setError("User not found");
        } else {
          setError("Failed to load user profile");
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Error while fetching user profile:", error);
      setError("Failed to load user profile");
      setLoading(false);
    }
  }, [userId]);

  const fetchReviews = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await fetch(`http://localhost:3001/reviews/user/${userId}`, {
        headers,
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || `Failed with status ${res.status}`);
      }

      const data = await res.json();
      const normalizedReviews: Review[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.reviews)
          ? data.reviews
          : [];

      setReviews(normalizedReviews);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isNaN(userId)) {
      setError("Invalid user ID");
      setLoading(false);
      return;
    }

    fetchUser();
    fetchReviews();
  }, [fetchReviews, fetchUser, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-neutral-600 tracking-wider">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 tracking-wider">{error || "User not found"}</h1>
          <Button 
            variant="ghost" 
            className="tracking-wider rounded-none" 
            onClick={() => router.push("/")}
          >
            GO BACK HOME
          </Button>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const totalMilesLogged = reviews.reduce((sum, r) => {
    // mileage is stored in kilometers
    return sum + (r.mileage ?? 0);
  }, 0);

  const shoesReviewed = new Set(reviews.map(r => r.shoe.id)).size;
  const distanceLoggedLabel = distanceUnit === "kilometers" ? "Kilometers Logged" : "Miles Logged";

  // Format member since date
  let memberSince = "";
  if (user.createdAt) {
    const date = new Date(user.createdAt);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    memberSince = `${month} ${year}`;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Header Section */}
        <section className="py-12 lg:py-16 border-b-2 border-black relative overflow-hidden bg-[#fafafa]">

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-16">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#007bff] border-2 border-black shadow-black-crisp transform -rotate-2 mb-2">
                  <span className="text-xs font-bold tracking-widest text-white uppercase">Runner Profile</span>
                </div>
                <div className="pl-4 border-l-4 border-black">
                  <div className="relative inline-block mb-4 -ml-5">
                    <h1
                      className="text-6xl lg:text-8xl leading-[0.85] text-black bg-[#fafafa] px-1"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {user.useNickname && user.nickname 
                        ? user.nickname.toUpperCase() 
                        : (user.name ? user.name.toUpperCase() : "RUNNER")}
                    </h1>
                  </div>
                  <p className="text-neutral-600 text-lg max-w-2xl font-medium leading-relaxed">
                    View reviews and stats from this runner. Their contributions help the running community make better choices.
                  </p>
                </div>
              </div>
            </div>

            {/* Three Cards Layout - Neo-Brutalist Style */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Community Stats Card */}
              <div className="bg-white border-2 border-black p-8 shadow-black-crisp hover:shadow-black-crisp-lg transition-all duration-200 group">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#007bff] p-2 border-2 border-black text-white">
                      <Users className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold tracking-widest uppercase">Community Stats</h3>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
                    <span className="text-sm font-bold text-neutral-500 tracking-widest uppercase">Reviews</span>
                    <span className="text-3xl font-black text-black group-hover:text-[#007bff] transition-colors">{reviews.length}</span>
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
                    <span className="text-sm font-bold text-neutral-500 tracking-widest uppercase">Avg Rating</span>
                    <span className="text-3xl font-black text-black group-hover:text-[#007bff] transition-colors">{averageRating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
                    <span className="text-sm font-bold text-neutral-500 tracking-widest uppercase">Shoes</span>
                    <span className="text-3xl font-black text-black group-hover:text-[#007bff] transition-colors">{shoesReviewed}</span>
                  </div>
                </div>
              </div>

              {/* Performance Card */}
              <div className="bg-white border-2 border-black p-8 shadow-black-crisp hover:shadow-black-crisp-lg transition-all duration-200 group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-black p-2 border-2 border-black text-white">
                    <TrendingUp className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold tracking-widest uppercase">Performance</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
                    <span className="text-sm font-bold text-neutral-500 tracking-widest uppercase">{distanceLoggedLabel}</span>
                    <span className="text-2xl font-black text-black group-hover:text-[#007bff] transition-colors">{formatDistance(totalMilesLogged, 0) || (distanceUnit === "kilometers" ? "0 km" : "0 mi")}</span>
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
                    <span className="text-sm font-bold text-neutral-500 tracking-widest uppercase">Pace Range</span>
                    <span className="text-2xl font-black text-black group-hover:text-[#007bff] transition-colors">
                      {getPaceRangeLabel(user.paceRange, distanceUnit) || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
                    <span className="text-sm font-bold text-neutral-500 tracking-widest uppercase">Weight</span>
                    <span className="text-2xl font-black text-black group-hover:text-[#007bff] transition-colors">
                      {getWeightRangeLabel(user.weightRange, weightUnit) || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Runner Info Card */}
              <div className="bg-white border-2 border-black p-8 shadow-black-crisp hover:shadow-black-crisp-lg transition-all duration-200 group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-white p-2 border-2 border-black text-black">
                    <User className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold tracking-widest uppercase">Runner Info</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
                    <span className="text-sm font-bold text-neutral-500 tracking-widest uppercase">Joined</span>
                    <span className="text-xl font-black text-black group-hover:text-[#007bff] transition-colors text-right">{memberSince || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
                    <span className="text-sm font-bold text-neutral-500 tracking-widest uppercase">Experience</span>
                    <span className="text-xl font-black text-black group-hover:text-[#007bff] transition-colors text-right">
                      {user.experience 
                        ? user.experience.charAt(0) + user.experience.slice(1).toLowerCase()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
                    <span className="text-sm font-bold text-neutral-500 tracking-widest uppercase">Pronation</span>
                    <span className="text-xl font-black text-black group-hover:text-[#007bff] transition-colors text-right">
                      {user.pronation 
                        ? user.pronation.charAt(0) + user.pronation.slice(1).toLowerCase()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16">
          <div className="flex items-end justify-between mb-12 animate-fade-in">
            <div>
              <span className="tracking-widest text-[#007bff] block mb-2 font-bold">001</span>
              <h2 className="text-4xl lg:text-5xl tracking-tighter font-bold relative inline-block">
                REVIEWS
                <div className="absolute -bottom-1 left-0 w-16 h-1 bg-[#007bff]"></div>
              </h2>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-20 border border-neutral-200">
              <p className="text-neutral-600 mb-4 tracking-wide">This user hasn't left any reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div key={review.id} className="relative">
                  <ReviewCard
                    id={review.id}
                    rating={review.rating}
                    comment={review.comment}
                    createdAt={review.createdAt}
                    updatedAt={review.updatedAt}
                    userName={
                      user.useNickname && user.nickname 
                        ? user.nickname 
                        : (review.user?.name || user.name || "Runner")
                    }
                    shoeBrand={review.shoe.brand}
                    shoeModel={review.shoe.model}
                    formattedDate={formatDateISOToMMDDYYYY(review.createdAt)}
                    canEdit={false}
                    showLink={true}
                    shoeId={review.shoe.id}
                    helpfulCount={review.helpfulCount ?? 0}
                    notHelpfulCount={review.notHelpfulCount ?? 0}
                    userVote={review.userVote ?? 0}
                    position={index}
                    fit={review.fit ?? undefined}
                    cushion={review.cushion ?? undefined}
                    stability={review.stability ?? undefined}
                    mileage={review.mileage ?? undefined}
                    paceMinutes={review.paceMinutes ?? undefined}
                    paceSeconds={review.paceSeconds ?? undefined}
                    weight={review.weight ?? undefined}
                    paceRange={review.paceRange ?? undefined}
                    weightRange={review.weightRange ?? undefined}
                    categories={review.categories ?? undefined}
                    retired={review.retired ?? undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


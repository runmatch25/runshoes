"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import EditReviewDialog, { EditableReview } from '@/components/EditReviewDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReviewCard from "@/components/ReviewCard";
import { Pencil, Trash2, ArrowRight, Check, X, Users, TrendingUp, User, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

// Convert pace range to current system (returns range value, not label)
const convertPaceRangeToCurrentSystem = (
  paceRange: string,
  currentDistanceUnit: string
): string | null => {
  if (!paceRange || paceRange.trim() === "") return null;

  const isMetricRange = paceRange.startsWith("pace-km-");
  const isImperialRange = paceRange.startsWith("pace-mile-");
  const targetIsMetric = currentDistanceUnit === "kilometers";

  // If the range matches the current system, use it directly
  if ((isMetricRange && targetIsMetric) || (isImperialRange && !targetIsMetric)) {
    return paceRange;
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
  return findMatchingPaceRange(converted.minutes, converted.seconds, targetOptions);
};

// Convert weight range to current system (returns range value, not label)
const convertWeightRangeToCurrentSystem = (
  weightRange: string,
  currentWeightUnit: string
): string | null => {
  if (!weightRange || weightRange.trim() === "") return null;

  const isMetricRange = weightRange.startsWith("weight-kg-");
  const isImperialRange = weightRange.startsWith("weight-lbs-");
  const targetIsMetric = currentWeightUnit === "kg";

  // If the range matches the current system, use it directly
  if ((isMetricRange && targetIsMetric) || (isImperialRange && !targetIsMetric)) {
    return weightRange;
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
  return findMatchingWeightRange(convertedWeight, targetOptions);
};

export default function ProfilePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [editing, setEditing] = useState<EditableReview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: number }>({ open: false });
  const [userPaceRange, setUserPaceRange] = useState<string>("");
  const [userWeightRange, setUserWeightRange] = useState<string>("");
  const [userNickname, setUserNickname] = useState<string>("");
  const [useNickname, setUseNickname] = useState<boolean>(false);
  const [userExperience, setUserExperience] = useState<string>("");
  const [userPronation, setUserPronation] = useState<string>("");
  const [memberSince, setMemberSince] = useState<string>("");
  const [isEditingPaceRange, setIsEditingPaceRange] = useState(false);
  const [isEditingWeightRange, setIsEditingWeightRange] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSavedPaceRange, setJustSavedPaceRange] = useState(false);
  const [justSavedWeightRange, setJustSavedWeightRange] = useState(false);
  const [justSavedNickname, setJustSavedNickname] = useState(false);
  // Store original (unconverted) ranges from API
  const [originalPaceRange, setOriginalPaceRange] = useState<string>("");
  const [originalWeightRange, setOriginalWeightRange] = useState<string>("");
  const router = useRouter();
  const { distanceUnit, weightUnit, formatDistance, formatPace, formatWeight } = useUnitPreferences();

  const fetchReviews = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3001/reviews/me", {
        headers: { Authorization: `Bearer ${token}` },
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
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUserName("");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch user profile:", res.status, res.statusText);
        setUserName("");
        return;
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        console.error("Expected JSON response but received:", contentType);
        setUserName("");
        return;
      }

      const data = await res.json();
      setUserName(typeof data?.name === "string" ? data.name : "");
      // Store original values from API
      const apiPaceRange = data?.paceRange ?? "";
      const apiWeightRange = data?.weightRange ?? "";
      setOriginalPaceRange(apiPaceRange);
      setOriginalWeightRange(apiWeightRange);
      // Convert to current system for display
      const convertedPaceRange = apiPaceRange 
        ? (convertPaceRangeToCurrentSystem(apiPaceRange, distanceUnit) || apiPaceRange)
        : "";
      const convertedWeightRange = apiWeightRange
        ? (convertWeightRangeToCurrentSystem(apiWeightRange, weightUnit) || apiWeightRange)
        : "";
      setUserPaceRange(convertedPaceRange);
      setUserWeightRange(convertedWeightRange);
      setUserNickname(data?.nickname ?? "");
      setUseNickname(data?.useNickname ?? false);
      setUserExperience(data?.experience ?? "");
      setUserPronation(data?.pronation ?? "");
      if (data?.createdAt) {
        const date = new Date(data.createdAt);
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();
        setMemberSince(`${month} ${year}`);
      }
    } catch (error) {
      console.error("Error while fetching user profile:", error);
      setUserName("");
      setUserPaceRange("");
      setUserWeightRange("");
    }
  }, []);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:3001/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paceRange: userPaceRange || undefined,
          weightRange: userWeightRange || undefined,
          nickname: userNickname || undefined,
          useNickname: useNickname,
          experience: userExperience || undefined,
          pronation: userPronation || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();
      setUserPaceRange(data.paceRange || "");
      setUserWeightRange(data.weightRange || "");
      setUserNickname(data.nickname || "");
      setUseNickname(data.useNickname ?? false);
      setUserExperience(data.experience || "");
      setUserPronation(data.pronation || "");
      setIsEditProfileOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchUser();
    fetchReviews();
  }, [fetchReviews, fetchUser, router]);

  // Convert ranges when unit preferences change
  useEffect(() => {
    if (originalPaceRange) {
      const converted = convertPaceRangeToCurrentSystem(originalPaceRange, distanceUnit);
      setUserPaceRange(converted || originalPaceRange);
    }
  }, [distanceUnit, originalPaceRange]);

  useEffect(() => {
    if (originalWeightRange) {
      const converted = convertWeightRangeToCurrentSystem(originalWeightRange, weightUnit);
      setUserWeightRange(converted || originalWeightRange);
    }
  }, [weightUnit, originalWeightRange]);

  function openConfirm(id: number) {
    setConfirmOpen({ open: true, id });
  }

  async function handleConfirmDelete() {
    const id = confirmOpen.id;
    if (!id) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3001/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setConfirmOpen({ open: false });
    if (res.ok) fetchReviews();
    else alert('Failed to delete review');
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
                      {userName ? userName.toUpperCase() : "RUNNER"}
                      {useNickname && userNickname ? (
                        <span className="text-3xl lg:text-4xl ml-3 align-middle text-[#007bff]">
                          ({userNickname})
                        </span>
                      ) : null}
                    </h1>
                  </div>
                  <p className="text-neutral-600 text-lg max-w-2xl font-medium leading-relaxed">
                    Manage your reviews and track your journey. Your insights help the community run better.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setIsEditProfileOpen((prev) => !prev)}
                className="group relative bg-white text-black border-2 border-black px-8 py-6 rounded-none shadow-black-crisp hover:shadow-black-crisp-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Pencil className="size-5" />
                  <span className="text-base font-bold tracking-widest">
                    {isEditProfileOpen ? "CLOSE EDIT" : "EDIT PROFILE"}
                  </span>
                </div>
              </Button>
            </div>

            {isEditProfileOpen && (
              <div className="bg-white border-2 border-black p-6 lg:p-8 shadow-black-crisp mb-10">
                {/* Section Header */}
                <div className="mb-6">
                  <div className="text-sm text-[#007bff] mb-2 font-medium">Edit Profile</div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    Update your information
                  </h2>
                  <p className="text-gray-600">Keep your profile up to date</p>
                </div>

                <div className="space-y-6">
                  {/* Nickname at top */}
                  <div>
                    <label className="block tracking-wider text-base mb-3">
                      NICKNAME
                    </label>
                    <Input
                      value={userNickname}
                      onChange={(e) => setUserNickname(e.target.value)}
                      placeholder="Enter nickname (optional)"
                      maxLength={50}
                      className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all"
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <Checkbox
                        checked={useNickname}
                        onCheckedChange={(checked) => setUseNickname(checked === true)}
                        className={`border-2 cursor-pointer ${
                          useNickname 
                            ? 'border-[#007bff] bg-[#007bff]' 
                            : 'border-black bg-white'
                        }`}
                      />
                      <span className={`text-sm tracking-wider ${
                        useNickname ? 'text-[#007bff] font-semibold' : 'text-neutral-600'
                      }`}>
                        Use nickname on reviews (keeps full name private)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Top Left: Pace Range */}
                  <div>
                    <label className="block tracking-wider text-base mb-3">
                      PACE RANGE
                    </label>
                    <Select
                      value={userPaceRange}
                      onValueChange={(value) => setUserPaceRange(value)}
                    >
                      <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
                        <SelectValue placeholder="Select pace range" />
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

                  {/* Top Right: Experience */}
                  <div>
                    <label className="block tracking-wider text-base mb-3">
                      EXPERIENCE
                    </label>
                    <Select
                      value={userExperience}
                      onValueChange={(value) => setUserExperience(value)}
                    >
                      <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                        <SelectItem value="ELITE">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bottom Left: Weight Range */}
                  <div>
                    <label className="block tracking-wider text-base mb-3">
                      WEIGHT RANGE
                    </label>
                    <Select
                      value={userWeightRange}
                      onValueChange={(value) => setUserWeightRange(value)}
                    >
                      <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
                        <SelectValue placeholder="Select weight range" />
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

                  {/* Bottom Right: Pronation */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <label className="block tracking-wider text-base">
                        PRONATION
                      </label>
                      <Link 
                        href="/guide#pronation" 
                        className="text-[#007bff] hover:text-[#0056b3] transition-colors"
                        title="Learn more about pronation"
                      >
                        <Info className="size-4" />
                      </Link>
                    </div>
                    <Select
                      value={userPronation}
                      onValueChange={(value) => setUserPronation(value)}
                    >
                      <SelectTrigger className="border-2 border-black h-14 tracking-wider shadow-sm hover:shadow-blue-sm transition-all">
                        <SelectValue placeholder="Select pronation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEUTRAL">Neutral</SelectItem>
                        <SelectItem value="OVERPRONATION">Overpronation</SelectItem>
                        <SelectItem value="SUPINATION">Supination</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t-2 border-neutral-200">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      fetchUser();
                      setIsEditProfileOpen(false);
                    }}
                    className="tracking-wider rounded-none border-2 border-black hover:bg-neutral-50"
                  >
                    CANCEL
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-black text-white hover:bg-neutral-800 tracking-wider rounded-none border-2 border-black shadow-sm hover:shadow-blue-sm transition-all"
                  >
                    {isSaving ? "SAVING..." : "SAVE CHANGES"}
                  </Button>
                </div>
              </div>
            )}

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
                      {getPaceRangeLabel(userPaceRange, distanceUnit) || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
                    <span className="text-sm font-bold text-neutral-500 tracking-widest uppercase">Weight</span>
                    <span className="text-2xl font-black text-black group-hover:text-[#007bff] transition-colors">
                      {getWeightRangeLabel(userWeightRange, weightUnit) || "—"}
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
                      {userExperience 
                        ? userExperience.charAt(0) + userExperience.slice(1).toLowerCase()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
                    <span className="text-sm font-bold text-neutral-500 tracking-widest uppercase">Pronation</span>
                    <span className="text-xl font-black text-black group-hover:text-[#007bff] transition-colors text-right">
                      {userPronation 
                        ? userPronation.charAt(0) + userPronation.slice(1).toLowerCase()
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
                MY REVIEWS
                <div className="absolute -bottom-1 left-0 w-16 h-1 bg-[#007bff]"></div>
              </h2>
            </div>
            <Button 
              variant="ghost" 
              className="hover:bg-neutral-100 group tracking-wider rounded-none" 
              asChild
            >
              <Link href="/review">
                SUBMIT REVIEW
                <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-20 border border-neutral-200">
              <p className="text-neutral-600 mb-4 tracking-wide">You haven't left any reviews yet.</p>
              <Button 
                className="bg-[#007bff] text-white hover:bg-[#0056b3] tracking-wider rounded-none" 
                asChild
              >
                <Link href="/review">
                  SUBMIT YOUR FIRST REVIEW
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
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
                    userName={userName || "Runner"}
                    shoeBrand={review.shoe.brand}
                    shoeModel={review.shoe.model}
                    formattedDate={formatDateISOToMMDDYYYY(review.createdAt)}
                    canEdit={true}
                    onEdit={() =>
                      setEditing({
                        id: review.id,
                        rating: review.rating,
                        comment: review.comment ?? "",
                        fit: review.fit ?? null,
                        cushion: review.cushion ?? null,
                        stability: review.stability ?? null,
                        mileage: review.mileage ?? null,
                        paceMinutes: review.paceMinutes ?? null,
                        paceSeconds: review.paceSeconds ?? null,
                        weight: review.weight ?? null,
                        paceRange: review.paceRange ?? null,
                        weightRange: review.weightRange ?? null,
                        retired: review.retired ?? null,
                      })
                    }
                    onDelete={() => openConfirm(review.id)}
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

      <EditReviewDialog 
        open={Boolean(editing)} 
        onClose={() => setEditing(null)} 
        review={editing} 
        onSaved={() => fetchReviews()} 
      />
      <ConfirmDialog
        open={confirmOpen.open}
        title="Delete review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmOpen({ open: false })}
      />
    </div>
  );
}

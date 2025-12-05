"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import EditReviewDialog, { EditableReview } from '@/components/EditReviewDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReviewCard from "@/components/ReviewCard";
import { Pencil, Trash2, ArrowRight, Check, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const paceRangeOptionsImperial = [
  { value: "pace-mile-faster-than-6-00", label: "<6:00/mile" },
  { value: "pace-mile-6-00-to-6-59", label: "6:00 – 6:59/mile" },
  { value: "pace-mile-7-00-to-7-59", label: "7:00 – 7:59/mile" },
  { value: "pace-mile-8-00-to-8-59", label: "8:00 – 8:59/mile" },
  { value: "pace-mile-9-00-to-9-59", label: "9:00 – 9:59/mile" },
  { value: "pace-mile-10-00-to-10-59", label: "10:00 – 10:59/mile" },
  { value: "pace-mile-11-00-to-11-59", label: "11:00 – 11:59/mile" },
  { value: "pace-mile-12-00-or-slower", label: "≥12:00/mile" },
] as const;

const paceRangeOptionsMetric = [
  { value: "pace-km-faster-than-3-45", label: "<3:45/km" },
  { value: "pace-km-3-45-to-4-19", label: "3:45 – 4:19/km" },
  { value: "pace-km-4-20-to-4-59", label: "4:20 – 4:59/km" },
  { value: "pace-km-5-00-to-5-39", label: "5:00 – 5:39/km" },
  { value: "pace-km-5-40-to-6-19", label: "5:40 – 6:19/km" },
  { value: "pace-km-6-20-to-6-59", label: "6:20 – 6:59/km" },
  { value: "pace-km-7-00-to-7-29", label: "7:00 – 7:29/km" },
  { value: "pace-km-7-30-or-slower", label: "≥7:30/km" },
] as const;

const weightRangeOptionsImperial = [
  { value: "weight-lbs-under-130", label: "<130 lbs" },
  { value: "weight-lbs-130-150", label: "130 – 150 lbs" },
  { value: "weight-lbs-150-170", label: "150 – 170 lbs" },
  { value: "weight-lbs-170-190", label: "170 – 190 lbs" },
  { value: "weight-lbs-190-210", label: "190 – 210 lbs" },
  { value: "weight-lbs-over-210", label: ">210 lbs" },
] as const;

const weightRangeOptionsMetric = [
  { value: "weight-kg-under-60", label: "<60 kg" },
  { value: "weight-kg-60-70", label: "60 – 70 kg" },
  { value: "weight-kg-70-80", label: "70 – 80 kg" },
  { value: "weight-kg-80-90", label: "80 – 90 kg" },
  { value: "weight-kg-90-100", label: "90 – 100 kg" },
  { value: "weight-kg-over-100", label: ">100 kg" },
] as const;

export default function ProfilePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [editing, setEditing] = useState<EditableReview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: number }>({ open: false });
  const [userPaceRange, setUserPaceRange] = useState<string>("");
  const [userWeightRange, setUserWeightRange] = useState<string>("");
  const [isEditingPaceRange, setIsEditingPaceRange] = useState(false);
  const [isEditingWeightRange, setIsEditingWeightRange] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSavedPaceRange, setJustSavedPaceRange] = useState(false);
  const [justSavedWeightRange, setJustSavedWeightRange] = useState(false);
  const router = useRouter();
  const { distanceUnit, weightUnit } = useUnitPreferences();

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
      setUserPaceRange(data?.paceRange ?? "");
      setUserWeightRange(data?.weightRange ?? "");
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
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      setIsEditingPaceRange(false);
      setIsEditingWeightRange(false);
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Header Section */}
        <section className="py-16 border-b-2 border-neutral-200 relative overflow-hidden">
          {/* Animated background accent */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
            <div className="w-full h-full gradient-blue-light"></div>
          </div>
          
          <div className="relative z-10">
            <div className="mb-8 animate-fade-in">
              <span className="tracking-widest text-[#007bff] block mb-2 font-bold">PROFILE</span>
              <h1 
                className="text-5xl lg:text-7xl leading-[0.9] mb-4 relative" 
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
              >
                {userName ? userName.toUpperCase() : "RUNNER"}
                <div className="absolute -bottom-2 left-0 w-24 h-1 bg-[#007bff]"></div>
              </h1>
              <p className="text-neutral-600 text-lg max-w-2xl leading-relaxed">
                Manage your reviews and revisit the shoes you've rated. Your contributions help the running community make better choices.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mt-12">
              <div className="border-l-2 border-[#007bff] pl-4 hover:border-l-4 transition-all animate-scale-in">
                <div className="text-4xl lg:text-5xl mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  <span className="text-[#007bff]">{reviews.length}</span>
                </div>
                <p className="text-neutral-600 tracking-wider font-bold">REVIEWS</p>
              </div>
              <div className="border-l-2 border-[#007bff] pl-4 hover:border-l-4 transition-all animate-scale-in animate-delay-100">
                <div className="text-4xl lg:text-5xl mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  <span className="text-[#007bff]">{averageRating.toFixed(1)}</span>
                </div>
                <p className="text-neutral-600 tracking-wider font-bold">AVG RATING</p>
              </div>
              <div className="border-l-2 border-[#007bff] pl-4 hover:border-l-4 transition-all animate-scale-in animate-delay-200">
                <div className="text-4xl lg:text-5xl mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  <span className="text-[#007bff]">{new Set(reviews.map(r => r.shoe.id)).size}</span>
                </div>
                <p className="text-neutral-600 tracking-wider font-bold">SHOES REVIEWED</p>
              </div>
              <div className="border-l-2 border-[#007bff] pl-4 hover:border-l-4 transition-all animate-scale-in animate-delay-300 relative group">
                {!isEditingPaceRange ? (
                  <>
                    <div className="text-2xl lg:text-3xl mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      <span className="text-[#007bff]">
                        {userPaceRange
                          ? (distanceUnit === "kilometers" ? paceRangeOptionsMetric : paceRangeOptionsImperial).find(
                              (opt) => opt.value === userPaceRange
                            )?.label || "Not set"
                          : "Not set"}
                      </span>
                    </div>
                    <p className="text-neutral-600 tracking-wider font-bold">AVG PACE RANGE</p>
                    <button
                      onClick={() => setIsEditingPaceRange(true)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-100 rounded"
                      title="Edit pace range"
                    >
                      <Pencil className="size-3 text-neutral-500" />
                    </button>
                  </>
                ) : (
                  <div className="mb-2">
                    <Select
                      value={userPaceRange}
                      open={isEditingPaceRange}
                      onOpenChange={(open) => {
                        if (!open) {
                          // If closing without saving (user clicked outside or cancelled)
                          if (!isSaving && !justSavedPaceRange) {
                            setIsEditingPaceRange(false);
                            fetchUser(); // Reset to original values
                          } else if (justSavedPaceRange) {
                            // Just saved, don't reset
                            setJustSavedPaceRange(false);
                            setIsEditingPaceRange(false);
                          }
                        } else {
                          setIsEditingPaceRange(true);
                          setJustSavedPaceRange(false);
                        }
                      }}
                      onValueChange={(value) => {
                        setUserPaceRange(value); // Update immediately for UI
                        // Auto-save on selection
                        const token = localStorage.getItem("token");
                        if (token) {
                          setIsSaving(true);
                          fetch("http://localhost:3001/auth/profile", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              paceRange: value || undefined,
                              weightRange: userWeightRange || undefined,
                            }),
                          })
                            .then((res) => {
                              if (res.ok) {
                                return res.json();
                              } else {
                                throw new Error("Failed to update");
                              }
                            })
                            .then((data) => {
                              // Update with server response
                              setUserPaceRange(data.paceRange || "");
                              setJustSavedPaceRange(true);
                              setIsEditingPaceRange(false);
                            })
                            .catch((error) => {
                              console.error("Error updating profile:", error);
                              alert("Failed to update profile. Please try again.");
                              // Revert to original value on error
                              fetchUser();
                            })
                            .finally(() => setIsSaving(false));
                        }
                      }}
                    >
                      <SelectTrigger 
                        className="border-0 shadow-none focus:ring-0 h-auto p-0 w-full text-left justify-start bg-transparent hover:bg-transparent"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        <SelectValue>
                          <span 
                            className="text-2xl lg:text-3xl text-[#007bff]"
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                          >
                            {userPaceRange
                              ? (distanceUnit === "kilometers" ? paceRangeOptionsMetric : paceRangeOptionsImperial).find(
                                  (opt) => opt.value === userPaceRange
                                )?.label || "Not set"
                              : "Not set"}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black">
                        {(distanceUnit === "kilometers" ? paceRangeOptionsMetric : paceRangeOptionsImperial).map(
                          (option) => (
                            <SelectItem 
                              key={option.value} 
                              value={option.value}
                              className="tracking-wider text-2xl lg:text-3xl cursor-pointer hover:bg-neutral-100"
                              style={{ 
                                fontFamily: "'Bebas Neue', sans-serif", 
                                color: option.value === userPaceRange ? '#007bff' : 'inherit',
                                padding: '0.75rem 1.5rem'
                              }}
                            >
                              {option.label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-neutral-600 tracking-wider font-bold mt-2">AVG PACE RANGE</p>
                  </div>
                )}
              </div>
              <div className="border-l-2 border-[#007bff] pl-4 hover:border-l-4 transition-all animate-scale-in animate-delay-400 relative group">
                {!isEditingWeightRange ? (
                  <>
                    <div className="text-2xl lg:text-3xl mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      <span className="text-[#007bff]">
                        {userWeightRange
                          ? (weightUnit === "kg" ? weightRangeOptionsMetric : weightRangeOptionsImperial).find(
                              (opt) => opt.value === userWeightRange
                            )?.label || "Not set"
                          : "Not set"}
                      </span>
                    </div>
                    <p className="text-neutral-600 tracking-wider font-bold">WEIGHT RANGE</p>
                    <button
                      onClick={() => setIsEditingWeightRange(true)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-100 rounded"
                      title="Edit weight range"
                    >
                      <Pencil className="size-3 text-neutral-500" />
                    </button>
                  </>
                ) : (
                  <div className="mb-2">
                    <Select
                      value={userWeightRange}
                      open={isEditingWeightRange}
                      onOpenChange={(open) => {
                        if (!open) {
                          // If closing without saving (user clicked outside or cancelled)
                          if (!isSaving && !justSavedWeightRange) {
                            setIsEditingWeightRange(false);
                            fetchUser(); // Reset to original values
                          } else if (justSavedWeightRange) {
                            // Just saved, don't reset
                            setJustSavedWeightRange(false);
                            setIsEditingWeightRange(false);
                          }
                        } else {
                          setIsEditingWeightRange(true);
                          setJustSavedWeightRange(false);
                        }
                      }}
                      onValueChange={(value) => {
                        setUserWeightRange(value); // Update immediately for UI
                        // Auto-save on selection
                        const token = localStorage.getItem("token");
                        if (token) {
                          setIsSaving(true);
                          fetch("http://localhost:3001/auth/profile", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              paceRange: userPaceRange || undefined,
                              weightRange: value || undefined,
                            }),
                          })
                            .then((res) => {
                              if (res.ok) {
                                return res.json();
                              } else {
                                throw new Error("Failed to update");
                              }
                            })
                            .then((data) => {
                              // Update with server response
                              setUserWeightRange(data.weightRange || "");
                              setJustSavedWeightRange(true);
                              setIsEditingWeightRange(false);
                            })
                            .catch((error) => {
                              console.error("Error updating profile:", error);
                              alert("Failed to update profile. Please try again.");
                              // Revert to original value on error
                              fetchUser();
                            })
                            .finally(() => setIsSaving(false));
                        }
                      }}
                    >
                      <SelectTrigger 
                        className="border-0 shadow-none focus:ring-0 h-auto p-0 w-full text-left justify-start bg-transparent hover:bg-transparent"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        <SelectValue>
                          <span 
                            className="text-2xl lg:text-3xl text-[#007bff]"
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                          >
                            {userWeightRange
                              ? (weightUnit === "kg" ? weightRangeOptionsMetric : weightRangeOptionsImperial).find(
                                  (opt) => opt.value === userWeightRange
                                )?.label || "Not set"
                              : "Not set"}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black">
                        {(weightUnit === "kg" ? weightRangeOptionsMetric : weightRangeOptionsImperial).map(
                          (option) => (
                            <SelectItem 
                              key={option.value} 
                              value={option.value}
                              className="tracking-wider text-2xl lg:text-3xl cursor-pointer hover:bg-neutral-100"
                              style={{ 
                                fontFamily: "'Bebas Neue', sans-serif", 
                                color: option.value === userWeightRange ? '#007bff' : 'inherit',
                                padding: '0.75rem 1.5rem'
                              }}
                            >
                              {option.label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-neutral-600 tracking-wider font-bold mt-2">WEIGHT RANGE</p>
                  </div>
                )}
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

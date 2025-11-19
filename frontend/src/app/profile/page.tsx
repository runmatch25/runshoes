"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import EditReviewDialog, { EditableReview } from '@/components/EditReviewDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReviewCard from "@/components/ReviewCard";
import { Pencil, Trash2, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string | null;
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
  helpfulCount?: number;
  notHelpfulCount?: number;
  userVote?: number;
  user?: { id: number; name: string };
}

export default function ProfilePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [editing, setEditing] = useState<EditableReview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: number }>({ open: false });
  const router = useRouter();

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
    } catch (error) {
      console.error("Error while fetching user profile:", error);
      setUserName("");
    }
  }, []);

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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-12">
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
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />

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

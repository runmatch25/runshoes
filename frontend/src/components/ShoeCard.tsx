"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ShoeCardProps {
  id: number;
  brand: string;
  model: string;
  type: string;
  imageUrl?: string | null;
  reviews?: { rating: number; comment?: string; createdAt?: string }[];
  avgRating?: number;
  latestReviewDate?: string;
  showDate?: boolean;
  position?: number;
}

const FALLBACK_IMAGE = "/images/shoes/placeholder-volt.svg";

export default function ShoeCard({
  id,
  brand,
  model,
  type,
  imageUrl,
  reviews,
  avgRating,
  latestReviewDate,
  showDate = false,
  position = 0,
}: ShoeCardProps) {
  const reviewCount = reviews?.length ?? 0;
  const displayRating =
    avgRating !== undefined
      ? avgRating.toFixed(1)
      : reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";
  const resolvedImageSrc =
    imageUrl && imageUrl.trim().length > 0 ? imageUrl : FALLBACK_IMAGE;

  // Subtle depth variations for editorial feel
  const getCardStyle = () => {
    const baseOpacity = 1 - (position * 0.04);
    const yOffset = position * 4;
    
    return {
      opacity: baseOpacity,
      transform: `translateY(${yOffset}px)`
    };
  };

  const rating = parseFloat(displayRating);
  const roundedRating = Math.round(rating);

  return (
    <Link href={`/shoes/${id}`} className="group cursor-pointer hover-lift block">
      <div 
        className="bg-white border-2 border-black hover:shadow-[10px_10px_0px_0px_rgba(0,123,255,0.8)] hover:border-[#007bff] transition-all duration-300 overflow-hidden"
        style={position !== undefined ? getCardStyle() : undefined}
      >
        {/* Image */}
        <div className="aspect-square bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] overflow-hidden border-b-2 border-black relative">
          <ImageWithFallback
            src={resolvedImageSrc}
            alt={`${brand} ${model}`}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#007bff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 bg-white group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-[#e6f2ff]/30 transition-all duration-300">
          {/* Category & Reviews */}
          <div className="flex items-center justify-between border-b-2 border-neutral-200 group-hover:border-[#007bff] pb-3 transition-colors">
            <span className="tracking-widest text-xs text-[#007bff] font-bold">{type.toUpperCase()}</span>
            <span className="tracking-widest text-xs text-neutral-500 group-hover:text-[#007bff] transition-colors">{reviewCount} REVIEWS</span>
          </div>

          {/* Shoe Name */}
          <h3 className="text-xl tracking-tight leading-tight min-h-[3.5rem] group-hover:text-[#007bff] transition-colors font-bold">
            {brand} {model}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`size-4 transition-all duration-300 ${
                    star <= roundedRating
                      ? 'fill-[#007bff] text-[#007bff] group-hover:scale-110'
                      : 'fill-neutral-200 text-neutral-200'
                  }`}
                />
              ))}
            </div>
            <span className="tracking-wider font-bold text-neutral-700 group-hover:text-[#007bff] transition-colors">{displayRating}</span>
          </div>

          {showDate && latestReviewDate && (
            <div className="pt-3 border-t-2 border-neutral-200 group-hover:border-[#007bff] transition-colors">
              <span className="tracking-widest text-xs text-neutral-400 group-hover:text-[#007bff] transition-colors">
                {new Date(latestReviewDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

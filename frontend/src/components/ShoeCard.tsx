"use client";

import TiltedCard from "./TiltedCard";
import { cardTheme } from "./cardTheme";

interface ShoeCardProps {
  id: number;
  brand: string;
  model: string;
  type: string;
  reviews?: { rating: number; comment?: string; createdAt?: string }[];
  avgRating?: number;
  latestReviewDate?: string;
  showDate?: boolean;
  showShadow?: boolean;
}

export default function ShoeCard({
  id,
  brand,
  model,
  type,
  reviews,
  avgRating,
  latestReviewDate,
  showDate = false,
  showShadow = true,
}: ShoeCardProps) {
  const reviewCount = reviews?.length ?? 0;
  const displayRating = avgRating !== undefined ? avgRating.toFixed(1) : 
    (reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0");

  return (
    <TiltedCard href={`/shoes/${id}`}>
      <div
        style={{
          padding: cardTheme.padding,
          borderRadius: cardTheme.borderRadius,
          background: cardTheme.background,
          border: cardTheme.border,
          boxShadow: showShadow ? cardTheme.boxShadow : "none",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glare effect overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
          className="glare-overlay"
        />
        <strong
          style={{
            fontSize: cardTheme.titleFontSize,
            display: 'block',
            textAlign: 'center',
            color: cardTheme.titleColor,
            zIndex: 1,
          }}
        >
          {brand} {model}
        </strong>
        <div
          style={{
            marginTop: cardTheme.contentGap,
            color: cardTheme.bodyColor,
            textAlign: 'center',
            fontSize: cardTheme.bodyFontSize,
            zIndex: 1,
          }}
        >
          {type} • {reviewCount} review{reviewCount !== 1 ? "s" : ""} •{' '}
          {showDate && latestReviewDate ? (
            <span style={{ fontWeight: 700 }}>{latestReviewDate}</span>
          ) : (
            <span style={{ fontWeight: 700 }}>{displayRating}</span>
          )}
          {!showDate && ' ⭐'}
        </div>
      </div>
    </TiltedCard>
  );
}



"use client";

import TiltedCard from "./TiltedCard";
import { cardTheme } from "./cardTheme";
import { StarRating } from "@/components/StarRating";
import { Pencil, Trash2 } from "lucide-react";

interface ReviewCardProps {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string | null;
  userName: string;
  shoeBrand: string;
  shoeModel: string;
  formattedDate?: string;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  showLink?: boolean;
  shoeId?: number;
}

export default function ReviewCard({
  rating,
  comment,
  userName,
  shoeBrand,
  shoeModel,
  formattedDate,
  canEdit = false,
  onEdit,
  onDelete,
  showLink = true,
  shoeId,
}: ReviewCardProps) {
  const cardContent = (
    <div
      style={{
        padding: cardTheme.padding,
        borderRadius: cardTheme.borderRadius,
        background: cardTheme.background,
        border: cardTheme.border,
        boxShadow: cardTheme.boxShadow,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
      <div className="mb-2 flex items-start justify-between text-xs font-medium uppercase tracking-[0.3em] text-foreground/70">
        <span>
          {userName} reviewed {shoeBrand} {shoeModel}
        </span>
        {canEdit && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="rounded-md p-1 text-muted-foreground transition hover:text-foreground"
                aria-label="Edit review"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="rounded-md p-1 text-muted-foreground transition hover:text-destructive"
                aria-label="Delete review"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="z-10 mt-2 flex items-center gap-2">
        <StarRating value={rating} readOnly size="md" />
        <span className="text-xs font-medium text-muted-foreground">{rating}/5</span>
      </div>
      <p className="z-10 mt-3 flex-1 text-sm text-foreground/80">
        {comment}
      </p>
      {formattedDate && (
        <span className="absolute bottom-2 right-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {formattedDate}
        </span>
      )}
    </div>
  );

  if (showLink && shoeId) {
    return <TiltedCard href={`/shoes/${shoeId}`}>{cardContent}</TiltedCard>;
  }

  // For non-clickable cards, still use TiltedCard for consistent styling
  return <TiltedCard>{cardContent}</TiltedCard>;
}


"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

interface StarRatingProps {
  value?: number;
  max?: number;
  onChange?: (next: number) => void;
  readOnly?: boolean;
  size?: Size;
  className?: string;
}

export function StarRating({
  value = 0,
  max = 5,
  onChange,
  readOnly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const displayValue = hovered ?? value;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, index) => {
        const starNumber = index + 1;
        const filled = displayValue >= starNumber;
        const fraction = Math.max(0, Math.min(1, displayValue - index));

        if (readOnly) {
          return (
            <div key={starNumber} className="relative">
              <Star className={cn(sizeClasses[size], "text-border")} strokeWidth={1.5} />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${Math.min(1, Math.max(0, fraction)) * 100}%` }}
              >
                <Star className={cn(sizeClasses[size], "text-primary")} fill="currentColor" strokeWidth={1.5} />
              </div>
            </div>
          );
        }

        return (
          <button
            key={starNumber}
            type="button"
            className="group relative"
            onMouseEnter={() => setHovered(starNumber)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(starNumber)}
            onBlur={() => setHovered(null)}
            onClick={() => onChange?.(starNumber)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors text-border group-hover:text-primary"
              )}
              strokeWidth={1.5}
              fill="none"
            />
            {fraction > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${Math.min(1, Math.max(0, fraction)) * 100}%` }}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    "text-primary transition-colors"
                  )}
                  strokeWidth={1.5}
                  fill="currentColor"
                />
              </div>
            )}
            <span className="sr-only">{starNumber} star{starNumber > 1 ? "s" : ""}</span>
          </button>
        );
      })}
    </div>
  );
}


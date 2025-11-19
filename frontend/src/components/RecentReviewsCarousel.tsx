"use client";

import { useMemo } from "react";
import ShoeCard from "@/components/ShoeCard";
import { formatDateISOToMMDDYYYY } from "@/lib/formatDate";

type Shoe = {
  id: number;
  brand: string;
  model: string;
  type: string;
  imageUrl?: string | null;
  reviews?: { rating: number; comment?: string; createdAt?: string }[];
  latestReviewISO: string;
};

type RecentReviewsCarouselProps = {
  shoes: Shoe[];
};

export default function RecentReviewsCarousel({ shoes }: RecentReviewsCarouselProps) {
  const { carouselItems, shouldAnimate } = useMemo(() => {
    if (!shoes || shoes.length === 0) {
      return { carouselItems: [] as Shoe[], shouldAnimate: false };
    }

    const list = shoes.slice(0, 10);
    const shouldAnimate = list.length > 1;
    const items = shouldAnimate ? [...list, ...list] : list;

    return { carouselItems: items, shouldAnimate };
  }, [shoes]);

  if (carouselItems.length === 0) {
    return null;
  }

  return (
    <div className="recent-carousel">
      <ul className={`recent-carousel__track${shouldAnimate ? " recent-carousel__track--animate" : ""}`}>
        {carouselItems.map((shoe, index) => (
          <li key={`${shoe.id}-${index}`} className="recent-carousel__item">
            <ShoeCard
              id={shoe.id}
              brand={shoe.brand}
              model={shoe.model}
              type={shoe.type}
              imageUrl={shoe.imageUrl}
              reviews={shoe.reviews}
              latestReviewDate={formatDateISOToMMDDYYYY(shoe.latestReviewISO)}
              showDate
              showShadow={false}
            />
          </li>
        ))}
      </ul>
      <style jsx>{`
        .recent-carousel {
          overflow: hidden;
          width: 100%;
          padding: 0 1rem;
          position: relative;
        }

        .recent-carousel__track {
          display: flex;
          gap: 1.5rem;
          list-style: none;
          padding: 0;
          margin: 0;
          will-change: transform;
        }

        .recent-carousel__track--animate {
          animation: recent-carousel-scroll 32s linear infinite;
        }

        .recent-carousel__item {
          min-width: 210px;
          max-width: 270px;
          flex: 0 0 auto;
          display: flex;
        }

        @keyframes recent-carousel-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 768px) {
          .recent-carousel__track {
            gap: 1rem;
          }

          .recent-carousel__track--animate {
            animation-duration: 24s;
          }

          .recent-carousel__item {
            min-width: 180px;
            max-width: 220px;
          }
        }
      `}</style>
    </div>
  );
}


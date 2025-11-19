"use client";

import { Fragment, useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { fetchShoes, fetchReviews } from '@/lib/api';
import { useUnitPreferences } from '@/context/UnitPreferencesContext';

interface Stats {
  reviews: number;
  registeredRunners: number;
  shoesReviewed: number;
  milesLogged: number;
  weeklyReviews: number;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function ScrollingStats() {
  const { toDisplayDistance, distanceLabel } = useUnitPreferences();
  const [stats, setStats] = useState<Stats>({
    reviews: 0,
    registeredRunners: 0,
    shoesReviewed: 0,
    milesLogged: 0,
    weeklyReviews: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [shoes, reviews] = await Promise.all([
          fetchShoes(),
          fetchReviews(),
        ]);

        // Calculate stats
        const totalReviews = Array.isArray(reviews) ? reviews.length : 0;
        const uniqueShoes = Array.isArray(reviews) 
          ? new Set(reviews.map((r: any) => r.shoeId || r.shoe?.id).filter(Boolean)).size 
          : 0;
        const uniqueUsers = Array.isArray(reviews) 
          ? new Set(reviews.map((r: any) => r.userId || r.user?.id).filter(Boolean)).size 
          : 0;
        
        // Calculate total mileage from reviews
        const totalMiles = Array.isArray(reviews)
          ? reviews.reduce((sum: number, r: any) => {
              return sum + (r.mileage || 0);
            }, 0)
          : 0;

        // Calculate weekly reviews (reviews from last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyReviews = Array.isArray(reviews)
          ? reviews.filter((r: any) => {
              if (!r.createdAt) return false;
              try {
                return new Date(r.createdAt) >= oneWeekAgo;
              } catch {
                return false;
              }
            }).length
          : 0;

        setStats({
          reviews: totalReviews,
          registeredRunners: uniqueUsers || 0,
          shoesReviewed: uniqueShoes || (Array.isArray(shoes) ? shoes.length : 0),
          milesLogged: Math.round(totalMiles),
          weeklyReviews: weeklyReviews,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
        // Set default values on error
        setStats({
          reviews: 0,
          registeredRunners: 0,
          shoesReviewed: 0,
          milesLogged: 0,
          weeklyReviews: 0,
        });
      }
    }

    loadStats();
  }, []);

  const convertedDistance = toDisplayDistance(stats.milesLogged);
  const statsArray = [
    { label: 'REVIEWS', value: formatNumber(stats.reviews) },
    { label: 'REGISTERED RUNNERS', value: formatNumber(stats.registeredRunners) },
    { label: 'SHOES REVIEWED', value: formatNumber(stats.shoesReviewed) },
    { label: `${distanceLabel.toUpperCase()} LOGGED`, value: convertedDistance !== null ? Math.round(convertedDistance).toLocaleString() : '0' },
    { label: 'WEEKLY REVIEWS', value: formatNumber(stats.weeklyReviews) },
  ];

  // Duplicate the stats array to create seamless loop
  const duplicatedStats = [...statsArray, ...statsArray, ...statsArray];

  return (
    <div className="border-y-2 border-black bg-black overflow-hidden relative group scrolling-stats-container">
      <div className="flex animate-scroll-left whitespace-nowrap">
        {duplicatedStats.map((stat, index) => (
          <Fragment key={index}>
            <div className="inline-flex items-center gap-3 px-8 py-4">
              <span className="text-[#007bff] tracking-widest font-bold text-lg">
                {stat.value}
              </span>
              <span className="text-white tracking-widest text-lg">
                {stat.label}
              </span>
            </div>
            {index < duplicatedStats.length - 1 && (
              <div className="flex items-center px-8">
                <Zap className="w-4 h-4 text-[#007bff] fill-[#007bff]" />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}


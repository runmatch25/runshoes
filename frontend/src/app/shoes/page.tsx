"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ShoeCard from "@/components/ShoeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Shoe {
  id: number;
  brand: string;
  model: string;
  type: string;
  reviews?: { rating: number; createdAt?: string | null }[];
}

export default function ShoesPage() {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [filters, setFilters] = useState({
    type: "",
    minRating: "",
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "highest_rating" | "lowest_rating" | "most_reviewed" | "most_recent" | ""
  >("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const TYPE_ALL_OPTION = "all";
  const RATING_ANY_OPTION = "any";
  const SORT_NONE_OPTION = "none";

  const fetchShoesWithArgs = async (typeVal: string, minRatingVal: string) => {
    try {
      const query = new URLSearchParams();
      if (typeVal) query.append("type", typeVal);
      if (minRatingVal) query.append("minRating", minRatingVal);
      const res = await fetch(`http://localhost:3001/shoes?${query.toString()}`);
      const data = await res.json();
      setShoes(data);
    } catch (err) {
      console.error("Failed to fetch shoes:", err);
    }
  };

  const fetchShoes = async () => {
    try {
      const query = new URLSearchParams();
      if (filters.type) query.append("type", filters.type);
      if (filters.minRating) query.append("minRating", filters.minRating);

      const res = await fetch(`http://localhost:3001/shoes?${query.toString()}`);
      const data = await res.json();
      setShoes(data);
    } catch (err) {
      console.error("Failed to fetch shoes:", err);
    }
  };

  const syncUrl = (next: {
    type?: string;
    minRating?: string;
    search?: string;
    sortBy?: string;
  }) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    const nextType = next.type ?? filters.type;
    const nextMinRating = next.minRating ?? filters.minRating;
    const nextSearch = next.search ?? search;
    const nextSort = next.sortBy ?? sortBy;

    // set or delete
    const setOrDelete = (key: string, value: string) => {
      if (value && value !== "") params.set(key, value);
      else params.delete(key);
    };

    setOrDelete("type", nextType);
    setOrDelete("minRating", nextMinRating);
    setOrDelete("q", nextSearch);
    setOrDelete("sort", nextSort);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  // Sync state to URL on any URL change and fetch accordingly
  useEffect(() => {
    const qpType = searchParams?.get("type") ?? "";
    const qpMin = searchParams?.get("minRating") ?? "";
    const qpQ = searchParams?.get("q") ?? "";
    const qpSort = (searchParams?.get("sort") ?? "") as typeof sortBy;

    setFilters({ type: qpType, minRating: qpMin });
    setSearch(qpQ);
    setSortBy(qpSort);

    if (qpType || qpMin) {
      fetchShoesWithArgs(qpType, qpMin);
    } else {
      // No backend filters present -> reset to all shoes
      fetchShoes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // derive displayed shoes based on search and sort; run type and minRating are handled by backend
  const displayedShoes = (() => {
    const withComputed = shoes.map((s) => {
      const avgRating =
        s.reviews && s.reviews.length > 0
          ? s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length
          : null;
      const latestReviewMs =
        s.reviews && s.reviews.length > 0
          ? Math.max(
              ...s.reviews
                .map((r) => (r.createdAt ? new Date(r.createdAt).getTime() : NaN))
                .filter((n) => !Number.isNaN(n))
            )
          : -Infinity;
      return { ...s, __avgRating: avgRating, __latestReviewMs: latestReviewMs } as Shoe & {
        __avgRating: number | null;
        __latestReviewMs: number;
      };
    });

    // search by brand or model (case-insensitive)
    const term = search.trim().toLowerCase();
    let filtered = withComputed.filter((s) => {
      if (!term) return true;
      return (
        s.brand.toLowerCase().includes(term) || s.model.toLowerCase().includes(term)
      );
    });

    // sort options
    switch (sortBy) {
      case "highest_rating":
        filtered = filtered
          .slice()
          .sort((a, b) => {
            const ar = a.__avgRating ?? -Infinity;
            const br = b.__avgRating ?? -Infinity;
            if (br !== ar) return br - ar;
            // tie-breaker: more reviews first
            const ac = a.reviews?.length ?? 0;
            const bc = b.reviews?.length ?? 0;
            return bc - ac;
          });
        break;
      case "lowest_rating":
        filtered = filtered
          .slice()
          .sort((a, b) => {
            const ar = a.__avgRating ?? Infinity;
            const br = b.__avgRating ?? Infinity;
            if (ar !== br) return ar - br;
            const ac = a.reviews?.length ?? 0;
            const bc = b.reviews?.length ?? 0;
            return ac - bc;
          });
        break;
      case "most_reviewed":
        filtered = filtered
          .slice()
          .sort((a, b) => (b.reviews?.length ?? 0) - (a.reviews?.length ?? 0));
        break;
      case "most_recent":
        filtered = filtered
          .slice()
          .sort((a, b) => b.__latestReviewMs - a.__latestReviewMs);
        break;
      default:
        // no sorting
        break;
    }

    return filtered as Shoe[];
  })();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Running Shoes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Filter and compare shoes by run type, rating, and recency of reviews.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Search shoes
          </label>
          <Input
            placeholder="Search by brand or model"
            value={search}
            onChange={(e) => {
              const v = e.target.value;
              setSearch(v);
              syncUrl({ search: v });
            }}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Run type
          </label>
          <Select
            value={filters.type || undefined}
            onValueChange={(value) => {
              const nextValue = value === TYPE_ALL_OPTION ? "" : value;
              setFilters({ ...filters, type: nextValue });
              syncUrl({ type: nextValue });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TYPE_ALL_OPTION}>All</SelectItem>
              <SelectItem value="easy">Easy Run</SelectItem>
              <SelectItem value="tempo">Tempo Run</SelectItem>
              <SelectItem value="long">Long Run</SelectItem>
              <SelectItem value="race">Race</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Min rating
          </label>
          <Select
            value={filters.minRating || undefined}
            onValueChange={(value) => {
              const nextValue = value === RATING_ANY_OPTION ? "" : value;
              setFilters({ ...filters, minRating: nextValue });
              syncUrl({ minRating: nextValue });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RATING_ANY_OPTION}>Any</SelectItem>
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num}+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Sort by
          </label>
          <Select
            value={sortBy || undefined}
            onValueChange={(value) => {
              const nextValue = value === SORT_NONE_OPTION ? "" : (value as typeof sortBy);
              setSortBy(nextValue as typeof sortBy);
              syncUrl({ sortBy: nextValue });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SORT_NONE_OPTION}>None</SelectItem>
              <SelectItem value="highest_rating">Highest Rating</SelectItem>
              <SelectItem value="lowest_rating">Lowest Rating</SelectItem>
              <SelectItem value="most_reviewed">Most Reviewed</SelectItem>
              <SelectItem value="most_recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button className="w-full" onClick={fetchShoes}>
            Apply Filters
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedShoes.map((shoe) => {
          const avgRating =
            shoe.reviews && shoe.reviews.length > 0
              ? shoe.reviews.reduce((sum, r) => sum + r.rating, 0) / shoe.reviews.length
              : 0;

          return (
            <ShoeCard
              key={shoe.id}
              id={shoe.id}
              brand={shoe.brand}
              model={shoe.model}
              type={shoe.type}
              reviews={shoe.reviews}
              avgRating={avgRating}
            />
          );
        })}
      </div>
    </div>
  );
}

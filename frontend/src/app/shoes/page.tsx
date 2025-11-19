"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
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
import Footer from "@/components/Footer";

interface Shoe {
  id: number;
  brand: string;
  model: string;
  type: string;
  imageUrl?: string | null;
  reviews?: { rating: number; createdAt?: string | null }[];
}

const TYPE_ALL_OPTION = "all";
const RATING_ANY_OPTION = "any";
const SORT_NONE_OPTION = "none";

type SortOption =
  | "highest_rating"
  | "lowest_rating"
  | "most_reviewed"
  | "most_recent"
  | "name"
  | "none";

const VALID_SORT_VALUES: SortOption[] = [
  "highest_rating",
  "lowest_rating",
  "most_reviewed",
  "most_recent",
  "name",
  SORT_NONE_OPTION,
];

export default function ShoesPage() {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [filters, setFilters] = useState({
    type: TYPE_ALL_OPTION,
    minRating: RATING_ANY_OPTION,
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(SORT_NONE_OPTION);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildQuery = (typeVal: string, minRatingVal: string) => {
    const query = new URLSearchParams();
    if (typeVal && typeVal !== TYPE_ALL_OPTION) query.append("type", typeVal);
    if (minRatingVal && minRatingVal !== RATING_ANY_OPTION) {
      query.append("minRating", minRatingVal);
    }
    return query;
  };

  const fetchShoesWithArgs = async (typeVal: string, minRatingVal: string) => {
    try {
      const query = buildQuery(typeVal, minRatingVal);
      const res = await fetch(`http://localhost:3001/shoes?${query.toString()}`);
      const data = await res.json();
      setShoes(data);
    } catch (err) {
      console.error("Failed to fetch shoes:", err);
    }
  };

  const fetchShoes = async () => {
    try {
      const query = buildQuery(filters.type, filters.minRating);

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
    sortBy?: SortOption;
  }) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    const nextType = next.type ?? filters.type;
    const nextMinRating = next.minRating ?? filters.minRating;
    const nextSearch = next.search ?? search;
    const nextSort = next.sortBy ?? sortBy;

    // set or delete
    const applyParam = (key: string, value: string, defaultValue: string) => {
      if (value && value !== defaultValue) params.set(key, value);
      else params.delete(key);
    };

    applyParam("type", nextType, TYPE_ALL_OPTION);
    applyParam("minRating", nextMinRating, RATING_ANY_OPTION);
    applyParam("q", nextSearch, "");
    applyParam("sort", nextSort, SORT_NONE_OPTION);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  // Sync state to URL on any URL change and fetch accordingly
  useEffect(() => {
    const qpTypeRaw = searchParams?.get("type");
    const qpMinRaw = searchParams?.get("minRating");
    const qpType =
      qpTypeRaw && qpTypeRaw !== "" ? qpTypeRaw : TYPE_ALL_OPTION;
    const qpMin =
      qpMinRaw && qpMinRaw !== "" ? qpMinRaw : RATING_ANY_OPTION;
    const qpQ = searchParams?.get("q") ?? "";
    const qpSortRaw = searchParams?.get("sort");
    const qpSort = VALID_SORT_VALUES.includes(qpSortRaw as SortOption)
      ? (qpSortRaw as SortOption)
      : SORT_NONE_OPTION;

    setFilters({ type: qpType, minRating: qpMin });
    setSearch(qpQ);
    setSortBy(qpSort);

    if (searchParams?.has("type") || searchParams?.has("minRating")) {
      fetchShoesWithArgs(qpType, qpMin);
    } else {
      // No backend filters present -> reset to all shoes
      fetchShoes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Initial fetch on mount
  useEffect(() => {
    if (shoes.length === 0) {
      fetchShoes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      case "name":
        filtered = filtered
          .slice()
          .sort((a, b) => {
            const aName = `${a.brand} ${a.model}`.toLowerCase();
            const bName = `${b.brand} ${b.model}`.toLowerCase();
            return aName.localeCompare(bName);
          });
        break;
      default:
        // no sorting
        break;
    }

    return filtered as Shoe[];
  })();

  // Map sort options to Figma format
  const getSortButtonValue = (): "rating" | "reviews" | "name" => {
    if (sortBy === "highest_rating" || sortBy === "lowest_rating") return "rating";
    if (sortBy === "most_reviewed") return "reviews";
    return "name"; // default or name sorting
  };

  const handleSortClick = (value: "rating" | "reviews" | "name") => {
    let newSort: SortOption;
    if (value === "rating") {
      // Toggle between highest and lowest rating
      newSort = sortBy === "highest_rating" ? "lowest_rating" : "highest_rating";
    } else if (value === "reviews") {
      newSort = "most_reviewed";
    } else {
      // For name, we'll sort alphabetically by brand + model
      newSort = "name" as SortOption;
    }
    setSortBy(newSort);
    syncUrl({ sortBy: newSort });
  };

  // Format type for display
  const formatType = (type: string): string => {
    if (type === "easy") return "DAILY TRAINER";
    if (type === "tempo") return "TEMPO";
    if (type === "race") return "RACING";
    if (type === "long") return "LONG RUN";
    return type.toUpperCase().replace(/_/g, " ");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Page Header */}
        <section className="py-16 border-b-2 border-neutral-200">
          <div className="mb-8 animate-fade-in">
            <span className="tracking-widest text-[#007bff] block mb-2 font-bold">CATALOG</span>
            <h1 
              className="text-5xl lg:text-7xl leading-[0.9] mb-4 relative" 
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
            >
              ALL RUNNING<br />
              SHOES
              <div className="absolute -bottom-2 left-0 w-24 h-1 bg-[#007bff]"></div>
            </h1>
            <p className="text-neutral-600 text-lg max-w-2xl leading-relaxed">
              Browse our comprehensive database of running shoes. Filter by category, sort by rating, and find the perfect shoe for your running style.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in animate-delay-200">
            {/* Search */}
            <div className="border-2 border-black flex items-center md:col-span-2 hover:shadow-black-crisp transition-all duration-300">
              <Search className="size-5 ml-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="SEARCH BY BRAND OR MODEL"
                value={search}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearch(v);
                  syncUrl({ search: v });
                }}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 tracking-wider placeholder:text-neutral-400 rounded-none"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={filters.type}
              onValueChange={(value) => {
                const newFilters = { ...filters, type: value };
                setFilters(newFilters);
                syncUrl({ type: value });
                if (value !== TYPE_ALL_OPTION || newFilters.minRating !== RATING_ANY_OPTION) {
                  fetchShoesWithArgs(value, newFilters.minRating);
                } else {
                  fetchShoes();
                }
              }}
            >
              <SelectTrigger className="border-2 border-black tracking-wider h-12 rounded-none hover:border-[#007bff] transition-colors">
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="CATEGORY" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TYPE_ALL_OPTION}>ALL CATEGORIES</SelectItem>
                <SelectItem value="easy">DAILY TRAINER</SelectItem>
                <SelectItem value="tempo">TEMPO</SelectItem>
                <SelectItem value="race">RACING</SelectItem>
                <SelectItem value="long">LONG RUN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-4 mt-6 animate-fade-in animate-delay-300">
            <div className="flex items-center gap-2 text-neutral-600">
              <SlidersHorizontal className="size-4" />
              <span className="tracking-wider font-bold">SORT BY:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={getSortButtonValue() === "rating" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleSortClick("rating")}
                className={
                  getSortButtonValue() === "rating"
                    ? "gradient-blue-vibrant text-white hover:opacity-90 rounded-none shadow-blue-sm"
                    : "hover:bg-[#007bff] hover:text-white border-2 border-transparent hover:border-[#007bff] rounded-none transition-all"
                }
              >
                RATING
              </Button>
              <Button
                variant={getSortButtonValue() === "reviews" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleSortClick("reviews")}
                className={
                  getSortButtonValue() === "reviews"
                    ? "gradient-blue-vibrant text-white hover:opacity-90 rounded-none shadow-blue-sm"
                    : "hover:bg-[#007bff] hover:text-white border-2 border-transparent hover:border-[#007bff] rounded-none transition-all"
                }
              >
                REVIEWS
              </Button>
              <Button
                variant={getSortButtonValue() === "name" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleSortClick("name")}
                className={
                  getSortButtonValue() === "name"
                    ? "gradient-blue-vibrant text-white hover:opacity-90 rounded-none shadow-blue-sm"
                    : "hover:bg-[#007bff] hover:text-white border-2 border-transparent hover:border-[#007bff] rounded-none transition-all"
                }
              >
                NAME
              </Button>
            </div>
          </div>
        </section>

        {/* Shoes Grid */}
        <section className="py-16">
          <div className="mb-8 animate-fade-in">
            <p className="text-neutral-600 tracking-wider font-bold">
              SHOWING <span className="text-black">{displayedShoes.length}</span> OF <span className="text-black">{shoes.length}</span> SHOES
            </p>
          </div>

          {displayedShoes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedShoes.map((shoe, index) => {
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
                    type={formatType(shoe.type)}
                    imageUrl={shoe.imageUrl}
                    reviews={shoe.reviews}
                    avgRating={avgRating}
                    position={index}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-block mb-6">
                <Search className="size-16 text-neutral-300" />
              </div>
              <h3 className="text-2xl tracking-wider mb-2 font-bold">NO SHOES FOUND</h3>
              <p className="text-neutral-600">Try adjusting your filters or search query</p>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

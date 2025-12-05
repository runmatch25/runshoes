"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ShoeCard from "@/components/ShoeCard";
import ShoeFilters from "@/components/ShoeFilters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Shoe {
  id: number;
  brand: string;
  model: string;
  type: string;
  category?: string | null;
  imageUrl?: string | null;
  reviews?: { 
    rating: number; 
    createdAt?: string | null;
    stability?: 'NEUTRAL' | 'MODERATE_SUPPORT' | 'HIGH_SUPPORT' | null;
    cushion?: 'SOFT' | 'BALANCED' | 'FIRM' | null;
    categories?: string[] | null;
  }[];
}

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

const STABILITY_TYPES = ['NEUTRAL', 'MODERATE_SUPPORT', 'HIGH_SUPPORT'] as const;
const CUSHION_TYPES = ['SOFT', 'BALANCED', 'FIRM'] as const;

export default function ShoesPage() {
  const [allShoes, setAllShoes] = useState<Shoe[]>([]);
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [filters, setFilters] = useState({
    category: [] as string[],
    brand: [] as string[],
    stability: [] as string[],
    cushion: [] as string[],
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("highest_rating");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollPositionRef = useRef<number>(0);
  const shouldPreserveScrollRef = useRef<boolean>(false);

  // Extract available options from all shoes
  const availableOptions = useMemo(() => {
    const categories = new Set<string>();
    const brands = new Set<string>();

    allShoes.forEach((shoe) => {
      brands.add(shoe.brand);
      // Extract categories from reviews
      if (shoe.reviews) {
        shoe.reviews.forEach((review) => {
          if (review.categories && review.categories.length > 0) {
            review.categories.forEach((cat) => {
              if (cat) categories.add(cat);
            });
          }
        });
      }
    });

    // Standardize category names - always show the standard categories
    const standardCategories = ['Daily trainer', 'Tempo', 'Racing', 'Long run', 'Trail'];

    return {
      categories: standardCategories,
      brands: Array.from(brands).sort(),
      stabilityTypes: [...STABILITY_TYPES],
      cushionTypes: [...CUSHION_TYPES],
    };
  }, [allShoes]);

  const buildQuery = () => {
    const query = new URLSearchParams();
    
    // Add filters to query (only if arrays have values)
    if (filters.category.length > 0) {
      filters.category.forEach((cat) => query.append("category", cat));
    }
    if (filters.brand.length > 0) {
      filters.brand.forEach((brand) => query.append("brand", brand));
    }
    if (filters.stability.length > 0) {
      filters.stability.forEach((stab) => query.append("stability", stab));
    }
    if (filters.cushion.length > 0) {
      filters.cushion.forEach((cush) => query.append("cushion", cush));
    }

    return query;
  };

  const fetchAllShoes = async () => {
    try {
      const res = await fetch(`http://localhost:3001/shoes`);
      const data = await res.json();
      setAllShoes(data);
    } catch (err) {
      console.error("Failed to fetch all shoes:", err);
    }
  };

  const fetchFilteredShoes = async () => {
    try {
      const query = buildQuery();
      const queryString = query.toString();
      const url = queryString 
        ? `http://localhost:3001/shoes?${queryString}`
        : `http://localhost:3001/shoes`;
      
      const res = await fetch(url);
      const data = await res.json();
      setShoes(data);
      return Promise.resolve();
    } catch (err) {
      console.error("Failed to fetch filtered shoes:", err);
      return Promise.resolve();
    }
  };

  const syncUrl = (updates: {
    filters?: typeof filters;
    search?: string;
    sortBy?: SortOption;
  }) => {
    
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    
    // Update filters
    if (updates.filters !== undefined) {
      // Remove old filter params
      params.delete("category");
      params.delete("brand");
      params.delete("stability");
      params.delete("cushion");
      
      // Add new filter params
      updates.filters.category.forEach((cat) => params.append("category", cat));
      updates.filters.brand.forEach((brand) => params.append("brand", brand));
      updates.filters.stability.forEach((stab) => params.append("stability", stab));
      updates.filters.cushion.forEach((cush) => params.append("cushion", cush));
    }
    
    // Update search
    if (updates.search !== undefined) {
      const nextSearch = updates.search;
      if (nextSearch) {
        params.set("q", nextSearch);
      } else {
        params.delete("q");
      }
    }
    
    // Update sort
    if (updates.sortBy !== undefined) {
      const nextSort = updates.sortBy;
      if (nextSort && nextSort !== "highest_rating") {
        params.set("sort", nextSort);
      } else {
        params.delete("sort");
      }
    }

    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    
    // Use window.history.replaceState to update URL without triggering scroll
    // This prevents Next.js from scrolling to top
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        { ...window.history.state, as: newUrl, url: newUrl },
        '',
        newUrl
      );
    }
    
    // Restore scroll position immediately and after a frame
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositionRef.current);
      // Also restore after a short delay to catch any late scrolls
      setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current);
      }, 0);
    });
  };

  // Sync state to URL on mount and URL changes
  useEffect(() => {
    const qpCategories = searchParams?.getAll("category") || [];
    const qpBrands = searchParams?.getAll("brand") || [];
    const qpStability = searchParams?.getAll("stability") || [];
    const qpCushion = searchParams?.getAll("cushion") || [];
    const qpQ = searchParams?.get("q") ?? "";
    const qpSortRaw = searchParams?.get("sort");
    const qpSort = VALID_SORT_VALUES.includes(qpSortRaw as SortOption)
      ? (qpSortRaw as SortOption)
      : "highest_rating";

    setFilters({
      category: qpCategories,
      brand: qpBrands,
      stability: qpStability,
      cushion: qpCushion,
    });
    setSearch(qpQ);
    setSortBy(qpSort);
  }, [searchParams]);

  // Fetch all shoes on mount to get available options
  useEffect(() => {
    fetchAllShoes();
  }, []);

  // Fetch filtered shoes when filters change
  useEffect(() => {
    // Save scroll position before fetching if we should preserve it
    if (shouldPreserveScrollRef.current) {
      scrollPositionRef.current = window.scrollY;
    }
    fetchFilteredShoes();
  }, [filters]);

  // Preserve scroll position after shoes update (only if we should)
  useEffect(() => {
    if (shouldPreserveScrollRef.current && scrollPositionRef.current > 0) {
      // Use requestAnimationFrame to restore scroll after DOM updates
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
        // Reset the flag after restoring
        shouldPreserveScrollRef.current = false;
      });
    }
  }, [shoes]);

  // derive displayed shoes based on search and sort
  const displayedShoes = useMemo(() => {
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
            const aName = a.model.toLowerCase();
            const bName = b.model.toLowerCase();
            return aName.localeCompare(bName);
          });
        break;
      default:
        break;
    }

    return filtered as Shoe[];
  }, [shoes, search, sortBy]);

  // Map sort options to Figma format
  const getSortButtonValue = (): "rating" | "reviews" | "name" => {
    if (sortBy === "highest_rating" || sortBy === "lowest_rating") return "rating";
    if (sortBy === "most_reviewed") return "reviews";
    return "name";
  };

  const handleSortClick = (value: "rating" | "reviews" | "name") => {
    let newSort: SortOption;
    if (value === "rating") {
      newSort = sortBy === "highest_rating" ? "lowest_rating" : "highest_rating";
    } else if (value === "reviews") {
      newSort = "most_reviewed";
    } else {
      newSort = "name" as SortOption;
    }
    setSortBy(newSort);
    syncUrl({ sortBy: newSort });
  };

  const handleFilterChange = (
    filterType: 'category' | 'brand' | 'stability' | 'cushion',
    value: string
  ) => {
    // Save scroll position before filter change
    scrollPositionRef.current = window.scrollY;
    shouldPreserveScrollRef.current = true;
    
    const newFilters = { ...filters };
    const currentValues = newFilters[filterType];
    
    if (currentValues.includes(value)) {
      newFilters[filterType] = currentValues.filter((v) => v !== value);
    } else {
      newFilters[filterType] = [...currentValues, value];
    }
    
    setFilters(newFilters);
    syncUrl({ filters: newFilters });
  };

  const handleClearFilters = () => {
    // Save scroll position before clearing filters
    scrollPositionRef.current = window.scrollY;
    shouldPreserveScrollRef.current = true;
    
    const emptyFilters = {
      category: [] as string[],
      brand: [] as string[],
      stability: [] as string[],
      cushion: [] as string[],
    };
    setFilters(emptyFilters);
    syncUrl({ filters: emptyFilters });
  };

  // Format type for display
  const formatType = (type: string): string => {
    if (type === "easy") return "DAILY TRAINER";
    if (type === "tempo") return "TEMPO";
    if (type === "race") return "RACING";
    if (type === "long") return "LONG RUN";
    return type.toUpperCase().replace(/_/g, " ");
  };

  const activeFilterCount = 
    filters.category.length +
    filters.brand.length +
    filters.stability.length +
    filters.cushion.length;

  const STABILITY_LABELS: Record<string, string> = {
    NEUTRAL: 'NEUTRAL',
    MODERATE_SUPPORT: 'MODERATE SUPPORT',
    HIGH_SUPPORT: 'HIGH SUPPORT',
  };

  const CUSHION_LABELS: Record<string, string> = {
    SOFT: 'SOFT',
    BALANCED: 'BALANCED',
    FIRM: 'FIRM',
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Page Header */}
        <section className="py-12 border-b border-neutral-200">
          <span className="tracking-widest text-[#007bff] block mb-2">CATALOG</span>
          <h1 
            className="text-5xl lg:text-7xl leading-[0.9] mb-4" 
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
          >
            ALL RUNNING<br />
            SHOES
          </h1>
          <p className="text-neutral-600 max-w-2xl leading-relaxed mb-6">
            Browse our comprehensive database of running shoes. Filter by category, brand, stability, and cushion to find your perfect match.
          </p>

          {/* Search */}
          <div className="max-w-2xl">
            <div className="border-2 border-black flex items-center hover:shadow-black-crisp transition-all duration-300">
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
          </div>
        </section>

        {/* Main Content */}
        <div className="flex gap-8 py-12">
          {/* Left Sidebar - Filters */}
          <aside className="hidden lg:block">
            <ShoeFilters
              filters={filters}
              availableOptions={availableOptions}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Right Content - Results */}
          <main className="flex-1 min-w-0">
            {/* Sort & Results Count */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <p className="text-neutral-600 tracking-wider">
                SHOWING <span className="text-black">{displayedShoes.length}</span> OF <span className="text-black">{shoes.length}</span> SHOES
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-neutral-600">
                  <SlidersHorizontal className="size-4" />
                  <span className="tracking-wider text-xs">SORT BY:</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={getSortButtonValue() === "rating" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSortClick("rating")}
                    className={
                      getSortButtonValue() === "rating"
                        ? "bg-[#007bff] text-white hover:bg-[#0056b3]"
                        : "hover:bg-neutral-100"
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
                        ? "bg-[#007bff] text-white hover:bg-[#0056b3]"
                        : "hover:bg-neutral-100"
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
                        ? "bg-[#007bff] text-white hover:bg-[#0056b3]"
                        : "hover:bg-neutral-100"
                    }
                  >
                    NAME
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {filters.category.map((category) => (
                  <div
                    key={`cat-${category}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#007bff] text-white text-xs tracking-wider"
                  >
                    <span>{(category || 'UNCATEGORIZED').toUpperCase()}</span>
                    <button
                      onClick={() => handleFilterChange('category', category)}
                      className="hover:bg-white/20 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {filters.brand.map((brand) => (
                  <div
                    key={`brand-${brand}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#007bff] text-white text-xs tracking-wider"
                  >
                    <span>{brand}</span>
                    <button
                      onClick={() => handleFilterChange('brand', brand)}
                      className="hover:bg-white/20 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {filters.stability.map((stability) => (
                  <div
                    key={`stab-${stability}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#007bff] text-white text-xs tracking-wider"
                  >
                    <span>{STABILITY_LABELS[stability] || stability}</span>
                    <button
                      onClick={() => handleFilterChange('stability', stability)}
                      className="hover:bg-white/20 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {filters.cushion.map((cushion) => (
                  <div
                    key={`cush-${cushion}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#007bff] text-white text-xs tracking-wider"
                  >
                    <span>{CUSHION_LABELS[cushion] || cushion}</span>
                    <button
                      onClick={() => handleFilterChange('cushion', cushion)}
                      className="hover:bg-white/20 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Shoes Grid */}
            {displayedShoes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="text-center py-20 border-2 border-dashed border-neutral-200">
                <div className="inline-block mb-6 p-6 border-2 border-neutral-200">
                  <Search className="size-16 text-neutral-300" />
                </div>
                <h3 
                  className="text-3xl tracking-wider mb-4"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  NO SHOES FOUND
                </h3>
                <p className="text-neutral-600 mb-6">Try adjusting your filters or search query</p>
                {activeFilterCount > 0 && (
                  <Button
                    onClick={handleClearFilters}
                    className="bg-[#007bff] text-white hover:bg-[#0056b3] tracking-wider"
                  >
                    CLEAR ALL FILTERS
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

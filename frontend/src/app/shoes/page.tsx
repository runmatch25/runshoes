"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Shoe {
  id: number;
  brand: string;
  model: string;
  type: string;
  reviews?: { rating: number }[];
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
                .map((r: any) => (r.createdAt ? new Date(r.createdAt).getTime() : NaN))
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
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 700,
          background: "linear-gradient(90deg, #00c9ff, #92fe9d)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Running Shoes
      </Typography>

      {/* Filter/Search/Sort Bar */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Search shoes"
            placeholder="Search by brand or model"
            fullWidth
            value={search}
            onChange={(e) => {
              const v = e.target.value;
              setSearch(v);
              syncUrl({ search: v });
            }}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            select
            label="Run Type"
            fullWidth
            value={filters.type}
            onChange={(e) => {
              const v = e.target.value;
              setFilters({ ...filters, type: v });
              syncUrl({ type: v });
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="easy">Easy Run</MenuItem>
            <MenuItem value="tempo">Tempo Run</MenuItem>
            <MenuItem value="long">Long Run</MenuItem>
            <MenuItem value="race">Race</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={2}>
          {/* Rating Filter */}
          <TextField
            select
            label="Min Rating"
            fullWidth
            value={filters.minRating}
            onChange={(e) => {
              const v = e.target.value;
              setFilters({ ...filters, minRating: v });
              syncUrl({ minRating: v });
            }}
          >
            <MenuItem value="">Any</MenuItem>
            {[0, 1, 2, 3, 4, 5].map((num) => (
              <MenuItem key={num} value={num}>
                {num}+
              </MenuItem>
            ))}
          </TextField>

        </Grid>

        <Grid item xs={12} sm={2}>
          <TextField
            select
            label="Sort By"
            fullWidth
            value={sortBy}
            onChange={(e) => {
              const v = e.target.value as any;
              setSortBy(v);
              syncUrl({ sortBy: v });
            }}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="highest_rating">Highest Rating</MenuItem>
            <MenuItem value="lowest_rating">Lowest Rating</MenuItem>
            <MenuItem value="most_reviewed">Most Reviewed</MenuItem>
            <MenuItem value="most_recent">Most Recent</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            sx={{
              height: "100%",
              fontWeight: 700,
              background: "linear-gradient(90deg, #00c9ff, #92fe9d)",
            }}
            onClick={fetchShoes}
          >
            Apply Filters
          </Button>
        </Grid>
      </Grid>

      {/* Shoe Grid */}
      <Box
        sx={{
          display: "grid",
          gap: 4,
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}
      >
        {displayedShoes.map((shoe) => {
          const avgRating =
            shoe.reviews && shoe.reviews.length > 0
              ? (
                  shoe.reviews.reduce((sum, r) => sum + r.rating, 0) /
                  shoe.reviews.length
                ).toFixed(1)
              : "No reviews yet";

          return (
            <Card
              key={shoe.id}
              sx={{
                backdropFilter: "blur(12px)",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 30px rgba(0, 201, 255, 0.4)",
                },
              }}
            >
              <CardActionArea onClick={() => router.push(`/shoes/${shoe.id}`)}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {shoe.brand} {shoe.model}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Type: {shoe.type}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                    ⭐ Avg Rating: {avgRating}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}

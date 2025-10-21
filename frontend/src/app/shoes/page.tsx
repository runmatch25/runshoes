"use client";

import { useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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

  useEffect(() => {
    fetchShoes();
  }, []);

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

      {/* Filter Bar */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            label="Run Type"
            fullWidth
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="easy">Easy Run</MenuItem>
            <MenuItem value="tempo">Tempo Run</MenuItem>
            <MenuItem value="long">Long Run</MenuItem>
            <MenuItem value="race">Race</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={4}>
          {/* Rating Filter */}
          <TextField
            select
            label="Min Rating"
            fullWidth
            value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
          >
            <MenuItem value="">Any</MenuItem>
            {[0, 1, 2, 3, 4, 5].map((num) => (
              <MenuItem key={num} value={num}>
                {num}+
              </MenuItem>
            ))}
          </TextField>

        </Grid>

        <Grid item xs={12} sm={4}>
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
        {shoes.map((shoe) => {
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

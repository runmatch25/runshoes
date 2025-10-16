"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, CardActionArea } from "@mui/material";
import { useRouter } from "next/navigation";

interface Shoe {
  id: number;
  brand: string;
  model: string;
  type: string;
}

export default function ShoesPage() {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:3001/shoes")
      .then((res) => res.json())
      .then((data) => setShoes(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", mt: 4 }}>
      {shoes.map((shoe) => (
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
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}

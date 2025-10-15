"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function NewShoePage() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:3001/shoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, model, type }),
    });
    router.push("/shoes");
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add a New Shoe
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Brand"
          fullWidth
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Model"
          fullWidth
          value={model}
          onChange={(e) => setModel(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Type (easy, tempo, long, etc.)"
          fullWidth
          value={type}
          onChange={(e) => setType(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" fullWidth>
          Add Shoe
        </Button>
      </form>
    </Box>
  );
}

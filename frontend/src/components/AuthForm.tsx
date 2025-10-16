"use client";

import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  type: "login" | "signup";
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const endpoint =
      type === "signup"
        ? "http://localhost:3001/auth/register"
        : "http://localhost:3001/auth/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          type === "signup"
            ? { name, email, password }
            : { email, password }
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      // Save token to localStorage
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("authChange"));
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server");
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 400, mx: "auto", mt: 8, display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="h5" textAlign="center">
        {type === "signup" ? "Create an Account" : "Log In"}
      </Typography>

      {type === "signup" && (
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      )}
      <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

      {error && <Typography color="error">{error}</Typography>}

      <Button type="submit" variant="contained" color="primary">
        {type === "signup" ? "Sign Up" : "Log In"}
      </Button>
    </Box>
  );
}
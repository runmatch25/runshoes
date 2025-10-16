"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthForm({ type }: { type: "login" | "signup" }) {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const endpoint = type === "login" ? "login" : "signup";
    const res = await fetch(`http://localhost:3001/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      login(data.token, data.user);
      router.push("/");
    } else {
      alert(data.message || "Authentication failed");
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          color: "#fff",
          boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{ mb: 1, fontWeight: 700, letterSpacing: 1 }}
        >
          RunRate
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          sx={{ mb: 3, opacity: 0.9 }}
        >
          {type === "login"
            ? "Welcome back, runner!"
            : "Join the community of runners"}
        </Typography>

        <form onSubmit={handleSubmit}>
          {type === "signup" && (
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              InputLabelProps={{ style: { color: "#fff" } }}
              InputProps={{
                style: { color: "#fff" },
              }}
            />
          )}

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputLabelProps={{ style: { color: "#fff" } }}
            InputProps={{
              style: { color: "#fff" },
            }}
          />

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputLabelProps={{ style: { color: "#fff" } }}
            InputProps={{
              style: { color: "#fff" },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.2,
              fontWeight: 600,
              fontSize: "1rem",
              background:
                "linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)",
              color: "#000",
              "&:hover": {
                background:
                  "linear-gradient(90deg, #92FE9D 0%, #00C9FF 100%)",
                boxShadow: "0 4px 20px rgba(0, 201, 255, 0.4)",
              },
            }}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : type === "login"
              ? "Login"
              : "Sign Up"}
          </Button>
        </form>

        <Divider sx={{ my: 3, background: "rgba(255,255,255,0.2)" }} />

        <Typography align="center" sx={{ opacity: 0.8 }}>
          {type === "login" ? (
            <>
              New here?{" "}
              <span
                style={{
                  color: "#00C9FF",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => router.push("/signup")}
              >
                Create an account
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                style={{
                  color: "#00C9FF",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => router.push("/login")}
              >
                Log in
              </span>
            </>
          )}
        </Typography>
      </Paper>
    </Box>
  );
}

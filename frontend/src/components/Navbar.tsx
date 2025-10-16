"use client";

import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: "blur(12px)",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            letterSpacing: 1,
            background: "linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          RunRate
        </Typography>

        <Box>
          <Button component={Link} href="/" sx={{ mx: 1 }}>
            Home
          </Button>
          <Button component={Link} href="/shoes" sx={{ mx: 1 }}>
            Shoes
          </Button>
          <Button component={Link} href="/reviews" sx={{ mx: 1 }}>
            Reviews
          </Button>

          {user ? (
            <Button
              onClick={logout}
              sx={{
                mx: 1,
                color: "#ff7b7b",
                border: "1px solid #ff7b7b",
                "&:hover": {
                  backgroundColor: "rgba(255,123,123,0.1)",
                },
              }}
            >
              Logout
            </Button>
          ) : (
            <Button
              component={Link}
              href="/login"
              sx={{
                mx: 1,
                border: "1px solid rgba(255,255,255,0.3)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

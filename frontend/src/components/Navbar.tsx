"use client";

import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@mui/material/styles";

export default function Navbar() {
  const { user, logout } = useAuth();
  const theme = useTheme();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        // Gradient reversed so blue appears on the right
        background: "linear-gradient(135deg, #FF6A00 0%, #0059B2 100%)",
        color: "#fff",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        height: 60,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        {/* Left: Logo / Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
            <Image src="/images/logo.png" alt="RunRate" width={100} height={100} priority />
          </Link>
        </Box>

        {/* Middle: Primary nav links */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, alignItems: "center" }}>
          <Button component={Link} href="/" color="inherit">
            Home
          </Button>
          <Button component={Link} href="/shoes" color="inherit">
            Shoes
          </Button>
          <Button component={Link} href="/reviews" color="inherit">
            Reviews
          </Button>
        </Box>

        {/* Right: CTA / Auth */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {user ? (
            <>
              <Button component={Link} href="/profile" color="inherit" sx={{ color: 'secondary.main' }}>
                Profile
              </Button>
              <Button onClick={logout} variant="outlined" sx={{ borderColor: "rgba(0,0,0,0.08)", color: 'secondary.main' }}>
                Logout
              </Button>
            </>
          ) : (
            <Button component={Link} href="/login" variant="contained" color="primary">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

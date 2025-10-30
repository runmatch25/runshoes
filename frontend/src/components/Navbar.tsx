"use client";

import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@mui/material/styles";
import React, { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const [show, setShow] = useState(true);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const goingDown = current > lastScroll.current;
      if (current < 10) {
        setShow(true); // Always show at the very top
      } else if (goingDown && current > 40) {
        setShow(false);
      } else if (!goingDown) {
        setShow(true);
      }
      lastScroll.current = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "transparent",
        color: "#000",
        borderBottom: "none",
        height: 60,
        boxShadow: "none",
        zIndex: (theme) => theme.zIndex.drawer + 10,
        transition: "transform 0.4s cubic-bezier(.4,1.3,.4,1)",
        transform: show ? "translateY(0)" : "translateY(-110%)",
      }}
    >
      <Toolbar sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 60,
        minHeight: 60,
        position: "relative",
        paddingX: 4,
      }}>
        {/* Far left: Logo */}
        <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", alignItems: "center", height: 60 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
            <Image src="/images/logo.png" alt="RunRate" width={93} height={48} priority />
          </Link>
        </Box>
        {/* Center nav: Shoes, Reviews */}
        <Box sx={{ position: "absolute", left: '50%', top: 0, bottom: 0, display: "flex", alignItems: "center", gap: 3, height: 60, transform: 'translateX(-50%)' }}>
          <Link href="/shoes" style={{ color: "#000", textDecoration: "none" }}>
            <Box sx={{ fontWeight: 600, fontSize: 15, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase", '&:hover': { textDecoration: 'underline' }, color: "#000" }}>
              Shoes
            </Box>
          </Link>
          <Link href="/reviews" style={{ color: "#000", textDecoration: "none" }}>
            <Box sx={{ fontWeight: 600, fontSize: 15, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase", '&:hover': { textDecoration: 'underline' }, color: "#000" }}>
              Reviews
            </Box>
          </Link>
        </Box>
        {/* Right nav: Profile/Logout or Login */}
        <Box sx={{ position: "absolute", right: 0, top: 0, bottom: 0, display: "flex", alignItems: "center", gap: 3, height: 60 }}>
          {user ? (
            <>
              <Link href="/profile" style={{ color: "#000", textDecoration: "none" }}>
                <Box sx={{ fontWeight: 600, fontSize: 15, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase", '&:hover': { textDecoration: 'underline' }, color: "#000" }}>
                  Profile
                </Box>
              </Link>
              <Box onClick={logout} sx={{ fontWeight: 600, fontSize: 15, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase", color: "#000", ml: 2, '&:hover': { textDecoration: 'underline' } }}>
                Logout
              </Box>
            </>
          ) : (
            <Link href="/login" style={{ color: "#000", textDecoration: "none" }}>
              <Box sx={{ fontWeight: 600, fontSize: 15, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase", '&:hover': { textDecoration: 'underline' }, color: "#000" }}>
                Login
              </Box>
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

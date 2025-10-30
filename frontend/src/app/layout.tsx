"use client";

import React from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import theme from "@/theme/igniteTheme";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { Press_Start_2P, VT323 } from "next/font/google";

const pressStart = Press_Start_2P({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-press-start" });
const vt323 = VT323({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-vt323" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${pressStart.variable} ${vt323.variable}`}>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Box
              sx={{
                minHeight: "100vh",
                background: theme.palette.background.default || "#0b0c10",
                color: theme.palette.text.primary,
                paddingBottom: 8,
              }}
            >
              <Navbar />
              {children}
            </Box>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

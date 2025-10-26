"use client";

import React from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import theme from "@/theme/igniteTheme";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Box
              sx={{
                minHeight: "100vh",
                background: theme.palette.background.default || "#FFFFFF",
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

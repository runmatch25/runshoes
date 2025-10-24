"use client";

import React from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import theme from "@/theme/theme";
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
                background:
                  "linear-gradient(135deg, #071026 0%, #0b1020 40%, rgba(124,77,255,0.06) 100%)",
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

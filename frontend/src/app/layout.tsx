"use client";

import { ReactNode } from "react";
import Navbar from "../components/Navbar";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const theme = createTheme();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Inter, sans-serif" }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

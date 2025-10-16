"use client";

import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import theme from "@/theme/theme";
import Navbar from "@/components/Navbar";

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
          <Box
            sx={{
              minHeight: "100vh",
              background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
              color: "#fff",
            }}
          >
            <Navbar />
            <Box sx={{ p: 4 }}>{children}</Box>
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}

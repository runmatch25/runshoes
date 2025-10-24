"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0b1020",
      paper: "rgba(255,255,255,0.04)",
    },
    primary: {
      main: "#7C4DFF", // electric purple
      contrastText: "#fff",
    },
    secondary: {
      main: "#FF6BC7", // hot pink
      contrastText: "#0b1020",
    },
    info: {
      main: "#00E5FF",
    },
    success: {
      main: "#00E676",
    },
    text: {
      primary: "#E6EEF8",
      secondary: "rgba(230,238,248,0.7)",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    h4: {
      fontWeight: 700,
      letterSpacing: 0.6,
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(124,77,255,0.06)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 18px",
          backgroundColor: "#7C4DFF",
          color: "#fff",
          boxShadow: "0 6px 14px rgba(124,77,255,0.06)",
          transition: "transform 150ms ease, box-shadow 150ms ease, background-color 120ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            backgroundColor: "#6930d8",
            boxShadow: "0 10px 30px rgba(105,48,216,0.12)",
          },
        },
        containedSecondary: {
          backgroundColor: "#FF6BC7",
          color: "#0b1020",
          "&:hover": {
            backgroundColor: "#ff4aa8",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(16,18,28,0.6)",
          border: "1px solid rgba(255,255,255,0.04)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(16,18,28,0.6)",
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "0 6px 18px rgba(2,6,23,0.5)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: "rgba(124,77,255,0.12)",
          color: "#fff",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: "rgba(0,0,0,0.85)",
          color: "#fff",
        },
      },
    },
  },
});

export default theme;

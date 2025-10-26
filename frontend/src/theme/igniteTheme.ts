"use client";

import { createTheme } from "@mui/material/styles";

// RunMatch Ignite palette
const PALETTE = {
  primary: "#0059B2", // deep energetic blue (logo)
  accent: "#FF6A00", // warm flame orange (highlights)
  cta: "#FF3D00", // ember red (CTAs)
  glow: "#FFD580", // soft golden glow
  background: "#FFFFFF", // clean white
  surface: "#F9FAFB", // very light gray surfaces
  textPrimary: "#1C1C1C", // dark neutral text
  textMuted: "#5C5C5C", // muted gray text
  gradient: "linear-gradient(135deg, #0059B2 0%, #FF6A00 100%)",
};

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: PALETTE.background,
      paper: PALETTE.surface,
    },
    primary: {
      main: PALETTE.primary,
      contrastText: "#fff",
    },
    secondary: {
      main: PALETTE.accent,
      contrastText: "#000",
    },
    info: {
      main: PALETTE.primary,
    },
    success: {
      main: "#16A34A",
    },
    text: {
      primary: PALETTE.textPrimary,
      secondary: PALETTE.textMuted,
    },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    h4: {
      fontWeight: 700,
      letterSpacing: 0.2,
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
    body1: {
      color: PALETTE.textPrimary,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: PALETTE.background,
          color: PALETTE.textPrimary,
          boxShadow: "none",
          borderBottom: "1px solid rgba(28,28,28,0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 16px",
          fontWeight: 700,
        },
        containedPrimary: {
          backgroundColor: PALETTE.cta,
          color: "#fff",
          boxShadow: `0 6px 18px ${PALETTE.glow}33`,
          "&:hover": {
            backgroundColor: "#e03300",
            boxShadow: `0 10px 30px ${PALETTE.glow}22`,
          },
        },
        containedSecondary: {
          backgroundColor: PALETTE.accent,
          color: "#fff",
          "&:hover": {
            backgroundColor: "#ff5a00",
          },
        },
        text: {
          color: PALETTE.primary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: PALETTE.surface,
          boxShadow: "0 4px 12px rgba(16,24,40,0.06)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(16,24,40,0.04)",
          boxShadow: "0 6px 20px rgba(16,24,40,0.06)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: PALETTE.surface,
          color: PALETTE.textPrimary,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: "#111827",
          color: "#fff",
        },
      },
    },
  },
});

export default theme;

"use client";

import { createTheme } from "@mui/material/styles";

const PALETTE = {
  background: "#0b0c10", // dark
  surface: "#111318",
  textPrimary: "#9aff6b", // neon green
  textMuted: "#7bd95b",
  primary: "#00e676", // accent green
  border: "#1f222a",
};

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: PALETTE.background,
      paper: PALETTE.surface,
    },
    primary: {
      main: PALETTE.primary,
      contrastText: "#0b0c10",
    },
    text: {
      primary: PALETTE.textPrimary,
      secondary: PALETTE.textMuted,
    },
  },
  typography: {
    fontFamily: "var(--font-vt323), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    h1: { fontFamily: "var(--font-press-start)", fontWeight: 400, letterSpacing: 1.5, fontSize: 28 },
    h2: { fontFamily: "var(--font-press-start)", fontWeight: 400, letterSpacing: 1.2, fontSize: 22 },
    h3: { fontFamily: "var(--font-press-start)", fontWeight: 400, letterSpacing: 1, fontSize: 18 },
    button: { textTransform: "uppercase", letterSpacing: 1 },
  },
  shape: { borderRadius: 0 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          color: PALETTE.textPrimary,
          boxShadow: "none",
          borderBottom: "none",
          border: "none !important",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: PALETTE.surface,
          border: `2px solid ${PALETTE.border}`,
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `2px solid ${PALETTE.border}`,
          backgroundColor: "#0f1117",
          color: PALETTE.textPrimary,
          boxShadow: "none",
          '&:hover': { backgroundColor: "#141722", borderColor: PALETTE.primary },
        },
        containedPrimary: {
          backgroundColor: "#141722",
          color: PALETTE.textPrimary,
        },
        outlined: {
          borderColor: PALETTE.border,
          color: PALETTE.textPrimary,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          '& fieldset': { borderColor: PALETTE.border, borderWidth: 2 },
          '&:hover fieldset': { borderColor: PALETTE.primary },
        },
        input: { color: PALETTE.textPrimary },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: PALETTE.border } },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 0, border: `2px solid ${PALETTE.border}` } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 0 } },
    },
  },
});

export default theme;

"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0F2027", // Deep gradient base
      paper: "rgba(255,255,255,0.08)",
    },
    primary: {
      main: "#00C9FF", // Neon blue
    },
    secondary: {
      main: "#92FE9D", // Aqua green
    },
    text: {
      primary: "#FFFFFF",
      secondary: "rgba(255,255,255,0.7)",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h4: {
      fontWeight: 700,
      letterSpacing: 1.2,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          background:
            "linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)",
          color: "#000",
          fontWeight: 600,
          "&:hover": {
            background:
              "linear-gradient(90deg, #92FE9D 0%, #00C9FF 100%)",
            boxShadow: "0 4px 15px rgba(0, 201, 255, 0.4)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      },
    },
  },
});

export default theme;

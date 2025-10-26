"use client";"use client";



import { createTheme } from "@mui/material/styles";import { createTheme } from "@mui/material/styles";



// RunMatch Ignite palette// RunMatch Ignite palette

const PALETTE = {const PALETTE = {

  primary: "#0059B2", // deep energetic blue (logo)  primary: "#0059B2", // deep energetic blue (logo)

  accent: "#FF6A00", // warm flame orange (highlights)  accent: "#FF6A00", // warm flame orange (highlights)

  cta: "#FF3D00", // ember red (CTAs)  cta: "#FF3D00", // ember red (CTAs)

  glow: "#FFD580", // soft golden glow  glow: "#FFD580", // soft golden glow

  background: "#FFFFFF", // clean white  background: "#FFFFFF", // clean white

  surface: "#F9FAFB", // very light gray surfaces  surface: "#F9FAFB", // very light gray surfaces

  textPrimary: "#1C1C1C", // dark neutral text  textPrimary: "#1C1C1C", // dark neutral text

  textMuted: "#5C5C5C", // muted gray text  textMuted: "#5C5C5C", // muted gray text

  gradient: "linear-gradient(135deg, #0059B2 0%, #FF6A00 100%)",  gradient: "linear-gradient(135deg, #0059B2 0%, #FF6A00 100%)",

};};



const theme = createTheme({const theme = createTheme({

  palette: {  palette: {

    mode: "light",    mode: "light",

    background: {    background: {

      default: PALETTE.background,      default: PALETTE.background,

      paper: PALETTE.surface,      paper: PALETTE.surface,

    },    },

    primary: {    primary: {

      main: PALETTE.primary,      main: PALETTE.primary,

      contrastText: "#fff",      contrastText: "#fff",

    },    },

    secondary: {    secondary: {

      main: PALETTE.accent,      main: PALETTE.accent,

      contrastText: "#000",      contrastText: "#000",

    },    },

    info: {    info: {

      main: PALETTE.primary,      main: PALETTE.primary,

    },    },

    success: {    success: {

      main: "#16A34A",      main: "#16A34A",

    },    },

    text: {    text: {

      primary: PALETTE.textPrimary,      primary: PALETTE.textPrimary,

      secondary: PALETTE.textMuted,      secondary: PALETTE.textMuted,

    },    },

  },  },

  typography: {  typography: {

    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",

    h4: {    h4: {

      fontWeight: 700,      fontWeight: 700,

      letterSpacing: 0.2,      letterSpacing: 0.2,

    },    },

    button: {    button: {

      textTransform: "none",      textTransform: "none",

      fontWeight: 700,      fontWeight: 700,

    },    },

    body1: {    body1: {

      color: PALETTE.textPrimary,      color: PALETTE.textPrimary,

    },    },

  },  },

  shape: {  shape: {

    borderRadius: 10,    borderRadius: 10,

  },  },

  components: {  components: {

    MuiAppBar: {    MuiAppBar: {

      styleOverrides: {      styleOverrides: {

        root: {        root: {

          backgroundColor: PALETTE.background,          backgroundColor: PALETTE.background,

          color: PALETTE.textPrimary,          color: PALETTE.textPrimary,

          boxShadow: "none",          boxShadow: "none",

          borderBottom: "1px solid rgba(28,28,28,0.06)",          borderBottom: "1px solid rgba(28,28,28,0.06)",

        },        },

      },      },

    },    },

    MuiButton: {    MuiButton: {

      styleOverrides: {      styleOverrides: {

        root: {        root: {

          borderRadius: 8,          borderRadius: 8,

          padding: "10px 16px",          padding: "10px 16px",

          fontWeight: 700,          fontWeight: 700,

        },        },

        containedPrimary: {        containedPrimary: {

          backgroundColor: PALETTE.cta,          backgroundColor: PALETTE.cta,

          color: "#fff",          color: "#fff",

          boxShadow: `0 6px 18px ${PALETTE.glow}33`,          boxShadow: `0 6px 18px ${PALETTE.glow}33`,

          "&:hover": {          "&:hover": {

            backgroundColor: "#e03300",            backgroundColor: "#e03300",

            boxShadow: `0 10px 30px ${PALETTE.glow}22`,            boxShadow: `0 10px 30px ${PALETTE.glow}22`,

          },          },

        },        },

        containedSecondary: {        containedSecondary: {

          backgroundColor: PALETTE.accent,          backgroundColor: PALETTE.accent,

          color: "#fff",          color: "#fff",

          "&:hover": {          "&:hover": {

            backgroundColor: "#ff5a00",            backgroundColor: "#ff5a00",

          },          },

        },        },

        text: {        text: {

          color: PALETTE.primary,          color: PALETTE.primary,

        },        },

      },      },

    },    },

    MuiPaper: {    MuiPaper: {

      styleOverrides: {      styleOverrides: {

        root: {        root: {

          backgroundColor: PALETTE.surface,          backgroundColor: PALETTE.surface,

          boxShadow: "0 4px 12px rgba(16,24,40,0.06)",          boxShadow: "0 4px 12px rgba(16,24,40,0.06)",

        },        },

      },      },

    },    },

    MuiCard: {    MuiCard: {

      styleOverrides: {      styleOverrides: {

        root: {        root: {

          backgroundColor: "#FFFFFF",          backgroundColor: "#FFFFFF",

          border: "1px solid rgba(16,24,40,0.04)",          border: "1px solid rgba(16,24,40,0.04)",

          boxShadow: "0 6px 20px rgba(16,24,40,0.06)",          boxShadow: "0 6px 20px rgba(16,24,40,0.06)",

        },        },

      },      },

    },    },

    MuiChip: {    MuiChip: {

      styleOverrides: {      styleOverrides: {

        root: {        root: {

          backgroundColor: PALETTE.surface,          backgroundColor: PALETTE.surface,

          color: PALETTE.textPrimary,          color: PALETTE.textPrimary,

        },        },

      },      },

    },    },

    MuiTooltip: {    MuiTooltip: {

      styleOverrides: {      styleOverrides: {

        tooltip: {        tooltip: {

          background: "#111827",          background: "#111827",

          color: "#fff",          color: "#fff",

        },        },

      },      },

    },    },

  },  },

});});



export default theme;export default theme;

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
      export default theme;
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

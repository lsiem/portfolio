import { createTheme, Theme } from "@mui/material/styles";

const getTheme = (mode: "light" | "dark"): Theme =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // Light mode colors
            background: {
              default: "#f8f9fa",
              paper: "#ffffff",
            },
            text: {
              primary: "#000000", // Darkened for better contrast
              secondary: "#1a1a1a", // Darkened for better contrast
            },
            primary: {
              main: "#476792",
              dark: "#6BA1EA",
              light: "#192535",
            },
            divider: "rgba(0, 0, 0, 0.12)",
            grey: {
              50: "#f8f9fa",
              100: "#f1f3f5",
              200: "#e9ecef",
              300: "#dee2e6",
              400: "#ced4da",
              500: "#adb5bd",
              600: "#868e96",
              700: "#495057",
              800: "#343a40",
              900: "#212529",
            },
          }
        : {
            // Dark mode colors
            background: {
              default: "#1e2631",
              paper: "#2d3642",
            },
            text: {
              primary: "#ffffff", // Brightened for better contrast
              secondary: "#e1e1e1", // Brightened for better contrast
            },
            primary: {
              main: "#6e40c9",
              dark: "#553098",
              light: "#8b5cf6",
            },
            divider: "rgba(255, 255, 255, 0.12)",
            grey: {
              900: "#ffffff", // Adjusted for better contrast
              800: "#e1e1e1",
              700: "#c2c2c2",
              600: "#6e7681",
              500: "#484f58",
              400: "#30363d",
              300: "#21262d",
              200: "#161b22",
              100: "#0d1117",
              50: "#010409",
            },
          }),
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "light" ? "#ffffff" : "#1e2631",
            boxShadow: "none",
            borderBottom: `1px solid ${mode === "light" ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)"}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
          },
          containedPrimary: {
            backgroundColor: "#6e40c9",
            color: "#ffffff", // Ensuring button text is always visible
            "&:hover": {
              backgroundColor: "#553098",
            },
          },
          outlined: {
            borderColor: mode === "light" ? "#d0d7de" : "#30363d",
            color: mode === "light" ? "#000000" : "#ffffff", // Adjusted for better contrast
            "&:hover": {
              backgroundColor: "rgba(110, 64, 201, 0.1)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            color: mode === "light" ? "#000000" : "#ffffff", // Ensuring text in Paper components is visible
          },
        },
      },
    },
  });

export default getTheme;

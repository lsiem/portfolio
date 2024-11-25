import { createTheme, Theme } from "@mui/material/styles";
import {
  getContrastRatio,
  suggestAccessibleColor,
} from "./utils/colorContrast";

const getTheme = (mode: "light" | "dark"): Theme => {
  // Define base colors
  const lightBase = {
    background: "#f8f9fa",
    paper: "#ffffff",
    textPrimary: "#000000",
    textSecondary: "#1a1a1a",
    primary: "#476792",
    primaryDark: "#6BA1EA",
    primaryLight: "#192535",
  };

  const darkBase = {
    background: "#1e2631",
    paper: "#2d3642",
    textPrimary: "#ffffff",
    textSecondary: "#e1e1e1",
    primary: "#8b5cf6", // Adjusted for better contrast
    primaryDark: "#6e40c9",
    primaryLight: "#a78bfa",
  };

  // Ensure text colors meet contrast requirements
  const base = mode === "light" ? lightBase : darkBase;
  const textPrimary = suggestAccessibleColor(
    base.textPrimary,
    base.background,
    false,
  );
  const textSecondary = suggestAccessibleColor(
    base.textSecondary,
    base.background,
    false,
  );
  const primaryColor = suggestAccessibleColor(
    base.primary,
    base.background,
    false,
  );

  return createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            background: {
              default: lightBase.background,
              paper: lightBase.paper,
            },
            text: {
              primary: textPrimary,
              secondary: textSecondary,
            },
            primary: {
              main: primaryColor,
              dark: suggestAccessibleColor(
                lightBase.primaryDark,
                lightBase.background,
                false,
              ),
              light: suggestAccessibleColor(
                lightBase.primaryLight,
                lightBase.background,
                false,
              ),
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
            background: {
              default: darkBase.background,
              paper: darkBase.paper,
            },
            text: {
              primary: textPrimary,
              secondary: textSecondary,
            },
            primary: {
              main: primaryColor,
              dark: suggestAccessibleColor(
                darkBase.primaryDark,
                darkBase.background,
                false,
              ),
              light: suggestAccessibleColor(
                darkBase.primaryLight,
                darkBase.background,
                false,
              ),
            },
            divider: "rgba(255, 255, 255, 0.12)",
            grey: {
              900: "#ffffff",
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
            backgroundColor:
              mode === "light" ? lightBase.paper : darkBase.background,
            boxShadow: "none",
            borderBottom: `1px solid ${
              mode === "light"
                ? "rgba(0, 0, 0, 0.12)"
                : "rgba(255, 255, 255, 0.12)"
            }`,
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
            backgroundColor: primaryColor,
            color: mode === "light" ? "#ffffff" : "#ffffff",
            "&:hover": {
              backgroundColor:
                mode === "light"
                  ? suggestAccessibleColor(
                      lightBase.primaryDark,
                      "#ffffff",
                      true,
                    )
                  : suggestAccessibleColor(
                      darkBase.primaryDark,
                      "#ffffff",
                      true,
                    ),
            },
          },
          outlined: {
            borderColor: mode === "light" ? "#d0d7de" : "#30363d",
            color: suggestAccessibleColor(
              mode === "light" ? "#000000" : "#ffffff",
              mode === "light" ? lightBase.paper : darkBase.paper,
              false,
            ),
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
            color: suggestAccessibleColor(
              mode === "light" ? "#000000" : "#ffffff",
              mode === "light" ? lightBase.paper : darkBase.paper,
              false,
            ),
          },
        },
      },
    },
  });
};

export default getTheme;

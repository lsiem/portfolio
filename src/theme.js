// theme.js
// TODO: Implement toggle switch for light and dark mode

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1e2631",
      paper: "#2d3642",
    },
    text: {
      primary: "#c9d1d9",
      secondary: "#8b949e",
    },
    primary: {
      main: "#6e40c9",
    },
    grey: {
      300: "#c9d1d9",
      400: "#8b949e",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e2631",
          boxShadow: "none",
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
          "&:hover": {
            backgroundColor: "#553098",
          },
        },
        outlined: {
          borderColor: "#30363d",
          color: "#c9d1d9",
          "&:hover": {
            backgroundColor: "rgba(110, 64, 201, 0.1)",
          },
        },
      },
    },
  },
});

export default theme;

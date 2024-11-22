import React from "react";
import { GlobalStyles as MUIGlobalStyles } from "@mui/material";
import { Theme } from "@mui/material/styles";

const GlobalStyles: React.FC = () => (
  <MUIGlobalStyles
    styles={(theme: Theme) => ({
      "*": {
        boxSizing: "border-box",
      },
      body: {
        margin: 0,
        padding: 0,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        fontFamily: theme.typography.fontFamily,
      },
    })}
  />
);

export default GlobalStyles;

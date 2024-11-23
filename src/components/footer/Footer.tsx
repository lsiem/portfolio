import React from "react";
import { Typography, Link, Box, Container } from "@mui/material";
import { Theme } from "@mui/material/styles";
import ToggleSwitch from "./ToggleSwitch";

interface FooterProps {
  onToggleTheme: () => void;
  theme: Theme;
}

const Footer: React.FC<FooterProps> = ({ onToggleTheme, theme }) => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        backgroundColor: "background.paper",
        color: "text.secondary",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: 1,
        borderColor: "divider",
        zIndex: 1000,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <ToggleSwitch theme={theme} onToggle={onToggleTheme} />
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} Lasse Siemoneit |{" "}
            <Link href="/imprint" color="inherit">
              Impressum
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

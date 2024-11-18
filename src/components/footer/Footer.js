import React from "react";
import { Typography, Link, Box } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        textAlign: "center",
        backgroundColor: "background.paper",
        color: "text.secondary",
      }}
    >
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} Lasse Siemoneit |{" "}
        <Link href="/imprint" color="inherit">
          Impressum
        </Link>
      </Typography>
    </Box>
  );
}

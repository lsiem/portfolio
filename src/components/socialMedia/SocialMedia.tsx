import React from "react";
import { Box, IconButton } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GoogleIcon from "@mui/icons-material/Google";
import InstagramIcon from "@mui/icons-material/Instagram";

const SocialMedia: React.FC = () => {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <IconButton
        href="https://github.com/lassesiemoneit"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          bgcolor: "primary.main",
          "&:hover": { bgcolor: "primary.dark" },
        }}
      >
        <GitHubIcon sx={{ color: "background.paper" }} />
      </IconButton>
      <IconButton
        href="https://www.linkedin.com/in/lasse-siemoneit"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          bgcolor: "primary.main",
          "&:hover": { bgcolor: "primary.dark" },
        }}
      >
        <LinkedInIcon sx={{ color: "background.paper" }} />
      </IconButton>
      <IconButton
        href="mailto:info@lassesiemoneit.de"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          bgcolor: "primary.main",
          "&:hover": { bgcolor: "primary.dark" },
        }}
      >
        <GoogleIcon sx={{ color: "background.paper" }} />
      </IconButton>
      <IconButton
        href="https://www.instagram.com/lassesiemoneit"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          bgcolor: "primary.main",
          "&:hover": { bgcolor: "primary.dark" },
        }}
      >
        <InstagramIcon sx={{ color: "background.paper" }} />
      </IconButton>
    </Box>
  );
};

export default SocialMedia;

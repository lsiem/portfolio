import React from "react";
import { IconButton, Box } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faLinkedin,
  faGoogle,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";

const socialMediaLinks = [
  {
    name: "Github",
    link: "https://github.com/lsiem",
    icon: faGithub,
    backgroundColor: "#333",
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/YourLinkedInUsername",
    icon: faLinkedin,
    backgroundColor: "#0077B5",
  },
  {
    name: "Google",
    link: "mailto:your.email@gmail.com",
    icon: faGoogle,
    backgroundColor: "#DB4437",
  },
  {
    name: "Instagram",
    link: "https://www.instagram.com/YourInstagramUsername",
    icon: faInstagram,
    backgroundColor: "#E4405F",
  },
];

export default function SocialMedia() {
  return (
    <Box sx={{ display: "flex", gap: 1.5 }}>
      {socialMediaLinks.map((media, i) => (
        <IconButton
          key={i}
          href={media.link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.1)",
            width: 40,
            height: 40,
            "&:hover": {
              bgcolor: media.backgroundColor,
              transform: "translateY(-3px)",
              transition: "all 0.3s ease-in-out",
            },
          }}
        >
          <FontAwesomeIcon
            icon={media.icon}
            style={{
              fontSize: "1.2rem",
              color: "#fff",
            }}
          />
        </IconButton>
      ))}
    </Box>
  );
}

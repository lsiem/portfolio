import React from "react";
import { Box, IconButton, Link } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GoogleIcon from "@mui/icons-material/Google";
import InstagramIcon from "@mui/icons-material/Instagram";
import styled from "@emotion/styled";
import { Theme } from "@mui/material/styles";

const SocialContainer = styled(Box)`
  display: flex;
  gap: ${({ theme }) => (theme as Theme).spacing(2)};
`;

const SocialIconButton = styled(IconButton)`
  background-color: ${({ theme }) => (theme as Theme).palette.primary.main};
  &:hover {
    background-color: ${({ theme }) => (theme as Theme).palette.primary.dark};
  }
`;

const SocialIcon = styled(Box)`
  color: ${({ theme }) => (theme as Theme).palette.background.paper};
`;

const SocialLink = styled(Link)`
  text-decoration: none;
`;

const SocialMedia: React.FC = () => {
  return (
    <SocialContainer>
      <SocialLink
        href="https://github.com/lassesiemoneit"
        target="_blank"
        rel="noopener noreferrer"
      >
        <SocialIconButton>
          <SocialIcon component={GitHubIcon} />
        </SocialIconButton>
      </SocialLink>
      <SocialLink
        href="https://www.linkedin.com/in/lasse-siemoneit"
        target="_blank"
        rel="noopener noreferrer"
      >
        <SocialIconButton>
          <SocialIcon component={LinkedInIcon} />
        </SocialIconButton>
      </SocialLink>
      <SocialLink
        href="mailto:info@lassesiemoneit.de"
        target="_blank"
        rel="noopener noreferrer"
      >
        <SocialIconButton>
          <SocialIcon component={GoogleIcon} />
        </SocialIconButton>
      </SocialLink>
      <SocialLink
        href="https://www.instagram.com/lassesiemoneit"
        target="_blank"
        rel="noopener noreferrer"
      >
        <SocialIconButton>
          <SocialIcon component={InstagramIcon} />
        </SocialIconButton>
      </SocialLink>
    </SocialContainer>
  );
};

export default SocialMedia;

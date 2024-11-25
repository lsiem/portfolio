import React from "react";
import { Typography, Link, Box, Container } from "@mui/material";
import { Theme } from "@mui/material/styles";
import styled from "@emotion/styled";
import ToggleSwitch from "./ToggleSwitch";

interface FooterProps {
  onToggleTheme: () => void;
  theme: Theme;
}

const FooterWrapper = styled(Box)`
  padding-top: ${({ theme }) => (theme as Theme).spacing(3)};
  padding-bottom: ${({ theme }) => (theme as Theme).spacing(3)};
  background-color: ${({ theme }) => (theme as Theme).palette.background.paper};
  color: ${({ theme }) => (theme as Theme).palette.text.secondary};
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid ${({ theme }) => (theme as Theme).palette.divider};
  z-index: 1000;
`;

const ContentContainer = styled(Container)`
  max-width: 1200px;
`;

const FlexBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => (theme as Theme).spacing(2)};
`;

const FooterText = styled(Typography)`
  color: ${({ theme }) => (theme as Theme).palette.text.secondary};
`;

const FooterLink = styled(Link)`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Footer: React.FC<FooterProps> = ({ onToggleTheme, theme }) => {
  return (
    <FooterWrapper component="footer">
      <ContentContainer maxWidth="lg">
        <FlexBox>
          <ToggleSwitch theme={theme} onToggle={onToggleTheme} />
          <FooterText variant="body2">
            &copy; {new Date().getFullYear()} Lasse Siemoneit |{" "}
            <FooterLink href="/imprint">Impressum</FooterLink>
          </FooterText>
        </FlexBox>
      </ContentContainer>
    </FooterWrapper>
  );
};

export default Footer;

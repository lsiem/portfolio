import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AppBar, IconButton, Drawer, Box, List, ListItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import styled from "@emotion/styled";
import { Theme } from "@mui/material/styles";

interface NavigationLink {
  name: string;
  url: string;
}

const StyledAppBar = styled(AppBar)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 5%;
  background-color: rgba(30, 38, 49, 0.8) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 1000;
  border-bottom: 1px solid rgba(48, 54, 61, 0.5);
`;

const HeaderContent = styled(Box)`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 900px) {
    padding: 0.5rem 1rem;
  }
`;

const LogoLink = styled(Link)`
  text-decoration: none;
  padding-left: 0;
  display: flex;
  align-items: center;
`;

const LogoText = styled.span`
  color: #8b949e;
  font-size: 1.5rem;
  font-weight: 500;
  font-family: "Google Sans", sans-serif;
  margin-left: 40px;
  transition: color 0.3s ease;

  &:hover {
    color: #c9d1d9;
  }
`;

const NavigationLinks = styled(Box)`
  display: flex;
  gap: 3rem;
  margin: 0;
  padding: 0;
`;

const StyledNavLink = styled(Link)<{ active: string }>`
  text-decoration: none;
  color: #8b949e;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;

  &:hover {
    color: #c9d1d9;
    background-color: rgba(110, 64, 201, 0.1);
  }

  ${(props) =>
    props.active === "true" &&
    `
    color: #c9d1d9;
    background-color: rgba(110, 64, 201, 0.15);
  `}
`;

const MenuButton = styled(IconButton)`
  color: #c9d1d9 !important;
`;

const DrawerList = styled(List)`
  background-color: #161b22;
  height: 100%;
  width: 250px;
  padding: 2rem 1rem;
`;

const StyledDrawerLink = styled(Link)<{ active: string }>`
  text-decoration: none;
  color: inherit;
  display: block;
  padding: 0.8rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  ${(props) =>
    props.active === "true" &&
    `
    background-color: rgba(0, 0, 0, 0.1);
  `}
`;

const Header: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const navigationLinks: NavigationLink[] = [
    { name: "Home", url: "/" },
    { name: "Über mich", url: "/about" },
    { name: "Referenzen", url: "/projects" },
    { name: "Kontakt", url: "/contact" },
  ];

  const isActive = (path: string): boolean => {
    return window.location.pathname === path;
  };

  return (
    <StyledAppBar position="fixed">
      <HeaderContent>
        <LogoLink to="/">
          <LogoText>{"< Lasse Siemoneit />"}</LogoText>
        </LogoLink>

        <NavigationLinks sx={{ display: { xs: "none", md: "flex" } }}>
          {navigationLinks.map((link) => (
            <StyledNavLink
              key={link.name}
              to={link.url}
              active={isActive(link.url).toString()}
            >
              {link.name}
            </StyledNavLink>
          ))}
        </NavigationLinks>

        <MenuButton
          sx={{ display: { xs: "block", md: "none" } }}
          onClick={() => setIsDrawerOpen(true)}
        >
          <MenuIcon />
        </MenuButton>

        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        >
          <DrawerList>
            {navigationLinks.map((link) => (
              <ListItem key={link.name}>
                <StyledDrawerLink
                  to={link.url}
                  active={isActive(link.url).toString()}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  {link.name}
                </StyledDrawerLink>
              </ListItem>
            ))}
          </DrawerList>
        </Drawer>
      </HeaderContent>
    </StyledAppBar>
  );
};

export default Header;

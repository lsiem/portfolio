import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AppBar, IconButton, Drawer, Box, List, ListItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import "./Header.css";

function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigationLinks = [
    { name: "Home", url: "/" },
    { name: "Über mich", url: "/about" },
    { name: "Referenzen", url: "/projects" },
    { name: "Kontakt", url: "/contact" },
  ];

  const isActive = (path) => {
    return window.location.pathname === path;
  };

  return (
    <AppBar position="fixed" className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-name">{"< Lasse Siemoneit />"}</span>
        </Link>

        <Box
          className="navigation-links"
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {navigationLinks.map((link) => (
            <Link
              key={link.name}
              to={link.url}
              className={`nav-link ${isActive(link.url) ? "active" : ""}`}
            >
              {link.name}
            </Link>
          ))}
        </Box>

        <IconButton
          className="menu-button"
          sx={{ display: { xs: "block", md: "none" } }}
          onClick={() => setIsDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        >
          <List className="drawer-list">
            {navigationLinks.map((link) => (
              <ListItem key={link.name}>
                <Link
                  to={link.url}
                  className={`drawer-link ${isActive(link.url) ? "active" : ""}`}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  {link.name}
                </Link>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </div>
    </AppBar>
  );
}

export default Header;

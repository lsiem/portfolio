import React from 'react';
import "./Header.css";
import { NavLink, Link } from "react-router-dom";
import { greeting, settings } from "../../portfolio.js";
import SeoHeader from "../seoHeader/SeoHeader";
import { useSpring, animated } from 'react-spring';

const onMouseEnter = (event, color) => {
  const el = event.target;
  el.style.backgroundColor = color;
};

const onMouseOut = (event) => {
  const el = event.target;
  el.style.backgroundColor = "transparent";
};

function Header({ theme }) {
  const fadeEffect = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 }
  });

  const link = settings.isSplash ? "/splash" : "home";

  return (
    <animated.div style={fadeEffect}>
      <SeoHeader />
      <div>
        <header className="header">
          <NavLink to={link} tag={Link} className="logo">
            <span style={{ color: theme.text }}> &lt;</span>
            <span className="logo-name" style={{ color: theme.text }}>
              {greeting.logo_name}
            </span>
            <span style={{ color: theme.text }}>/&gt;</span>
          </NavLink>
          <input className="menu-btn" type="checkbox" id="menu-btn" />
          <label className="menu-icon" htmlFor="menu-btn">
            <span className="navicon"></span>
          </label>
          <ul className="menu" style={{ backgroundColor: theme.body }}>
            <li>
              <NavLink
                to="/home"
                tag={Link}
                activeStyle={{ fontWeight: "bold" }}
                style={{ color: theme.text }}
                onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                onMouseOut={(event) => onMouseOut(event)}
              >
                Über mich
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/experience"
                tag={Link}
                activeStyle={{ fontWeight: "bold" }}
                style={{ color: theme.text }}
                onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                onMouseOut={(event) => onMouseOut(event)}
              >
                Referenzen
              </NavLink>
            </li>
            <li>
              <a
                href="https://github.com/lsiem"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.text }}
                onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                onMouseOut={(event) => onMouseOut(event)}
              >
                Open Source
              </a>
            </li>
            <li>
              <NavLink
                to="/contact"
                tag={Link}
                activeStyle={{ fontWeight: "bold" }}
                style={{ color: theme.text }}
                onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                onMouseOut={(event) => onMouseOut(event)}
              >
                Kontakt
              </NavLink>
            </li>
          </ul>
        </header>
      </div>
    </animated.div>
  );
}

export default Header;

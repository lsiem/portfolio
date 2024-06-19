import React from "react";
import "./Footer.css";
import { useSpring, animated } from 'react-spring';
/* eslint-disable jsx-a11y/accessible-emoji */

export default function Footer(props) {
  const fade = useSpring({ to: { opacity: 1 }, from: { opacity: 0 } });

  return (
    <div className="footer-div">
      <animated.div style={fade}>
        <p className="footer-text" style={{ color: props.theme.secondaryText }}>
          Copyright © {new Date().getFullYear()} Lasse Siemoneit |{" "}
          <a href="/imprint" style={{ color: props.theme.secondaryText }}>
            Impressum
          </a>
        </p>
        {/* <ToggleSwitch theme={props.theme} onToggle={props.onToggle}/> */}
      </animated.div>
    </div>
  );
}

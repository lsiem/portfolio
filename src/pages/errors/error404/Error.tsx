import React from "react";
import Header from "../../../components/header/Header";
import TopButton from "../../../components/topButton/TopButton";
import { useSpring, animated, SpringValue } from "react-spring";
import "./Error.css";
import { Link } from "react-router-dom";
import { Theme } from "@mui/material/styles";

interface ErrorProps {
  theme: Theme;
}

interface AnimatedStyles {
  opacity: SpringValue<number>;
  transform: SpringValue<string>;
}

const Error: React.FC<ErrorProps> = ({ theme }) => {
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: "translateY(40px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 2000 },
  }) as AnimatedStyles;

  return (
    <div className="error-main">
      <Header />
      <div className="error-class">
        <animated.div style={fadeAndSlide}>
          <h1>Woops</h1>
          <h1 className="error-404">404</h1>
          <p>
            Die angeforderte Seite ist nicht verfügbar... Klicke auf den Button
            um auf die Startseite zu gelangen!
          </p>
          <Link
            className="main-button"
            to="/home"
            style={{
              color: theme.palette.background.default,
              backgroundColor: theme.palette.text.primary,
              border: `solid 1px ${theme.palette.text.primary}`,
              display: "inline-flex",
            }}
          >
            Zur Startseite
          </Link>
        </animated.div>
      </div>
      <TopButton />
    </div>
  );
};

export default Error;

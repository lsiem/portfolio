import React from "react";
import Header from "../../../components/header/Header";
import TopButton from "../../../components/topButton/TopButton";
import { useSpring, animated } from "react-spring";
import "./Error.css";
import { Link } from "react-router-dom";

function Error({ theme }) {
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: "translateY(40px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 2000 },
  });

  return (
    <div className="error-main">
      <Header theme={theme} />
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
              color: theme.body,
              backgroundColor: theme.text,
              border: `solid 1px ${theme.text}`,
              display: "inline-flex",
            }}
          >
            Zur Startseite
          </Link>
        </animated.div>
      </div>
      <TopButton theme={theme} />
    </div>
  );
}

export default Error;

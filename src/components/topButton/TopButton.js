import React from "react";
import "./TopButton.css";

export default function TopButton({ theme }) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 30) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const applyColor = (color, bgColor) => {
    /* For the button */
    const topButton = document.getElementById("topButton");
    topButton.style.color = color;
    topButton.style.backgroundColor = bgColor;

    /* For arrow icon */
    const arrow = document.getElementById("arrow");
    arrow.style.color = color;
    arrow.style.backgroundColor = bgColor;
  };

  const onMouseEnter = () => {
    applyColor(theme.text, theme.body);
  };

  const onMouseLeave = () => {
    applyColor(theme.body, theme.text);
  };

  return (
    <div
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      id="topButton"
      className={`top-button ${isVisible ? "visible" : ""}`}
      title="Go up"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <i className="fas fa-arrow-up" id="arrow" aria-hidden="true" />
    </div>
  );
}

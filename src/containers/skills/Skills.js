import React from "react";
import "./Skills.css";
import SkillSection from "./SkillSection";
import { useSpring, animated } from 'react-spring';

export default function Skills(props) {
  const theme = props.theme;
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 2000 }
  });

  return (
    <div className="main" id="skills">
      <div className="skills-header-div">
        <animated.div style={fadeAndSlide}>
          <h1 className="skills-header" style={{ color: theme.text }}>
            Meine Fähigkeiten
          </h1>
        </animated.div>
      </div>
      <SkillSection theme={theme} />
    </div>
  );
}

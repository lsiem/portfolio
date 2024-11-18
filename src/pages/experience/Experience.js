import React from "react";
import Header from "../../components/header/Header";
import TopButton from "../../components/topButton/TopButton";
import ExperienceAccordion from "../../containers/experienceAccordion/ExperienceAccordion.js";
import "./Experience.css";
import { experience } from "../../portfolio.js";
import { useSpring, animated } from "react-spring";

function Experience({ theme, onToggle }) {
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: "translateY(40px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 2000 },
  });

  return (
    <div className="experience-main">
      <Header theme={theme} />
      <div className="basic-experience">
        <animated.div style={fadeAndSlide} className="experience-heading-div">
          <div className="experience-heading-img-div">
            <img src={require("../../assets/images/experience.png")} alt="" />
          </div>
          <div className="experience-heading-text-div">
            <h1
              className="experience-heading-text"
              style={{ color: theme.text }}
            >
              {experience.title}
            </h1>
            <h3
              className="experience-heading-sub-text"
              style={{ color: theme.text }}
            >
              {experience.subtitle}
            </h3>
            <p
              className="experience-header-detail-text subTitle"
              style={{ color: theme.secondaryText }}
            >
              {experience.description}
            </p>
          </div>
        </animated.div>
      </div>
      <ExperienceAccordion sections={experience.sections} theme={theme} />
      <TopButton theme={theme} />
    </div>
  );
}

export default Experience;

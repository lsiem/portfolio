import React from "react";
import Header from "../../components/header/Header";
import TopButton from "../../components/topButton/TopButton";
import ExperienceAccordion from "../../containers/experienceAccordion/ExperienceAccordion";
import "./Experience.css";
import { experience } from "../../portfolio";
import { useSpring, animated, SpringValue } from "react-spring";
import { Theme } from "@mui/material/styles";

interface ExperienceProps {
  theme: Theme;
  onToggle: () => void;
}

interface AnimatedStyles {
  opacity: SpringValue<number>;
  transform: SpringValue<string>;
}

const Experience: React.FC<ExperienceProps> = ({ theme, onToggle }) => {
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: "translateY(40px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 2000 },
  }) as AnimatedStyles;

  return (
    <div className="experience-main">
      <Header />
      <div className="basic-experience">
        <animated.div style={fadeAndSlide} className="experience-heading-div">
          <div className="experience-heading-img-div">
            <img src={require("../../assets/images/experience.png")} alt="" />
          </div>
          <div className="experience-heading-text-div">
            <h1
              className="experience-heading-text"
              style={{ color: theme.palette.text.primary }}
            >
              {experience.title}
            </h1>
            <h3
              className="experience-heading-sub-text"
              style={{ color: theme.palette.text.primary }}
            >
              {experience.subtitle}
            </h3>
            <p
              className="experience-header-detail-text subTitle"
              style={{ color: theme.palette.text.secondary }}
            >
              {experience.description}
            </p>
          </div>
        </animated.div>
      </div>
      <ExperienceAccordion sections={experience.sections} />
      <TopButton />
    </div>
  );
};

export default Experience;

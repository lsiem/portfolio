import React from "react";
import "./MainProjectCard.css";
import ProjectLanguages from "../projectLanguages/ProjectLanguages";
import { useSpring, animated } from 'react-spring';

const MainProjectCard = ({ project }) => {
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 1000 }
  });

  return (
    <animated.div style={fadeAndSlide} className="main-project-card">
      <div className="main-project-details">
        <h2 className="main-project-title">{project.title}</h2>
        <p className="main-project-description">{project.description}</p>
        <div className="main-project-footer">
          <ProjectLanguages logos={project.technologies} />
        </div>
      </div>
    </animated.div>
  );
};

export default MainProjectCard;

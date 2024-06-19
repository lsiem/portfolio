import React from "react";
import "./SideProjectCard.css";
import ProjectLanguages from "../projectLanguages/ProjectLanguages";
import { useSpring, animated } from 'react-spring';

const SideProjectCard = ({ project }) => {
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 1000 }
  });

  return (
    <animated.div style={fadeAndSlide} className="side-project-card">
      <div className="side-project-details">
        <h2 className="side-project-title">{project.title}</h2>
        <p className="side-project-description">{project.description}</p>
        <div className="side-project-footer">
          <ProjectLanguages logos={project.technologies} />
        </div>
      </div>
    </animated.div>
  );
};

export default SideProjectCard;

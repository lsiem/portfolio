import React from "react";
import "./SideProjectCard.css";
import { Fade } from "react-reveal";
import ProjectLanguages from "../projectLanguages/ProjectLanguages";

const SideProjectCard = ({ project }) => {
  return (
    <Fade bottom duration={1000} distance="20px">
      <div className="side-project-card">
        <div className="side-project-title">
          <h2>{project.title}</h2>
        </div>
        <div className="side-project-details">
          <h3>{project.title}</h3>
          <p className="side-project-description">{project.description}</p>
          <div className="side-project-footer">
            <ProjectLanguages logos={project.technologies} />
          </div>
        </div>
      </div>
    </Fade>
  );
};

export default SideProjectCard;

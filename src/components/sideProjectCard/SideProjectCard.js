import React from "react";
import "./SideProjectCard.css";
import { Fade } from "react-reveal";
import ProjectLanguages from "../projectLanguages/ProjectLanguages";

const SideProjectCard = ({ project }) => {
  return (
    <Fade bottom duration={1000} distance="20px">
      <div className="side-project-card">
        <div className="side-project-header">
          <h3 className="side-project-title">{project.title}</h3>
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="side-project-link"
          >
          </a>
        </div>
        <p className="side-project-description">{project.description}</p>
        <ProjectLanguages logos={project.technologies} />
      </div>
    </Fade>
  );
};

export default SideProjectCard;

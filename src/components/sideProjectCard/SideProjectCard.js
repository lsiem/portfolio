import React from "react";
import "./SideProjectCard.css";
import { Fade } from "react-reveal";
import ProjectLanguages from "../projectLanguages/ProjectLanguages";

const SideProjectCard = ({ project }) => {
  return (
    <Fade bottom duration={1000} distance="20px">
      <div className="side-project-card">
        <div className="side-project-image">
          <img src={project.image_path} alt={project.title} />
        </div>
        <div className="side-project-details">
          <h3>{project.title}</h3>
          <p className="side-project-description">{project.description}</p>
          <div className="side-project-footer">
            <ProjectLanguages logos={project.technologies} />
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              Mehr erfahren
            </a>
          </div>
        </div>
      </div>
    </Fade>
  );
};

export default SideProjectCard;

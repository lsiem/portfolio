import React from "react";
import "./MainProjectCard.css";
import ProjectLanguages from "../projectLanguages/ProjectLanguages";

const MainProjectCard = ({ project, theme }) => {
  return (
    <div className="main-project-card">
      <div className="main-project-image">
        <img src={project.image_path} alt={project.title} />
      </div>
      <div className="main-project-details">
        <h3>{project.title}</h3>
        <p className="main-project-description">{project.description}</p>
        <div className="main-project-footer">
          <ProjectLanguages logos={project.technologies} />
          <a href={project.link} target="_blank" rel="noopener noreferrer">
            Mehr erfahren
          </a>
        </div>
      </div>
    </div>
  );
};

export default MainProjectCard;

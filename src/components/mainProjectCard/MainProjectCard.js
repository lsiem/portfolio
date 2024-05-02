import React from "react";
import "./MainProjectCard.css";
import ProjectLanguages from "../projectLanguages/ProjectLanguages";

const MainProjectCard = ({ project, theme }) => {
  return (
    <div className="main-project-card">
      <div className="main-project-title">
        <h2>{project.title}</h2>
      </div>
      <div className="main-project-details">
        <h3>{project.title}</h3>
        <p className="main-project-description">{project.description}</p>
        <div className="main-project-footer">
          <ProjectLanguages logos={project.technologies} />
        </div>
      </div>
    </div>
  );
};

export default MainProjectCard;

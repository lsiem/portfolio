import React from "react";
import "./MainProjectCard.css";
import ProjectLanguages from "../projectLanguages/ProjectLanguages";

const MainProjectCard = ({ project, theme }) => {
  return (
    <div className="main-project-card">
      <div className="main-project-details">
        <h2 className="main-project-title">{project.title}</h2>
        <p className="main-project-description">{project.description}</p>
        <div className="main-project-footer">
          <ProjectLanguages logos={project.technologies} />
        </div>
      </div>
    </div>
  );
};

export default MainProjectCard;

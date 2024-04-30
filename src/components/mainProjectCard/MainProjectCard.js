import React from "react";
import "./MainProjectCard.css";

const MainProjectCard = ({ project, theme }) => {
  return (
    <div className="main-project-card">
      <div className="main-project-image">
        <img src={project.image_path} alt={project.title} />
      </div>
      <div className="main-project-details">
        <h3 style={{ color: theme.text }}>{project.title}</h3>
        <p className="main-project-description" style={{ color: theme.secondaryText }}>
          {project.description}
        </p>
        <div className="main-project-footer">
          <p className="main-project-tech" style={{ color: theme.secondaryText }}>
            {project.technologies.join(" | ")}  
          </p>
          <a href={project.link} target="_blank" rel="noopener noreferrer">
            View Project
          </a>
        </div>
      </div>
    </div>
  );
};

export default MainProjectCard;

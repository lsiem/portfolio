import React from "react";
import "./SideProjectCard.css";

const SideProjectCard = ({ project, theme }) => {
  return (
    <div className="side-project-card">
      <div className="side-project-image">
        <img src={project.image_path} alt={project.title} />
      </div>
      <div className="side-project-details">  
        <h3 style={{ color: theme.text }}>{project.title}</h3>
        <p className="side-project-description" style={{ color: theme.secondaryText }}>
          {project.description}
        </p>
        <div className="side-project-footer">
          <p className="side-project-tech" style={{ color: theme.secondaryText }}>
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

export default SideProjectCard;

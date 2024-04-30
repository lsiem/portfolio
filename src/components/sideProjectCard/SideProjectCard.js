import React from "react";
import "./SideProjectCard.css";

const SideProjectCard = ({ project, theme }) => {
  return (
    <div className="side-project-card">
      <div className="side-project-image">
        <img src={project.image_path} alt={project.title} />
      </div>
      <div className="side-project-details">  
        <h3>{project.title}</h3>
        <p className="side-project-description">
          {project.description}
        </p>
        <div className="side-project-footer">
          <p className="side-project-tech">
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

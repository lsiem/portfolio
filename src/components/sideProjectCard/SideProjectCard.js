import React, { useContext } from "react";
import { Fade } from "react-reveal";
import "./SideProjectCard.css";
import ProjectLanguages from "../projectLanguages/ProjectLanguages";

const SideProjectCard = ({ project }) => {
  return (
    <Fade bottom duration={1000} distance="20px">
      <div className="side-project-card">
        <div className="side-project-details">
          <h2 className="side-project-title">{project.title}</h2>
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

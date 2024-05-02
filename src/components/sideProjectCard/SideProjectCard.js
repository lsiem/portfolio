import React, { useContext } from "react";
import { Fade } from "react-reveal";
import StyleContext from "../../contexts/StyleContext";
import "./SideProjectCard.css";
import { Fade } from "react-reveal";
import ProjectLanguages from "../projectLanguages/ProjectLanguages";

const SideProjectCard = ({ project }) => {
  const { isDark } = useContext(StyleContext);
  return (
    <Fade bottom duration={1000} distance="20px">
      <div className="side-project-card" style={{ backgroundColor: isDark ? "#1D1D1D" : "#ffffff" }}>
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

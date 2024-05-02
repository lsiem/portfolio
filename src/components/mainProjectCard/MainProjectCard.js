import React, { useContext } from "react";
import { Fade } from "react-reveal";
import StyleContext from "../../contexts/StyleContext";
import "./MainProjectCard.css";
import ProjectLanguages from "../projectLanguages/ProjectLanguages";

const MainProjectCard = ({ project }) => {
  const { isDark } = useContext(StyleContext);
  return (
    <Fade bottom duration={1000} distance="20px">
      <div className="main-project-card" style={{ backgroundColor: isDark ? "#1D1D1D" : "#ffffff" }}>
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

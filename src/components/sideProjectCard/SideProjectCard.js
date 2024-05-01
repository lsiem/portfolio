import React from "react";
import "./SideProjectCard.css";
import { Fade } from "react-reveal";
import { Icon } from "@iconify/react";

const SideProjectCard = ({ project }) => {
  return (
    <Fade bottom duration={1000} distance="20px">
      <div className="side-project-card">
        <div className="side-project-header">
          <h3 className="side-project-title">{project.title}</h3>
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="side-project-link"
          >
            <Icon icon="akar-icons:link-chain" />
          </a>
        </div>
        <p className="side-project-description">{project.description}</p>
        <div className="side-project-tech-list">
          {project.technologies.map((tech, index) => (
            <Icon
              key={index}
              icon={tech.fontAwesomeClassname}
              style={tech.style}
              className="side-project-tech-icon"
            />
          ))}
        </div>
      </div>
    </Fade>
  );
};

export default SideProjectCard;

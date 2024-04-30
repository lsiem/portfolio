import React from "react";
import "./ExperienceSectionCard.css";

const ExperienceSectionCard = ({ section, theme, expanded, setExpanded }) => {
  return (
    <div
      className={`experience-section-card ${
        expanded === section.title ? "selected" : ""
      }`}
      style={{ backgroundColor: theme.headerColor }}
      onClick={() => setExpanded(section.title)}
    >
      <h3 className="section-card-title">{section.title}</h3>
    </div>
  );
};

export default ExperienceSectionCard;

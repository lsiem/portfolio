import React from "react";
import "./ExperienceSectionCard.css";

const ExperienceSectionCard = ({ section, theme, setExpanded }) => {
  return (
    <div
      className="experience-section-card"
      style={{ backgroundColor: theme.headerColor }}
      onClick={() => setExpanded(section.title)}
    >
      <h3 className="section-card-title" style={{ color: theme.body }}>
        {section.title}
      </h3>
    </div>
  );
};

export default ExperienceSectionCard;

import React from "react";
import "./ExperienceSectionCard.css";

interface Theme {
  headerColor: string;
}

interface Section {
  title: string;
  work?: boolean;
  mainProjects?: boolean;
  sideProjects?: boolean;
}

interface ExperienceSectionCardProps {
  section: Section;
  theme: Theme;
  expanded: string | null;
  setExpanded: (title: string) => void;
}

const ExperienceSectionCard: React.FC<ExperienceSectionCardProps> = ({
  section,
  theme,
  expanded,
  setExpanded,
}) => {
  return (
    <div
      className={`experience-section-card ${
        expanded === section.title ? "selected" : ""
      }`}
      style={{ backgroundColor: theme.headerColor }}
      onClick={() => setExpanded(section.title)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setExpanded(section.title);
        }
      }}
    >
      <h3 className="section-card-title">{section.title}</h3>
    </div>
  );
};

export default ExperienceSectionCard;

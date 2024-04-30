import React, { useState } from "react";
import ExperienceCard from "../../components/experienceCard/ExperienceCard.js";
import ExperienceSectionCard from "../../components/experienceSectionCard/ExperienceSectionCard.js";
import "./ExperienceAccordion.css";

const ExperienceAccordion = ({ sections, theme }) => {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="experience-accord">
      <div className="experience-section-container">
        {sections.map((section) => (
          <ExperienceSectionCard
            key={section.title}
            section={section}
            theme={theme}
            setExpanded={setExpanded}
          />
        ))}
      </div>
      {expanded && (
        <div className="experience-details-container">
          {sections
            .find((section) => section.title === expanded)
            .experiences.map((experience, index) => (
              <ExperienceCard
                key={`${expanded}-${index}`}
                index={index}
                totalCards={
                  sections.find((section) => section.title === expanded)
                    .experiences.length
                }
                experience={experience}
                theme={theme}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceAccordion;

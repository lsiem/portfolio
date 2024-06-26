import React, { useState } from "react";
import ExperienceCard from "../../components/experienceCard/ExperienceCard.js";
import MainProjectCard from "../../components/mainProjectCard/MainProjectCard.js";
import SideProjectCard from "../../components/sideProjectCard/SideProjectCard.js";
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
            expanded={expanded}
            setExpanded={setExpanded}
            isActive={expanded === section.title}
            className={expanded === section.title ? "active" : ""}
          />
        ))}
      </div>
      <div
        className={`experience-details-container ${
          expanded ? "expanded" : "collapsed"
        }`}
      >
        {expanded &&
          (() => {
            const selectedSection = sections.find(
              (section) => section.title === expanded
            );
            return (
              <>
                {selectedSection?.experiences?.map((experience, index) => (
                  <ExperienceCard
                    key={`experience-${index}`}
                    index={index}
                    experience={experience}
                    theme={theme}
                  />
                ))}
                {selectedSection?.projects?.map((project, index) =>
                  selectedSection.mainProjects ? (
                    <MainProjectCard
                      key={`main-project-${index}`}
                      index={index}
                      project={project}
                      theme={theme}
                    />
                  ) : (
                    <SideProjectCard
                      key={`side-project-${index}`}
                      index={index}
                      project={project}
                      theme={theme}
                    />
                  )
                )}
              </>
            );
          })()}
      </div>
    </div>
  );
};

export default ExperienceAccordion;

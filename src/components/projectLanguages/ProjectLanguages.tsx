import React from "react";
import "./ProjectLanguages.css";

interface Logo {
  name: string;
  skillName: string;
  iconifyClass: string;
}

interface ProjectLanguagesProps {
  logos: string[] | Logo[];
}

const ProjectLanguages: React.FC<ProjectLanguagesProps> = ({ logos }) => {
  // Helper function to determine if the logo is a string or Logo object
  const isLogoObject = (logo: string | Logo): logo is Logo => {
    return typeof logo === "object" && "name" in logo;
  };

  return (
    <div>
      <div className="software-skills-main-div">
        <ul className="dev-icons-languages">
          {logos.map((logo, index) => {
            if (isLogoObject(logo)) {
              return (
                <li
                  key={logo.name}
                  className="software-skill-inline-languages tooltip"
                  data-name={logo.skillName}
                >
                  <span
                    className="iconify"
                    data-icon={logo.iconifyClass}
                    data-inline="false"
                  />
                  <span className="tooltiptext">{logo.name}</span>
                </li>
              );
            } else {
              // Handle case where logo is just a string
              return (
                <li
                  key={index}
                  className="software-skill-inline-languages tooltip"
                  data-name={logo}
                >
                  <span className="tooltiptext">{logo}</span>
                  {logo}
                </li>
              );
            }
          })}
        </ul>
      </div>
    </div>
  );
};

export default ProjectLanguages;

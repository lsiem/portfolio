import React from "react";
import "./SoftwareSkill.css";

interface LogoStyle {
  [key: string]: string | number;
}

interface Logo {
  skillName: string;
  fontAwesomeClassname?: string;
  imageSrc?: string;
  style?: LogoStyle;
}

interface SoftwareSkillProps {
  logos: Logo[];
}

const SoftwareSkill: React.FC<SoftwareSkillProps> = ({ logos }) => {
  return (
    <div>
      <div className="software-skills-main-div">
        <ul className="dev-icons">
          {logos.map((logo, index) => (
            <li key={index} className="software-skill-inline" data-name={logo.skillName}>
              {logo.fontAwesomeClassname && (
                <span
                  className="iconify tooltip"
                  data-icon={logo.fontAwesomeClassname}
                  style={logo.style}
                  data-inline="false"
                >
                  <span className="tooltiptext">{logo.skillName}</span>
                </span>
              )}
              {!logo.fontAwesomeClassname && logo.imageSrc && (
                <img
                  className="skill-image tooltip"
                  style={logo.style}
                  src={`${process.env.PUBLIC_URL}/skills/${logo.imageSrc}`}
                  alt={logo.skillName}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SoftwareSkill;

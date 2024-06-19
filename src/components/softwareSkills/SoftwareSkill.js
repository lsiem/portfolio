import React from "react";
import "./SoftwareSkill.css";

class SoftwareSkill extends React.Component {
  render() {
    return (
      <div>
        <div className="software-skills-main-div">
          <ul className="dev-icons">
            {this.props.logos.map((logo) => {
              return (
                <li className="software-skill-inline" name={logo.skillName}>
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
                    >
                      <span className="tooltiptext">{logo.skillName}</span>
                    </img>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default SoftwareSkill;

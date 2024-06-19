import React, { Component } from "react";
import "./ProjectLanguages.css";

class ProjectLanguages extends Component {
  render() {
    return (
      <div>
        <div className="software-skills-main-div">
          <ul className="dev-icons-languages">
            {this.props.logos.map((logo) => {
              return (
                <li key={logo.name} className="software-skill-inline-languages tooltip" name={logo.skillName}>
                  <span className="iconify" data-icon={logo.iconifyClass} data-inline="false"></span>
                  <span className="tooltiptext">{logo.name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default ProjectLanguages;

import React, { Component } from "react";
import "./Skills.css";
import SoftwareSkill from "../../components/softwareSkills/SoftwareSkill";
import { skills } from "../../portfolio";
import { Fade } from "react-reveal";
import DataScienceImg from "./DataScienceImg";
import FullStackImg from "./FullStackImg";
import CloudInfraImg from "./CloudInfraImg";
import DesignImg from "./DesignImg";

class SkillSection extends Component {
  render() {
    const { theme } = this.props;
    const skillData = skills ? skills.data : []; // Provide a default empty array if skills.data is undefined

    return (
      <div>
        {skillData.map((
          skill,
          i // Use skillData which is guaranteed to be an array
        ) => (
          <div key={i} className="skills-main-div">
            <Fade left duration={2000}>
              <div className="skills-image-div"></div>
            </Fade>

            <div className="skills-text-div">
              <Fade right duration={1000}>
                <h1 className="skills-heading" style={{ color: theme.text }}>
                  {skill.title}
                </h1>
              </Fade>
              {skill.categories &&
                skill.categories.map((category, index) => (
                  <div key={index} className="skills-subcategory-container">
                    <Fade right duration={1500}>
                      <h2
                        className="skills-subheading"
                        style={{ color: theme.text }}
                      >
                        {category.categoryTitle}
                      </h2>
                      <SoftwareSkill logos={category.softwareSkills} />
                      {category.skills &&
                        category.skills.map((skillSentence, idx) => (
                          <p
                            key={idx}
                            className="subTitle skills-text"
                            style={{ color: theme.secondaryText }}
                          >
                            {skillSentence}
                          </p>
                        ))}
                    </Fade>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default SkillSection;

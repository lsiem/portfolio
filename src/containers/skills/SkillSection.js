import React, { Component } from "react";
import { Fade } from "react-reveal";
import SoftwareSkill from "../../components/softwareSkills/SoftwareSkill";
import { skills } from "../../portfolio";
import "./Skills.css";

class SkillSection extends Component {
  render() {
    const { theme } = this.props;
    const skillData = skills ? skills.data : []; // Provide a default empty array if skills.data is undefined

    return (
      <div>
        {skillData.map((skill, i) => (
          <div key={i} className="skills-div">
            <Fade right duration={1000}>
              <h1 className="skills-heading" style={{ color: theme.text }}>
                {skill.title}
              </h1>
            </Fade>
            <div className="skills-subcategory-wrapper skills-subcategory-wrapper-responsive">
              {skill.categories &&
                skill.categories.map((category, index) => (
                  <div key={index} className="skills-subcategory-container skills-subcategory-container-responsive">
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

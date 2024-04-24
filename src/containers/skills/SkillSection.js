import React, { Component } from "react";
import "./Skills.css";
import SoftwareSkill from "../../components/softwareSkills/SoftwareSkill";
import { skills } from "../../portfolio";
import { Fade } from "react-reveal";
import DataScienceImg from "./DataScienceImg";
import FullStackImg from "./FullStackImg";
import CloudInfraImg from "./CloudInfraImg";
import DesignImg from "./DesignImg";

function GetSkillSvg(props) {
  if (props.fileName === "DataScienceImg")
    return <DataScienceImg theme={props.theme} />;
  else if (props.fileName === "FullStackImg")
    return <FullStackImg theme={props.theme} />;
  else if (props.fileName === "CloudInfraImg")
    return <CloudInfraImg theme={props.theme} />;
  return <DesignImg theme={props.theme} />;
}

class SkillSection extends Component {
  render() {
    const theme = this.props.theme;
    return (
      <div>
        {skills.data.map((skill, i) => {
          return (
            <div key={i} className="skills-main-div">
              <Fade left duration={2000}>
                <div className="skills-image-div">
                  <GetSkillSvg fileName={skill.fileName} theme={theme} />
                </div>
              </Fade>
  
              <div className="skills-text-div">
                <Fade right duration={1000}>
                  <h1 className="skills-heading" style={{ color: theme.text }}>
                    {skill.title}
                  </h1>
                </Fade>
                {skill.categories ? skill.categories.map((category, index) => (
                  <div key={index}>
                    <div className="skills-subcategory-container">
                      <Fade right duration={1500}>
                        <h2 className="skills-subheading" style={{ color: theme.text }}>
                          {category.categoryTitle}
                        </h2>
                        <SoftwareSkill logos={category.softwareSkills} />
                      </Fade>
                    </div>
                    <div className="skills-subcategory-container">
                      <Fade right duration={1500}>
                        <h2 className="skills-subheading" style={{ color: theme.text }}>
                          {category.categoryTitle}
                        </h2>
                        <SoftwareSkill logos={category.softwareSkills} />
                      </Fade>
                      <Fade right duration={2000}>
                        <div>
                          {category.skills.map((skillSentence, idx) => (
                            <p
                              key={idx}
                              className="subTitle skills-text"
                              style={{ color: theme.secondaryText }}
                            >
                              {skillSentence}
                            </p>
                          ))}
                        </div>
                      </Fade>
                    </div>
                  </div>
                )) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default SkillSection;

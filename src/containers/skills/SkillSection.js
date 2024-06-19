import React from 'react';
import SoftwareSkill from "../../components/softwareSkills/SoftwareSkill";
import { skills } from "../../portfolio";
import "./Skills.css";
import { useSpring, animated } from 'react-spring';

function SkillSection({ theme }) {
  const skillData = skills ? skills.data : []; // Provide a default empty array if skills.data is undefined

  const fadeRight = useSpring({
    from: { opacity: 0, transform: 'translateX(100px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    config: { duration: 1000 }
  });

  return (
    <div>
      {skillData.map((skill, i) => (
        <div key={i} className="skills-div">
          <animated.div style={fadeRight}>
            <h1 className="skills-heading" style={{ color: theme.text }}>
              {skill.title}
            </h1>
          </animated.div>
          <div className="skills-subcategory-wrapper skills-subcategory-wrapper-responsive">
            {skill.categories &&
              skill.categories.map((category, index) => (
                <div key={index} className="skills-subcategory-container skills-subcategory-container-responsive">
                  <animated.div style={fadeRight}>
                    <h2 className="skills-subheading" style={{ color: theme.text }}>
                      {category.categoryTitle}
                    </h2>
                    <SoftwareSkill logos={category.softwareSkills} />
                    {category.skills &&
                      category.skills.map((skillSentence, idx) => (
                        <p key={idx} className="subTitle skills-text" style={{ color: theme.secondaryText }}>
                          {skillSentence}
                        </p>
                      ))}
                  </animated.div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkillSection;
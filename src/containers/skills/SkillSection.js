import React from "react";
import { Typography, Box, Paper } from "@mui/material";
import { useSpring, animated, useTrail } from "react-spring";
import SoftwareSkill from "../../components/softwareSkills/SoftwareSkill";
import { skills } from "../../portfolio";
import "./Skills.css";

const AnimatedBox = animated(Box);
const AnimatedPaper = animated(Paper);

function SkillSection() {
  const skillData = skills?.data || [];

  const fadeIn = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 1000 },
  });

  // Using useTrail instead of individual springs for staggered animation
  const trail = useTrail(skillData.length, {
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 800 },
  });

  return (
    <Box className="skills-container">
      {trail.map((props, i) => (
        <Box key={i} sx={{ mb: 6 }}>
          <AnimatedBox style={fadeIn}>
            <Typography
              variant="h3"
              className="skills-section-title"
              gutterBottom
            >
              {skillData[i].title}
            </Typography>
          </AnimatedBox>

          <Box className="skills-category-grid">
            {skillData[i].categories?.map((category, index) => (
              <AnimatedPaper
                key={index}
                style={{
                  ...props,
                  delay: 200 * index,
                }}
                className="skill-category-card"
                elevation={3}
              >
                <Typography variant="h5" className="category-title">
                  {category.categoryTitle}
                </Typography>

                <SoftwareSkill logos={category.softwareSkills} />

                <Box className="skills-list">
                  {category.skills?.map((skillSentence, idx) => (
                    <Typography
                      key={idx}
                      variant="body1"
                      className="skill-item"
                    >
                      {skillSentence}
                    </Typography>
                  ))}
                </Box>
              </AnimatedPaper>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default SkillSection;

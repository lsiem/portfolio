import React from "react";
import { Typography, Box, Paper, useTheme } from "@mui/material";
import { useSpring, animated, useTrail, SpringValue } from "react-spring";
import SoftwareSkill from "../../components/softwareSkills/SoftwareSkill";
import { skills } from "../../portfolio";
import { SkillData } from "../../types/portfolio";
import "./Skills.css";

interface AnimatedStyles {
  opacity: SpringValue<number>;
  transform: SpringValue<string>;
}

const AnimatedBox = animated(Box);
const AnimatedPaper = animated(Paper);

const SkillSection: React.FC = () => {
  const theme = useTheme();
  const skillData: SkillData[] = skills?.data || [];

  const fadeIn = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 1000 },
  }) as AnimatedStyles;

  const trail = useTrail(skillData.length, {
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 800 },
  }) as AnimatedStyles[];

  return (
    <Box className="skills-container">
      {trail.map((props, i) => (
        <Box key={i} sx={{ mb: 6 }}>
          <AnimatedBox style={fadeIn}>
            <Typography
              variant="h3"
              className="skills-section-title"
              color="text.primary"
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
                  opacity: props.opacity,
                  transform: props.transform,
                  transition: `all ${800}ms ease-out ${index * 200}ms`,
                }}
                className="skill-category-card"
                elevation={3}
                sx={{
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography
                  variant="h5"
                  className="category-title"
                  color="text.primary"
                >
                  {category.categoryTitle}
                </Typography>

                <SoftwareSkill logos={category.softwareSkills} />

                <Box className="skills-list">
                  {category.skills?.map((skillSentence, idx) => (
                    <Typography
                      key={idx}
                      variant="body1"
                      className="skill-item"
                      color="text.secondary"
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
};

export default SkillSection;

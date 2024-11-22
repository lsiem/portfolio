import React from "react";
import { Typography, Container, Box } from "@mui/material";
import { useSpring, animated, SpringValue } from "react-spring";
import SkillSection from "./SkillSection";

interface AnimatedStyles {
  opacity: SpringValue<number>;
  transform: SpringValue<string>;
}

const AnimatedBox = animated(Box);

const Skills: React.FC = () => {
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 2000 },
  }) as AnimatedStyles;

  return (
    <Container sx={{ mt: 4 }}>
      <AnimatedBox style={fadeAndSlide}>
        <Typography variant="h4" gutterBottom>
          Meine Fähigkeiten
        </Typography>
      </AnimatedBox>
      <SkillSection />
    </Container>
  );
};

export default Skills;

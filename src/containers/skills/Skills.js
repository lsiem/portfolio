import React from "react";
import { Typography, Container, Box } from "@mui/material";
import { useSpring, animated } from "react-spring";
import SkillSection from "./SkillSection";

const AnimatedBox = animated(Box);

export default function Skills() {
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 2000 },
  });

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
}

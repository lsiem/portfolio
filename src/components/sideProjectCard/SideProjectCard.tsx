import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { useSpring, animated, SpringValue } from "react-spring";
import ProjectLanguages from "../projectLanguages/ProjectLanguages";

interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

interface SideProjectCardProps {
  project: Project;
}

interface AnimatedStyles {
  opacity: SpringValue<number>;
  transform: SpringValue<string>;
}

const AnimatedCard = animated(Card);

const SideProjectCard: React.FC<SideProjectCardProps> = ({ project }) => {
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 1000 },
  }) as AnimatedStyles;

  return (
    <AnimatedCard style={fadeAndSlide} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {project.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {project.description}
        </Typography>
        <Box mt={2}>
          <ProjectLanguages logos={project.technologies} />
        </Box>
      </CardContent>
    </AnimatedCard>
  );
};

export default SideProjectCard;

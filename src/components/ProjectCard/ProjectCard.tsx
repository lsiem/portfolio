import React from "react";
import { Card, CardContent, Typography, Box, Link } from "@mui/material";
import { useSpring, animated, SpringValue } from "react-spring";

interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

interface ProjectCardProps {
  project: Project;
}

interface AnimatedStyles {
  opacity: SpringValue<number>;
  transform: SpringValue<string>;
}

const AnimatedCard = animated(Card);

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
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
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {project.technologies.map((tech, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {tech}
            </Typography>
          ))}
        </Box>
        {project.link && (
          <Link
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ textDecoration: "none" }}
          >
            Projekt ansehen
          </Link>
        )}
      </CardContent>
    </AnimatedCard>
  );
};

export default ProjectCard;

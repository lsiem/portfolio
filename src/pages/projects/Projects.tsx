import React from "react";
import { Container, Typography } from "@mui/material";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import { projects } from "../../portfolio";
import "./Projects.css";

const Projects: React.FC = () => {
  return (
    <Container maxWidth="lg" className="projects-container">
      <Typography variant="h2" className="projects-title" gutterBottom>
        Referenzen
      </Typography>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </Container>
  );
};

export default Projects;

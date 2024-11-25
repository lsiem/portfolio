import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { about, experience } from "../../portfolio";
import ExperienceAccordion from "../../containers/experienceAccordion/ExperienceAccordion";
import type { ExperienceSection } from "../../types/portfolio";
import "./About.css";

const About: React.FC = () => {
  return (
    <Container maxWidth="lg" className="about-container">
      <Typography variant="h2" className="about-title" gutterBottom>
        {about.title}
      </Typography>

      <Box className="about-content">
        <Typography variant="body1" paragraph>
          {about.description}
        </Typography>

        {/* Experience Title */}
        <Typography variant="h3" gutterBottom sx={{ mt: 4 }}>
          {experience.title}
        </Typography>

        {/* Experience Description */}
        <Typography variant="body1" paragraph>
          {experience.description}
        </Typography>

        {/* Experience Sections */}
        <ExperienceAccordion sections={experience.sections} />
      </Box>
    </Container>
  );
};

export default About;

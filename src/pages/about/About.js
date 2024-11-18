import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { about } from "../../portfolio";
import "./About.css";

function About() {
  return (
    <Container maxWidth="lg" className="about-container">
      <Typography variant="h2" className="about-title" gutterBottom>
        Über mich
      </Typography>
      <Box className="about-content">
        <Typography variant="body1" paragraph>
          {about.description}
        </Typography>
      </Box>
    </Container>
  );
}

export default About;

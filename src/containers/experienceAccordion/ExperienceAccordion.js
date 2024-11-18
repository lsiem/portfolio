import React from "react";
import ExperienceCard from "../../components/experienceCard/ExperienceCard";
import { Container, Typography } from "@mui/material";

const ExperienceAccordion = ({ sections }) => {
  return (
    <Container sx={{ marginTop: 4 }}>
      {sections.map((section, index) => (
        <div key={index}>
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            {section.title}
          </Typography>
          {section.experiences.map((experience, idx) => (
            <ExperienceCard key={idx} experience={experience} />
          ))}
        </div>
      ))}
    </Container>
  );
};

export default ExperienceAccordion;

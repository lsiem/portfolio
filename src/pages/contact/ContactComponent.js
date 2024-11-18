import React from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import { useSpring, animated } from "react-spring";
import { socialMediaLinks } from "../../portfolio";
import "./ContactComponent.css";

const AnimatedBox = animated(Box);

function ContactComponent() {
  const fadeIn = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 1000 },
  });

  return (
    <Container maxWidth="lg" className="contact-container">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          minHeight: "100vh",
          py: 4,
        }}
      >
        {/* Left side - Profile Image */}
        <Box sx={{ flex: 1 }}>
          <div className="profile-image-container">
            <img
              src="https://lsiem.de/lasse_profile.webp"
              alt="Lasse Siemoneit"
              className="profile-image"
            />
          </div>
        </Box>

        {/* Right side - Contact Info */}
        <AnimatedBox style={fadeIn} sx={{ flex: 1, textAlign: "center" }}>
          <Typography variant="h2" className="contact-title" gutterBottom>
            Kontaktiere mich
          </Typography>

          <Typography variant="h6" className="contact-subtitle" sx={{ mb: 4 }}>
            Interessiert an meiner Arbeit? Ich freue mich auf deine
            Kontaktaufnahme für einen persönlichen Austausch.
          </Typography>

          <Box className="social-links" sx={{ mb: 4 }}>
            <a
              href={socialMediaLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon github"
            >
              <i className="fab fa-github"></i>
            </a>
            <a
              href={socialMediaLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon linkedin"
            >
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a
              href={`mailto:${socialMediaLinks.gmail}`}
              className="social-icon google"
            >
              <i className="fab fa-google"></i>
            </a>
            <a
              href={socialMediaLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </Box>

          <Button
            variant="contained"
            className="resume-button"
            href="/path/to/your/resume.pdf"
            target="_blank"
          >
            Zu meinem Lebenslauf
          </Button>
        </AnimatedBox>
      </Box>
    </Container>
  );
}

export default ContactComponent;

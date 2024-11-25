import React from "react";
import { Box, Typography, Container, Link } from "@mui/material";
import "./Contact.css";
import SocialMedia from "../../components/socialMedia/SocialMedia";
import { contactPageData, socialMediaLinks } from "../../portfolio";

const Contact: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        minHeight: "100vh",
        pt: 4,
        pb: 8,
      }}
    >
      <Container className="contact-margin-top" id="contact">
        <Box className="contact-div-main">
          <Box className="contact-header">
            <Typography
              variant="h1"
              className="contact-title"
              color="text.primary"
            >
              {contactPageData.contactSection.title}
            </Typography>
            <Typography
              variant="subtitle1"
              className="contact-subtitle"
              color="text.secondary"
            >
              {contactPageData.contactSection.description}
            </Typography>

            <Box className="contact-text-div">
              <Link
                href={`mailto:${socialMediaLinks.gmail}`}
                className="contact-detail-email"
                sx={{
                  color: "text.secondary",
                  textDecoration: "none",
                  "&:hover": {
                    color: "text.primary",
                    textShadow: (theme) =>
                      `2px 1px 2px ${theme.palette.mode === "light" ? "#b5b5b5" : "#000000"}`,
                  },
                }}
              >
                {socialMediaLinks.gmail}
              </Link>
              <br />
              <br />
              <SocialMedia />
            </Box>
          </Box>
          <Box className="contact-image-div">
            <img
              alt="Contact Mail"
              src={require("../../assets/images/contactMail.png")}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Contact;

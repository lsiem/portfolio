import React from "react";
import { Box, Typography, Container, Link } from "@mui/material";
import styled from "@emotion/styled";
import { Theme } from "@mui/material/styles";
import SocialMedia from "../../components/socialMedia/SocialMedia";
import { contactPageData, socialMediaLinks } from "../../portfolio";

const PageWrapper = styled(Box)`
  background-color: ${({ theme }) =>
    (theme as Theme).palette.background.default};
  min-height: 100vh;
  padding-top: ${({ theme }) => (theme as Theme).spacing(4)};
  padding-bottom: ${({ theme }) => (theme as Theme).spacing(8)};
`;

const ContactContainer = styled(Container)`
  margin-top: ${({ theme }) => (theme as Theme).spacing(4)};
`;

const ContactMain = styled(Box)`
  display: flex;
  > * {
    flex: 1;
  }

  @media (max-width: 1380px), (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ContactHeader = styled(Box)``;

const ContactTitle = styled(Typography)`
  font-size: 65px;
  font-weight: 400;

  @media (max-width: 1380px), (max-width: 768px) {
    font-size: 40px;
    text-align: center;
  }
`;

const ContactSubtitle = styled(Typography)`
  text-transform: uppercase;

  @media (max-width: 1380px), (max-width: 768px) {
    font-size: 16px;
    line-height: normal;
    text-align: center;
  }
`;

const ContactTextDiv = styled(Box)`
  margin-top: 1.5rem;

  @media (max-width: 1380px), (max-width: 768px) {
    text-align: center;
  }
`;

const EmailLink = styled(Link)`
  font-size: 40px;
  font-weight: 400;
  text-decoration: none;
  color: ${({ theme }) => (theme as Theme).palette.text.secondary};

  &:hover {
    color: ${({ theme }) => (theme as Theme).palette.text.primary};
    text-shadow: ${({ theme }) =>
      `2px 1px 2px ${
        (theme as Theme).palette.mode === "light" ? "#b5b5b5" : "#000000"
      }`};
  }

  @media (max-width: 1380px), (max-width: 768px) {
    font-size: 20px;
  }
`;

const ImageContainer = styled(Box)`
  img {
    max-width: 100%;
    height: auto;
    margin-left: 1.5rem;
    margin-top: -4rem;
  }

  @media (max-width: 1380px), (max-width: 768px) {
    display: none;
  }
`;

const Contact: React.FC = () => {
  return (
    <PageWrapper>
      <ContactContainer id="contact">
        <ContactMain>
          <ContactHeader>
            <ContactTitle variant="h1" color="text.primary">
              {contactPageData.contactSection.title}
            </ContactTitle>
            <ContactSubtitle variant="subtitle1" color="text.secondary">
              {contactPageData.contactSection.description}
            </ContactSubtitle>

            <ContactTextDiv>
              <EmailLink href={`mailto:${socialMediaLinks.gmail}`}>
                {socialMediaLinks.gmail}
              </EmailLink>
              <br />
              <br />
              <SocialMedia />
            </ContactTextDiv>
          </ContactHeader>
          <ImageContainer>
            <img
              alt="Contact Mail"
              src={require("../../assets/images/contactMail.png")}
            />
          </ImageContainer>
        </ContactMain>
      </ContactContainer>
    </PageWrapper>
  );
};

export default Contact;

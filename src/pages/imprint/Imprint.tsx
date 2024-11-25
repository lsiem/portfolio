import React from "react";
import { Container, Typography, Box } from "@mui/material";
import styled from "@emotion/styled";
import { Theme } from "@mui/material/styles";

const PageContainer = styled(Container)`
  padding-top: ${({ theme }) => (theme as Theme).spacing(8)};
  padding-bottom: ${({ theme }) => (theme as Theme).spacing(8)};
`;

const ContentBox = styled(Box)`
  background-color: ${({ theme }) => (theme as Theme).palette.background.paper};
  padding: ${({ theme }) => (theme as Theme).spacing(4)};
  border-radius: ${({ theme }) => (theme as Theme).shape.borderRadius * 2}px;
`;

const Title = styled(Typography)`
  color: ${({ theme }) => (theme as Theme).palette.text.primary};
`;

const SectionTitle = styled(Typography)`
  color: ${({ theme }) => (theme as Theme).palette.text.primary};
`;

const ContentText = styled(Typography)`
  color: ${({ theme }) => (theme as Theme).palette.text.primary};
  margin-top: ${({ theme }) => (theme as Theme).spacing(4)};
`;

const ResponsibleText = styled(Typography)`
  color: ${({ theme }) => (theme as Theme).palette.text.primary};
  margin-top: ${({ theme }) => (theme as Theme).spacing(4)};
  font-size: 1.2rem;
`;

const Imprint: React.FC = () => {
  return (
    <PageContainer maxWidth="md">
      <Title variant="h2" gutterBottom>
        Impressum
      </Title>
      <ContentBox>
        <SectionTitle variant="h5" gutterBottom>
          Angaben gemäß § 5 TMG
        </SectionTitle>
        <ContentText variant="body1" gutterBottom>
          Lasse Siemoneit
          <br />
          Schäferkampsallee 61
          <br />
          20357 Hamburg
        </ContentText>
        <ContentText variant="body1" gutterBottom>
          E-Mail: info@lassesiemoneit.de
        </ContentText>
        <ResponsibleText variant="body1">
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
          <br />
          Lasse Siemoneit
          <br />
          Schäferkampsallee 61
          <br />
          20357 Hamburg
        </ResponsibleText>
      </ContentBox>
    </PageContainer>
  );
};

export default Imprint;

import React from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import { useSpring, animated, SpringValue } from "react-spring";
import styled from "@emotion/styled";
import { Theme } from "@mui/material/styles";
import SocialMedia from "../../components/socialMedia/SocialMedia";

interface AnimatedStyles {
  opacity: SpringValue<number>;
  transform: SpringValue<string>;
}

const AnimatedBox = animated(Box);

// Styled components
const StyledContainer = styled(Container)`
  min-height: 100vh;
`;

const AnimatedContent = styled(AnimatedBox)`
  min-height: 100vh;
  display: flex;
  align-items: center;
`;

const Title = styled(Typography)`
  color: ${({ theme }) => (theme as Theme).palette.text.primary};
  font-weight: bold;
  margin-bottom: ${({ theme }) => (theme as Theme).spacing(3)};
`;

const Subtitle = styled(Typography)`
  color: ${({ theme }) => (theme as Theme).palette.text.secondary};
  margin-bottom: ${({ theme }) => (theme as Theme).spacing(4)};
  line-height: 1.4;
`;

const SocialMediaWrapper = styled(Box)`
  margin-bottom: ${({ theme }) => (theme as Theme).spacing(4)};
`;

const Greeting: React.FC = () => {
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: "translateY(40px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 2000 },
  }) as AnimatedStyles;

  return (
    <StyledContainer maxWidth="lg">
      <AnimatedContent style={fadeAndSlide}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Title variant="h2">Hi, ich bin Lasse</Title>
            <Subtitle variant="h4">
              Ich bin ein selbsterlerneter und passionierter Full-Stack Software
              Entwickler mit einem Fokus auf die Entwicklung von Web- und
              Hybrid-Apps.
            </Subtitle>
            <SocialMediaWrapper>
              <SocialMedia />
            </SocialMediaWrapper>
          </Grid>
        </Grid>
      </AnimatedContent>
    </StyledContainer>
  );
};

export default Greeting;

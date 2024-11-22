import React from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import { useSpring, animated, SpringValue } from "react-spring";
import SocialMedia from "../../components/socialMedia/SocialMedia";

interface AnimatedStyles {
  opacity: SpringValue<number>;
  transform: SpringValue<string>;
}

const AnimatedBox = animated(Box);

const Greeting: React.FC = () => {
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: "translateY(40px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 2000 },
  }) as AnimatedStyles;

  return (
    <Container maxWidth="lg">
      <AnimatedBox
        style={fadeAndSlide}
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              sx={{
                color: "grey.300",
                fontWeight: "bold",
                mb: 3,
              }}
            >
              Hi, ich bin Lasse
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: "grey.400",
                mb: 4,
                lineHeight: 1.4,
              }}
            >
              Ich bin ein selbsterlerneter und passionierter Full-Stack Software
              Entwickler mit einem Fokus auf die Entwicklung von Web- und
              Hybrid-Apps.
            </Typography>
            <Box sx={{ mb: 4 }}>
              <SocialMedia />
            </Box>
          </Grid>
        </Grid>
      </AnimatedBox>
    </Container>
  );
};

export default Greeting;

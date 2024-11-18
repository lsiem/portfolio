import React from "react";
import {
  Typography,
  Button,
  Grid,
  Box,
  Container,
  useTheme,
} from "@mui/material";
import { useSpring, animated } from "react-spring";
import SocialMedia from "../../components/socialMedia/SocialMedia";
import { greeting } from "../../portfolio";
import homeImage from "../../assets/images/home_image.png";

const AnimatedBox = animated(Box);

export default function Greeting() {
  const theme = useTheme();
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: "translateY(40px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 2000 },
  });

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
            <Box>
              <Button
                variant="contained"
                color="primary"
                href="#contact"
                sx={{
                  mr: 2,
                  bgcolor: "purple.main",
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Kontaktiere mich
              </Button>
              <Button
                variant="outlined"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  color: "grey.300",
                  borderColor: "grey.300",
                }}
                href={greeting.resumeLink}
                target="_blank"
              >
                Zu meinem Lebenslauf
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={homeImage}
              alt="Developer illustration"
              sx={{
                width: "100%",
                maxWidth: 600,
                height: "auto",
              }}
            />
          </Grid>
        </Grid>
      </AnimatedBox>
    </Container>
  );
}

import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { useSpring, animated, SpringValue } from "react-spring";

interface AnimatedStyles {
  opacity: SpringValue<number>;
  transform: SpringValue<string>;
}

const AnimatedBox = animated(Box);

const Imprint: React.FC = () => {
  const fadeIn = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 1000 },
  }) as AnimatedStyles;

  return (
    <Container maxWidth="lg" sx={{ pt: 12, pb: 6 }}>
      <AnimatedBox style={fadeIn}>
        <Typography variant="h2" gutterBottom sx={{ color: "grey.300" }}>
          Impressum
        </Typography>

        <Box sx={{ bgcolor: "background.paper", p: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ color: "grey.300" }}>
            Angaben gemäß § 5 TMG
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ color: "text.secondary" }}
          >
            Lasse Siemoneit
            <br />
            Vechtaer Straße 25
            <br />
            26197 Großenkneten
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "grey.300", mt: 4 }}
          >
            Kontakt
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ color: "text.secondary" }}
          >
            Telefon: +49 (0) 176 81 36 51 82
            <br />
            E-Mail: info@lsiem.de
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "grey.300", mt: 4 }}
          >
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ color: "text.secondary" }}
          >
            Lasse Siemoneit
            <br />
            Vechtaer Straße 25
            <br />
            26197 Großenkneten
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "grey.300", mt: 4 }}
          >
            Haftungsausschluss
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ color: "text.secondary" }}
          >
            Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt
            erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der
            Inhalte können wir jedoch keine Gewähr übernehmen.
          </Typography>
        </Box>
      </AnimatedBox>
    </Container>
  );
};

export default Imprint;

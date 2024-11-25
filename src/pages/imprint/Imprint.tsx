import React from "react";
import { Container, Typography, Box } from "@mui/material";

const Imprint: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h2" gutterBottom sx={{ color: "text.primary" }}>
        Impressum
      </Typography>
      <Box sx={{ bgcolor: "background.paper", p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ color: "text.primary" }}>
          Angaben gemäß § 5 TMG
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ color: "text.primary", mt: 4 }}
        >
          Lasse Siemoneit
          <br />
          Schäferkampsallee 61
          <br />
          20357 Hamburg
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ color: "text.primary", mt: 4 }}
        >
          E-Mail: info@lassesiemoneit.de
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: "1.2rem",
            color: "text.primary",
            mt: 4,
          }}
        >
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
          <br />
          Lasse Siemoneit
          <br />
          Schäferkampsallee 61
          <br />
          20357 Hamburg
        </Typography>
      </Box>
    </Container>
  );
};

export default Imprint;

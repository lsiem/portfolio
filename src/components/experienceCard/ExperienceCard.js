import React from "react";
import { Card, CardContent, Typography, Box, Avatar } from "@mui/material";
import { useSpring, animated } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AnimatedCard = animated(Card);

const ExperienceCard = ({ experience }) => {
  const fadeAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(40px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 2000 },
  });

  return (
    <AnimatedCard style={fadeAnimation} sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
            <FontAwesomeIcon icon={experience.fontAwesomeClassname} />
          </Avatar>
          <Box>
            <Typography variant="h6">{experience.title}</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {experience.company} • {experience.duration}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {experience.description}
        </Typography>
      </CardContent>
    </AnimatedCard>
  );
};

export default ExperienceCard;

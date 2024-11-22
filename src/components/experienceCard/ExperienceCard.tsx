import React from "react";
import { Card, CardContent, Typography, Box, Avatar } from "@mui/material";
import { useSpring, animated, SpringValue } from "react-spring";
import WorkIcon from '@mui/icons-material/Work';

interface Experience {
  title: string;
  company: string;
  company_url: string;
  logo_path: string;
  duration: string;
  location: string;
  description: string;
  color?: string;
}

interface ExperienceCardProps {
  experience: Experience;
}

interface AnimatedStyles {
  opacity: SpringValue<number>;
  transform: SpringValue<string>;
}

const AnimatedCard = animated(Card);

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience }) => {
  const fadeAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(40px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 2000 },
  }) as AnimatedStyles;

  return (
    <AnimatedCard style={fadeAnimation} sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            sx={{ 
              bgcolor: experience.color || "primary.main", 
              mr: 2 
            }}
          >
            <WorkIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">{experience.title}</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {experience.company} • {experience.duration}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {experience.location}
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

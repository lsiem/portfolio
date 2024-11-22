import React from "react";
import MuiButton from "@mui/material/Button";

interface CustomButtonProps {
  text: string;
  href: string;
  newTab?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ text, href, newTab }) => {
  return (
    <MuiButton
      variant="contained"
      color="primary"
      href={href}
      target={newTab ? "_blank" : "_self"}
      rel={newTab ? "noopener noreferrer" : undefined}
    >
      {text}
    </MuiButton>
  );
};

export default CustomButton;

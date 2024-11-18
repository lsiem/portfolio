import React from "react";
import Button from "@mui/material/Button";

export default function CustomButton({ text, href, newTab }) {
  return (
    <Button
      variant="contained"
      color="primary"
      href={href}
      target={newTab ? "_blank" : "_self"}
    >
      {text}
    </Button>
  );
}

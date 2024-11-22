import React, { useCallback } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Home from "../pages/home/HomeComponent";
import Splash from "../pages/splash/Splash";
import Experience from "../pages/experience/Experience";
import Contact from "../pages/contact/ContactComponent";
import Error404 from "../pages/errors/error404/Error";
import { settings } from "../portfolio";

const Main: React.FC = () => {
  const theme = useTheme();

  const handleThemeToggle = useCallback(() => {
    // Theme toggle logic will be implemented here
    console.log("Theme toggle clicked");
  }, []);

  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route 
          path="/" 
          element={settings.isSplash ? <Splash /> : <Home />} 
        />
        <Route 
          path="/home" 
          element={<Home />} 
        />
        <Route 
          path="/experience" 
          element={<Experience theme={theme} onToggle={handleThemeToggle} />} 
        />
        <Route 
          path="/contact" 
          element={<Contact />} 
        />
        {settings.isSplash && (
          <Route 
            path="/splash" 
            element={<Splash />} 
          />
        )}
        <Route 
          path="*" 
          element={<Error404 theme={theme} />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Main;

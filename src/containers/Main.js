import React from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Home from "../pages/home/HomeComponent";
import Splash from "../pages/splash/Splash";
import Experience from "../pages/experience/Experience";
import Contact from "../pages/contact/ContactComponent";
import Error404 from "../pages/errors/error404/Error";
import { settings } from "../portfolio";

export default function Main() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={settings.isSplash ? <Splash /> : <Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/contact" element={<Contact />} />
        {settings.isSplash && <Route path="/splash" element={<Splash />} />}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  );
}

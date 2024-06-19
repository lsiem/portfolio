import React, { Component } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Home from "../pages/home/HomeComponent";
import Splash from "../pages/splash/Splash";
import Experience from "../pages/experience/Experience";
import Contact from "../pages/contact/ContactComponent";
import { settings } from "../portfolio.js";
import Error404 from "../pages/errors/error404/Error";

export default class Main extends Component {
  render() {
    return (
      <BrowserRouter basename="/">
        <Routes>
          <Route
            path="/"
            element={
              settings.isSplash ? (
                <Splash theme={this.props.theme} />
              ) : (
                <Home theme={this.props.theme} />
              )
            }
          />
          <Route
            path="/home"
            element={<Home theme={this.props.theme} />}
          />
          <Route
            path="/experience"
            element={<Experience theme={this.props.theme} />}
          />
          <Route
            path="/contact"
            element={<Contact theme={this.props.theme} />}
          />
          {settings.isSplash && (
            <Route
              path="/splash"
              element={<Splash theme={this.props.theme} />}
            />
          )}
          <Route
            path="*"
            element={<Error404 theme={this.props.theme} />}
          />
        </Routes>
      </BrowserRouter>
    );
  }
}

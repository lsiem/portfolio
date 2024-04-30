import React from "react";
import "./LoaderLogo.css";
import bannerAnimation from "../../assets/images/banner_animation.gif";

class LogoLoader extends React.Component {
  render() {
    return (
      <div className="loader-container">
        <img src={bannerAnimation} alt="Loading..." />
      </div>
    );
  }
}

export default LogoLoader;

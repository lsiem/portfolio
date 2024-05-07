import React from "react";
import bannerAnimation from "../../assets/images/banner_animation.gif";

// noinspection JSValidateTypes
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

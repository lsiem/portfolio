import React from "react";
import bannerAnimation from "../../assets/images/banner_animation.gif";

function LoaderLogo() {
  return (
    <div className="loader-container">
      <img src={bannerAnimation} alt="Loading..." style={{ width: '100%', height: 'auto' }} />
    </div>
  );
}

export default LoaderLogo;

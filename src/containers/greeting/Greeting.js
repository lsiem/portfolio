import React from "react";
import "./Greeting.css";
import SocialMedia from "../../components/socialMedia/SocialMedia";
import Button from "../../components/button/Button";
import { greeting } from "../../portfolio";
import homeImage from "../../assets/images/home_image.png";
import { useSpring, animated } from 'react-spring';

export default function Greeting({ theme }) {
  const fadeAndSlide = useSpring({
    from: { opacity: 0, transform: 'translateY(40px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 2000 }
  });

  return (
    <animated.div style={fadeAndSlide} className="greet-main" id="greeting">
      <div className="greeting-main">
        <div className="greeting-text-div">
          <div>
            <h1 className="greeting-text" style={{ color: theme.text }}>
              {greeting.title}
            </h1>
            {greeting.nickname && (
              <h2 className="greeting-nickname" style={{ color: theme.text }}>
                ( {greeting.nickname} )
              </h2>
            )}
            <p
              className="greeting-text-p subTitle"
              style={{ color: theme.secondaryText }}
            >
              {greeting.subTitle}
            </p>
            <SocialMedia theme={theme} />
            <div className="button-greeting-div">
              <Button text="Kontaktiere mich" href="#contact" />
              <Button
                text="Zu meinem Lebenslauf"
                theme={theme}
                newTab={true}
                href={greeting.resumeLink}
              />
            </div>
          </div>
        </div>
        <div className="greeting-image-div">
          <img alt="men sitting on table" src={homeImage} />
        </div>
      </div>
    </animated.div>
  );
}

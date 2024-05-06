import React from "react";
import "./SocialMedia.css";
import { socialMediaLinks } from "../../portfolio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";

library.add(fab);

export default function SocialMedia(props) {
  return (
    <div className="social-media-div">
      {socialMediaLinks.map((media, i) => {
        return (
          <a
            key={i}
            href={media.link}
            className="icon-button"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              "--background-color": media.backgroundColor,
              "--hover-background-color": props.theme.text,
            }}
          >
            <div className="icon-wrapper">
              <FontAwesomeIcon icon={media.fontAwesomeIcon} />
            </div>
          </a>
        );
      })}
    </div>
  );
}

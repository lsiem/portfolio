import React from "react";
import "./Contact.css";
import SocialMedia from "../../components/socialMedia/SocialMedia";
import { contactPageData, socialMediaLinks } from "../../portfolio";

const Contact: React.FC = () => {
  return (
    <div className="main contact-margin-top" id="contact">
      <div className="contact-div-main">
        <div className="contact-header">
          <h1 className="heading contact-title">
            {contactPageData.contactSection.title}
          </h1>
          <p className="subTitle contact-subtitle">
            {contactPageData.contactSection.description}
          </p>

          <div className="contact-text-div">
            <a
              className="contact-detail-email"
              href={`mailto:${socialMediaLinks.gmail}`}
            >
              {socialMediaLinks.gmail}
            </a>
            <br />
            <br />
            <SocialMedia />
          </div>
        </div>
        <div className="contact-image-div">
          <img
            alt="Contact Mail"
            src={require("../../assets/images/contactMail.png")}
          />
        </div>
      </div>
    </div>
  );
};

export default Contact;

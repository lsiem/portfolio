import React from 'react';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import SocialMedia from "../../components/socialMedia/SocialMedia";
import Button from "../../components/button/Button";
import BlogsImg from "./BlogsImg";
import { useSpring, animated } from 'react-spring';
import "./ContactComponent.css";
import { greeting, contactPageData } from "../../portfolio.js";

const ContactData = contactPageData.contactSection;
const blogSection = contactPageData.blogSection;

function Contact({ theme, onToggle }) {
  const fadeEffect = useSpring({
    from: { opacity: 0, transform: 'translateY(40px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 1000 }
  });

  return (
    <div className="contact-main">
      <Header theme={theme} />
      <div className="basic-contact">
        <animated.div style={fadeEffect} className="contact-heading-div">
          <div className="contact-heading-img-div">
            <img
              src={require(`../../assets/images/${ContactData["profile_image_path"]}`)}
              alt=""
            />
          </div>
          <div className="contact-heading-text-div">
            <h1 className="contact-heading-text" style={{ color: theme.text }}>
              {ContactData["title"]}
            </h1>
            <p className="contact-header-detail-text subTitle" style={{ color: theme.secondaryText }}>
              {ContactData["description"]}
            </p>
            <SocialMedia theme={theme} />
            <div className="resume-btn-div">
              <Button
                text="Zu meinem Lebenslauf"
                newTab={true}
                href={greeting.resumeLink}
                theme={theme}
              />
            </div>
          </div>
        </animated.div>
        <animated.div style={fadeEffect} className="blog-heading-div">
          <div className="blog-heading-text-div">
            <h1 className="blog-heading-text" style={{ color: theme.text }}>
              {blogSection["title"]}
            </h1>
            <p className="blog-header-detail-text subTitle" style={{ color: theme.secondaryText }}>
              {blogSection["subtitle"]}
            </p>
            <div className="blogsite-btn-div">
              <Button
                text="Zu meinen Blogs"
                newTab={true}
                href={blogSection.link}
                theme={theme}
              />
            </div>
          </div>
          <div className="blog-heading-img-div">
            <BlogsImg theme={theme} />
          </div>
        </animated.div>
      </div>
      <Footer theme={theme} onToggle={onToggle} />
      <TopButton theme={theme} />
    </div>
  );
}

export default Contact;
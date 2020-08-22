import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <div id="footer-container">
      <div id="security" className="footer-div">
        <Link to="./privacy" className="footer-link">
          Privacy Policy
        </Link>
        <Link to="./termsAndConditions" className="footer-link">
          Termini e Condizioni
        </Link>
      </div>
      <div id="contacts" className="footer-div">
        <div id="phone-container" className="footer-div-container">
          <i id="footer-mobile" className="fas fa-mobile-alt footer-ico"></i>
          <span id="phone" className="contacts-div">
            +39 3206265132
          </span>
        </div>
        <div id="email-container" className="footer-div-container">
          <i className="far fa-envelope footer-ico"></i>
          <a href="mailto: libridoo.contacts@gmail.com">
            libridoo.contacts@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;

import React from "react";
import mainLogo from "../../images/home-image.jpg";
import "./HeaderPart.css";

const HeaderPart = ({ title }) => {
  return (
    <div id="hi">
      <p id="hi-title">{title}</p>
      <img id="hi-image" src={mainLogo} alt="logo" />
    </div>
  );
};

export default HeaderPart;

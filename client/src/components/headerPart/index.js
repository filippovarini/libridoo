import React from "react";
import mainLogo from "../../images/home-image.jpg";
import "./HeaderPart.css";

const HeaderPart = ({ title }) => {
  return (
    // <div id={`${mainClass}-image-container`}>
    <div id="hi">
      {/* <p id={`${headerClass}fake-header`}>{title}</p> */}
      <p id="hi-title">{title}</p>
      <img id="hi-image" src={mainLogo} alt="logo" />
    </div>
  );
};

export default HeaderPart;

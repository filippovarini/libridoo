import React from "react";
import mainLogo from "../../images/logo-long.png";
import "./HeaderPart.css";

const HeaderPart = ({
  title,
  mainClass = "deals",
  imageId = "libridoo-logo-image",
  headerClass
}) => {
  return (
    <div id={`${mainClass}-image-container`}>
      <p id={`${headerClass}fake-header`}>{title}</p>
      <img id={imageId} src={mainLogo} alt="logo" />
    </div>
  );
};

export default HeaderPart;

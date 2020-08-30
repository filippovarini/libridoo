import React from "react";
import "./adImageOne.css";
import imageSrc from "../../images/ad-3.png";

const AdImageThree = () => {
  return (
    <div className="adImage-container">
      <img src={imageSrc} alt="advertising" className="adImage" />
    </div>
  );
};

export default AdImageThree;

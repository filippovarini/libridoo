import React from "react";
import "./adImageOne.css";
import imageSrc from "../../images/ad-1.jpg";

const AdImageOne = () => {
  return (
    <div className="adImage-container">
      <img src={imageSrc} alt="advertising" className="adImage" />
    </div>
  );
};

export default AdImageOne;

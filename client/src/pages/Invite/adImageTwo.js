import React from "react";
import "./adImageOne.css";
import imageSrc from "../../images/ad-2.jpg";

const AdImageTwo = () => {
  return (
    <div className="adImage-container">
      <img src={imageSrc} alt="advertising" className="adImage" />
    </div>
  );
};

export default AdImageTwo;

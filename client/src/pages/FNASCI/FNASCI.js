import React, { Component } from "react";
import image from "../../images/nascilogo.png";
import "./FNASCI.css";

class FNASCI extends Component {
  render() {
    return (
      <div id="fn-container">
        <img id="fn-image" src={image} alt="logo" />
        <p id="fn-shit">Stiamo facendo magie....</p>
      </div>
    );
  }
}

export default FNASCI;

import React, { Component } from "react";
import image from "../../images/nascilogo.png";
import "./FNASCI.css";

class FNASCI extends Component {
  state = {
    class: "hidden"
  };
  render() {
    return (
      <div id="fn-container">
        <img
          onLoad={() => this.setState({ class: null })}
          className={this.state.class}
          id="fn-image"
          src={image}
          alt="logo"
        />
        <p id="fn-shit">Stiamo facendo magie....</p>
      </div>
    );
  }
}

export default FNASCI;

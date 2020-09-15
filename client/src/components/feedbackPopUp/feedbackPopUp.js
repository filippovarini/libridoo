import React, { Component } from "react";
import "./feedbackPopUp.css";

class FeedbackPopUp extends Component {
  render() {
    const firstRating = (
      <div id="fpu-container">
        <p id="fpu-header">
          Ciao
          {this.props.user.name
            ? ` ${this.props.user.name.split(" ")[0]}!`
            : "!"}
          , ti piace libridoo?
        </p>
      </div>
    );

    const body = firstRating;
    return body;
  }
}

export default FeedbackPopUp;

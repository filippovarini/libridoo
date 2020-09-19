import React, { Component } from "react";

class Stars extends Component {
  render() {
    return (
      <div id="stars">
        <i
          className={`fa${
            Math.round(this.props.rating) >= 1 ? "s" : "r"
          } fa-star`}
        ></i>
        <i
          className={`fa${
            Math.round(this.props.rating) >= 2 ? "s" : "r"
          } fa-star`}
        ></i>
        <i
          className={`fa${
            Math.round(this.props.rating) >= 3 ? "s" : "r"
          } fa-star`}
        ></i>
        <i
          className={`fa${
            Math.round(this.props.rating) >= 4 ? "s" : "r"
          } fa-star`}
        ></i>
        <i
          className={`fa${
            Math.round(this.props.rating) === 5 ? "s" : "r"
          } fa-star`}
        ></i>
      </div>
    );
  }
}

export default Stars;

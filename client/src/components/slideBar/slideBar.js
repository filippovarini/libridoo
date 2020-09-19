import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import "./slideBar.css";

class slideBar extends Component {
  render() {
    let display = this.props.hidden ? "hidden" : null;
    if (this.props.hiderSlidebar) display = "hidden";
    if (this.props.fromHomeHeader && window.pageYOffset > 60) {
      display = "hidden";
      console.log("ok");
    }
    const slideBar = (
      <div
        id="slideBar"
        className={display}
        onMouseLeave={this.props.toggleSlideBar}
      >
        <div id="slideBar-components-container">
          <NavLink
            to="/account"
            className="slideBar-component hover"
            onClick={this.props.hideSlidebar}
          >
            ACCOUNT
          </NavLink>
          <NavLink
            to="/orders"
            className="slideBar-component hover"
            onClick={this.props.hideSlidebar}
          >
            I MIEI ORDINI
          </NavLink>
          <NavLink
            to="/deals"
            className="slideBar-component hover"
            onClick={this.props.hideSlidebar}
          >
            I MIEI AFFARI
          </NavLink>
          <div id="earn-suggester-container" onClick={this.props.hideSlidebar}>
            <NavLink
              id="earn-suggester-link"
              to="/invite"
              className="slideBar-component hover"
            >
              GUADAGNA CON NOI{" "}
            </NavLink>
            <i id="earn-suggester" className="fas fa-circle"></i>
          </div>

          {/* <NavLink to="/feedback" className="slideBar-component hover">
              DICCI COSA PENSI
            </NavLink> */}
          <span
            className="slideBar-component hover"
            onClick={this.props.handleLogout}
          >
            LOGOUT
          </span>
        </div>
        <div id="slideBar-name-container" className="slidebar-footer">
          <span id="name">
            {this.props.user.name
              ? this.props.user.name.length > 35
                ? this.props.user.name.split(" ")[0]
                : this.props.user.name
              : "Libridoo"}
          </span>
        </div>
      </div>
    );

    return slideBar;
  }
}

export default slideBar;

import React, { Component } from "react";
import { NavLink, Link } from "react-router-dom";
import "./slideBar.css";

class slideBar extends Component {
  render() {
    let display = this.props.hidden ? "hidden" : null;
    let slideBar = (
      <div
        id="slideBar"
        className={display}
        onMouseLeave={this.props.toggleSlideBar}
      >
        <div id="slideBar-components-container">
          <NavLink to="/invite" className="slideBar-component hover">
            GUADAGNA CON NOI
          </NavLink>
          <div id="earn-suggester-container">
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
        </div>
        <Link to="/login" className="slidebar-footer hover">
          Login
        </Link>
      </div>
    );
    if (this.props.user.name) {
      slideBar = (
        <div
          id="slideBar"
          className={display}
          onMouseLeave={this.props.toggleSlideBar}
        >
          <div id="slideBar-components-container">
            <NavLink to="/account" className="slideBar-component hover">
              ACCOUNT
            </NavLink>
            <NavLink to="/orders" className="slideBar-component hover">
              I MIEI ORDINI
            </NavLink>
            <NavLink to="/deals" className="slideBar-component hover">
              I MIEI AFFARI
            </NavLink>
            <div id="earn-suggester-container">
              <NavLink
                id="earn-suggester-link"
                to="/invite"
                className="slideBar-component hover"
              >
                GUADAGNA CON NOI{" "}
              </NavLink>
              <i id="earn-suggester" className="fas fa-circle"></i>
            </div>
            <NavLink to="/help" className="slideBar-component hover">
              COME FUNZIONA
            </NavLink>
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
            <span id="name" className="hover">
              {this.props.user.name}
            </span>
          </div>
        </div>
      );
    }
    return slideBar;
  }
}

export default slideBar;

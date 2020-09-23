import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import "./slideBar.css";
import { connect } from "react-redux";

class SlideBar extends Component {
  state = {
    stripeLoading: false
  };

  stripeDashboard = () => {
    fetch(`/api/payment/dashboard/${this.props.user.payOut.accountId}`)
      .then(res => res.json())
      .then(jsonRes => {
        if (jsonRes.code === 0) window.location = jsonRes.link.url;
        else {
          // error
          this.props.dispatch({
            type: "E-SET",
            error: {
              frontendPlace: "slidebar/stripeDashboard/catch",
              jsonRes,
              message:
                "Qualcosa è andato storto nel setup della console pagamenti. Riprova più tardi"
            }
          });
          this.props.history.push("/error");
        }
      })
      .catch(error => {
        // store and redirect
        this.props.dispatch({
          type: "E-SET",
          error: {
            frontendPlace: "slidebar/stripeDashboard/catch",
            error,
            message:
              "Qualcosa è andato storto nel setup della console pagamenti. Riprova più tardi"
          }
        });
        this.props.history.push("/error");
      });
  };

  render() {
    let display = this.props.hidden ? "hidden" : null;
    if (this.props.hiderSlidebar) display = "hidden";
    if (this.props.fromHomeHeader && window.pageYOffset > 60) {
      display = "hidden";
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
          <p
            className={`slideBar-component hover ${
              this.props.user.payOut
                ? this.props.user.payOut.type === "stripe"
                  ? null
                  : "hidden"
                : "hidden"
            }`}
            onClick={this.stripeDashboard}
          >
            PAGAMENTI
          </p>
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

export default connect()(SlideBar);

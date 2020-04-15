import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./userInfo.css";

// userId / user / hidden / display / toggleDisplay()
class UserInfo extends Component {
  state = {
    firstStar: "r",
    secondStar: "r",
    thirdStar: "r",
    fourthStar: "r",
    fifthStar: "r",
    set: false,
    updated: false,
    starsDisplay: null
  };

  componentDidMount = () => {
    fetch(`/api/user/rating/${this.props.userId}`)
      .then(res => res.json())
      .then(jsonRes => {
        if (jsonRes.code === 1) {
          // error
          this.props.dispatch({
            type: "E-SET",
            error: {
              frontendPlace: "userInfo/componentDidMount/code1",
              jsonRes
            }
          });
          this.props.history.push("/error");
        } else {
          if (jsonRes.code === 1.5) {
            // no user, probabliy deleted
            this.setState({ set: true, starsDisplay: "hidden" });
          } else {
            // correct
            let avg = jsonRes.rating;
            if (!avg) {
              this.setState({ starsDisplay: "hidden" });
            }
            if (avg >= 1) {
              this.setState({ firstStar: "s" });
            }
            if (avg >= 2) {
              this.setState({ secondStar: "s" });
            }
            if (avg >= 3) {
              this.setState({ thirdStar: "s" });
            }
            if (avg >= 4) {
              this.setState({ fourthStar: "s" });
            }
            if (avg === 5) {
              this.setState({ fifthStar: "s" });
            }
            this.setState({ set: true });
          }
        }
      })
      .catch(error => {
        console.log(error);
        this.props.dispatch({
          type: "E-SET",
          error: { frontendPlace: "userInfo/componentDidMount/catch" }
        });
        this.props.history.push("/error");
      });
  };

  render() {
    return (
      <div id="userInfo-container" className={this.props.display}>
        <div id="userInfo">
          <p id="userInfo-delete" onClick={this.props.toggleDisplay}>
            -
          </p>
          <div id="userInfo-image-container" className="userInfo-container">
            <img
              src={this.props.user.avatarImgURL}
              alt="user avatar"
              id="userInfo-avatar-image"
            />
          </div>
          <div className="userInfo-container" id="userInfo-name-container">
            <p id="userInfo-name">
              {this.props.hidden
                ? this.props.user.name.split(" ")[0]
                : this.props.user.name}
            </p>
          </div>
          <div
            id="userInfo-rating-container"
            className={`userInfo-container ${this.state.starsDisplay}`}
          >
            <i
              id="userInfo-first"
              className={`fa${this.state.firstStar} fa-star fa-1x`}
            ></i>
            <i
              id="userInfo-second"
              className={`fa${this.state.secondStar} fa-star fa-1x`}
            ></i>
            <i
              id="userInfo-third"
              className={`fa${this.state.thirdStar} fa-star fa-1x`}
            ></i>
            <i
              id="userInfo-fourt"
              className={`fa${this.state.fourthStar} fa-star fa-1x`}
            ></i>
            <i
              id="userInfo-fifth"
              className={`fa${this.state.fifthStar} fa-star fa-1x`}
            ></i>
          </div>
          <div
            className={`userInfo-container ${
              this.props.hidden ? "lower" : null
            }`}
            id="userInfo-info-gContainer"
          >
            <div
              id="userInfo-email-container"
              className={`userInfo-info-container ${
                this.props.hidden ? "hidden" : ""
              }`}
            >
              <i id="email-ico" className="fas fa-at userInfo-info-ico "></i>
              <span id="email-info" className="userInfo-info-text">
                {this.props.user.email}
              </span>
            </div>
            <div
              id="phone-container"
              className={`userInfo-info-container ${
                this.props.hidden ? "hidden" : ""
              }`}
            >
              <i
                id="phone-ico"
                className="fas fa-mobile-alt userInfo-info-ico"
              ></i>
              <span id="phone-text" className="userInfo-info-text">
                {this.props.user.phone}
              </span>
            </div>
            <div id="place-container" className="userInfo-info-container">
              <i id="place-ico" className="fas fa-home userInfo-info-ico"></i>
              <span id="place-text" className="userInfo-info-text">
                {this.props.user.place
                  ? `${this.props.user.place.city}, ${this.props.user.place.region}, ${this.props.user.place.country}`
                  : this.props.place
                  ? `${this.props.place.city}, ${this.props.place.region}, ${this.props.place.country}`
                  : null}
              </span>
            </div>
            <div id="school-container" className="userInfo-info-container">
              <i
                id="school-ico"
                className="fas fa-graduation-cap userInfo-info-ico"
              ></i>
              <span id="school-text" className="userInfo-info-text">
                {this.props.user.school}
              </span>
            </div>
          </div>
          <div id="userInfo-schoolLogo-container">
            <img
              id="userInfo-schoolLogo"
              src={this.props.user.schoolLogoURL}
              alt="school logo"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(withRouter(UserInfo));

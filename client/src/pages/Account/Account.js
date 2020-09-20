import React, { Component } from "react";
import { connect } from "react-redux";
import "./Account.css";

// components
import BodyInfo from "../../components/Infos/bodyInfo/bodyInfo";
import DeliveryInfo from "../../components/Infos/deliveryInfo/deliveryInfo";
import PasswordInfo from "../../components/Infos/passwordInfo/passwordInfo";
import PlaceInfo from "../../components/Infos/placeInfo/placeInfo";
import PayOutInfo from "../../components/Infos/payOutInfo/payOutInfo";
import Stars from "../../components/stars/stars";

class Account extends Component {
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
    if (!localStorage.getItem("JWT") && !sessionStorage.getItem("JWT")) {
      this.props.history.push("/");
    }
  };

  render() {
    return (
      <div id="account-gContainer">
        <div id="avatarImg-container">
          <img id="avatarImg" src={this.props.user.avatarImgURL} alt="avatar" />
        </div>
        <p id="name">{this.props.user.name}</p>
        <div id="ratings-container">
          <div
            id="quality"
            className={`rating-container ${
              this.props.user.rating ? null : "hidden"
            }`}
          >
            <p className="rating-header">QUALITÀ</p>
            <div className="stars-container">
              <Stars
                rating={
                  this.props.user.rating
                    ? this.props.user.rating.qualityAverage
                    : 0
                }
              />
              <p className="rating-average">
                {this.props.user.rating
                  ? Math.round(this.props.user.rating.qualityAverage * 10) / 10
                  : null}
              </p>
            </div>
          </div>
          <div
            id="delivery"
            className={`rating-container ${
              this.props.user.rating ? null : "hidden"
            }`}
          >
            <p className="rating-header">CONSEGNA</p>
            <div className="stars-container">
              <Stars
                rating={
                  this.props.user.rating
                    ? this.props.user.rating.deliveryAverage
                    : 0
                }
              />
              <p className="rating-average">
                {this.props.user.rating
                  ? Math.round(this.props.user.rating.deliveryAverage * 10) / 10
                  : null}
              </p>
            </div>
          </div>
        </div>
        <PayOutInfo />
        <PlaceInfo />
        <BodyInfo />
        <DeliveryInfo />
        <PasswordInfo />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps)(Account);

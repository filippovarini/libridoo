import React, { Component } from "react";
import { connect } from "react-redux";
import "./Account.css";

// components
import BodyInfo from "../../components/Infos/bodyInfo/bodyInfo";
import DeliveryInfo from "../../components/Infos/deliveryInfo/deliveryInfo";
import PasswordInfo from "../../components/Infos/passwordInfo/passwordInfo";
import PlaceInfo from "../../components/Infos/placeInfo/placeInfo";

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
    } else {
      if (this.props.user.DeliveryInfo) {
        let avg = this.props.user.rating.average;
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
  };

  componentDidUpdate = () => {
    if (this.state.updated) {
      if (!localStorage.getItem("JWT") && !sessionStorage.getItem("JWT")) {
        this.props.history.push("/");
      } else if (!this.state.set) {
        if (this.props.user.DeliveryInfo) {
          let avg = this.props.user.rating.average;
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
    } else {
      this.setState({ updated: true });
    }
  };

  render() {
    return (
      <div id="account-gContainer">
        <div id="avatarImg-container">
          <img
            id="avatarImg"
            src="https://scontent-fco1-1.xx.fbcdn.net/v/t1.0-9/55822168_1355705201259453_1842124246487138304_n.jpg?_nc_cat=100&_nc_sid=85a577&_nc_ohc=r4iDfEzSkZAAX9NUgx7&_nc_ht=scontent-fco1-1.xx&oh=910142c0ef27ba00e78883c66a5fb64a&oe=5EA37D2D"
            alt="avatar"
          />
        </div>
        <p id="name">{this.props.user.name}</p>
        <div id="rating" className={this.state.starsDisplay}>
          <i
            id="first"
            className={`fa${this.state.firstStar} fa-star fa-2x`}
          ></i>
          <i
            id="second"
            className={`fa${this.state.secondStar} fa-star fa-2x`}
          ></i>
          <i
            id="third"
            className={`fa${this.state.thirdStar} fa-star fa-2x`}
          ></i>
          <i
            id="fourt"
            className={`fa${this.state.fourthStar} fa-star fa-2x`}
          ></i>
          <i
            id="fifth"
            className={`fa${this.state.fifthStar} fa-star fa-2x`}
          ></i>
        </div>
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

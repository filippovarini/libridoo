import React, { Component } from "react";
import { connect } from "react-redux";
import "./buyReview.css";

// components
import PlaceInfo from "../../../components/Infos/placeInfo/placeInfo";
class buyReview extends Component {
  state = {
    updated: false
  };
  componentDidMount = () => {
    if (!sessionStorage.getItem("JWT") || !localStorage.getItem("JWT")) {
      this.props.history.push("/");
    }
    this.setState({ updated: false });
  };

  componentDidUpdate = () => {
    if (this.props.user.place) {
      if (this.props.user.place.city && !this.state.updated) {
        //   done --> redirect
        this.props.history.push("/search");
        this.setState({ updated: true });
      }
    }
  };

  render() {
    return (
      <div id="infoReview-buy">
        <div>
          <p id="header-review">Compila le informazioni per continuare</p>
          <div id="info-container">
            <PlaceInfo />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { user: state.user };
};

export default connect(mapStateToProps)(buyReview);

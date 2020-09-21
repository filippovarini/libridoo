import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./ratingPopUp.css";

import LoadingM from "../Loading/loading_m";
import RatingStar from "../stars/ratingStars";

// user: { name / _id } / toggleDisplay / display
class RatingPopUp extends Component {
  state = {
    delivery1: "r",
    delivery2: "r",
    delivery3: "r",
    delivery4: "r",
    delivery5: "r",
    quality1: "r",
    quality2: "r",
    quality3: "r",
    quality4: "r",
    quality5: "r",
    loading: false,
    deliveryRating: 0,
    qualityRating: 0,
    suggest: null
  };

  handleStarLeave = (number, type) => {
    this.setState({
      [`${type}1`]: "r",
      [`${type}2`]: "r",
      [`${type}3`]: "r",
      [`${type}4`]: "r",
      [`${type}5`]: "r"
    });
  };

  handleStarOver = (number, type) => {
    this.setState({
      [`${type}1`]: number >= 1 ? "s" : "r",
      [`${type}2`]: number >= 2 ? "s" : "r",
      [`${type}3`]: number >= 3 ? "s" : "r",
      [`${type}4`]: number >= 4 ? "s" : "r",
      [`${type}5`]: number === 5 ? "s" : "r"
    });
  };

  handleRatingConfirm = (number, type) => {
    let canSend = false;
    let body = {};
    if (type === "libridoo") {
      if (this.state.deliveryRating && this.state.qualityRating) {
        canSend = true;
        body = {
          qualityRating: this.state.qualityRating,
          deliveryRating: this.state.deliveryRating,
          libridoo: number
        };
      } else {
        this.setState({ suggest: number });
      }
    } else {
      this.setState({
        [`${type}Rating`]: number
      });
      if (
        type === "delivery" &&
        this.state.suggest &&
        this.state.qualityRating
      ) {
        canSend = true;
        body = {
          qualityRating: this.state.qualityRating,
          deliveryRating: number,
          libridoo: this.state.suggest
        };
      } else if (
        type === "quality" &&
        this.state.suggest &&
        this.state.deliveryRating
      ) {
        canSend = true;
        body = {
          qualityRating: number,
          deliveryRating: this.state.deliveryRating,
          libridoo: this.state.suggest
        };
      }
    }

    if (canSend) {
      this.setState({ loading: true });
      fetch("/api/user/ratingUpdate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ ...body, _id: "5e79de62892bc21bc92dbf20" })
      })
        .then(res => res.json())
        .then(jsonRes => {
          //   even if errors, don't care
          this.setState({ loading: false });
          this.props.toggleDisplay();
        })
        .catch(error => {
          console.log(error);
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "ratingPopUp/handleRatingConfirm/catch" }
          });
          this.props.history.push("/error");
        });
    }
  };

  render() {
    const loaded = (
      <div id="ratingPopUp">
        <i
          className="fas fa-times"
          id="ratingPopUp-delete"
          onClick={this.props.toggleDisplay}
        ></i>
        <p id="ratingPopUp-header">
          VALUTA {this.props.user ? this.props.user.name : " il tuo venditore"}
        </p>
        <div id="g-rating-stars">
          <div className="rating-stars">
            <p className="rating-header">QUALITÀ AFFIDABILE</p>
            <RatingStar
              handleStarOver={this.handleStarOver}
              handleStarLeave={this.handleStarLeave}
              handleRatingConfirm={this.handleRatingConfirm}
              firstStar={this.state.quality1}
              secondStar={this.state.quality2}
              thirdStar={this.state.quality3}
              fourthStar={this.state.quality4}
              fifthStar={this.state.quality5}
              type="quality"
              rating={this.state.qualityRating}
            />
          </div>
          <div className="rating-stars">
            <p className="rating-header">CONSEGNA ED INCONTRO</p>
            <RatingStar
              handleStarOver={this.handleStarOver}
              handleStarLeave={this.handleStarLeave}
              handleRatingConfirm={this.handleRatingConfirm}
              firstStar={this.state.delivery1}
              secondStar={this.state.delivery2}
              thirdStar={this.state.delivery3}
              fourthStar={this.state.delivery4}
              fifthStar={this.state.delivery5}
              type="delivery"
              rating={this.state.deliveryRating}
            />
          </div>
        </div>
        <div id="lr">
          <p id="lr-header">Consiglieresti Libridoo?</p>
          <div id="lr-choices">
            <p
              id="c1"
              className={`${
                this.state.suggest === "SI" ? "clicked" : null
              } choice`}
              onClick={() => this.handleRatingConfirm("SI", "libridoo")}
            >
              SI
            </p>
            <p
              id="c2"
              className={`${
                this.state.suggest === "NO" ? "clicked" : null
              } choice`}
              onClick={() => this.handleRatingConfirm("NO", "libridoo")}
            >
              NO
            </p>
          </div>
        </div>
      </div>
    );

    const loading = (
      <div id="ratingPopUp" className="rating-loading">
        <LoadingM />
      </div>
    );

    const body = this.state.loading ? loading : loaded;

    return (
      <div id="ratingPopUp-container" className={this.props.display}>
        {body}
      </div>
    );
  }
}

export default connect()(withRouter(RatingPopUp));

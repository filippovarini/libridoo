import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./ratingPopUp.css";

// user: { name / _id } / toggleDisplay / display
class RatingPopUp extends Component {
  state = {
    "1Star": "r",
    "2Star": "r",
    "3Star": "r",
    "4Star": "r",
    "5Star": "r"
  };

  handleStarLeave = () => {
    this.setState({
      "1Star": "r",
      "2Star": "r",
      "3Star": "r",
      "4Star": "r",
      "5Star": "r"
    });
  };

  handleStarOver = e => {
    for (let i = Number(e.target.id); i--; i > 0) {
      this.setState({
        [`${i + 1}Star`]: "s"
      });
    }
  };

  handleRatingConfirm = rate => {
    fetch("/api/user/ratingUpdate", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ _id: this.props.user._id, rating: rate })
    })
      .then(res => res.json())
      .then(jsonRes => {
        //   even if errors, don't care
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
  };

  render() {
    return (
      <div id="ratingPopUp-container" className={this.props.display}>
        <div id="ratingPopUp">
          <p id="ratingPopUp-delete" onClick={this.props.toggleDisplay}>
            -
          </p>
          <p id="ratingPopUp-header">
            Come è stato il servizio offerto da{" "}
            {this.props.user ? this.props.user.name : "il tuo venditore"}?
          </p>
          <div id="ratingPopUp-stars-container">
            <i
              onMouseOver={this.handleStarOver}
              onTouchStart={this.handleStarOver}
              onMouseLeave={this.handleStarLeave}
              onTouchEnd={this.handleStarLeave}
              onClick={() => {
                this.handleRatingConfirm(1);
              }}
              id="1"
              className={`fa${this.state["1Star"]} fa-star `}
            ></i>
            <i
              onMouseOver={this.handleStarOver}
              onTouchStart={this.handleStarOver}
              onMouseLeave={this.handleStarLeave}
              onTouchEnd={this.handleStarLeave}
              onClick={() => {
                this.handleRatingConfirm(2);
              }}
              id="2"
              className={`fa${this.state["2Star"]} fa-star `}
            ></i>
            <i
              onMouseOver={this.handleStarOver}
              onTouchStart={this.handleStarOver}
              onMouseLeave={this.handleStarLeave}
              onTouchEnd={this.handleStarLeave}
              onClick={() => {
                this.handleRatingConfirm(3);
              }}
              id="3"
              className={`fa${this.state["3Star"]} fa-star `}
            ></i>
            <i
              onMouseOver={this.handleStarOver}
              onTouchStart={this.handleStarOver}
              onMouseLeave={this.handleStarLeave}
              onTouchEnd={this.handleStarLeave}
              onClick={() => {
                this.handleRatingConfirm(4);
              }}
              id="4"
              className={`fa${this.state["4Star"]} fa-star `}
            ></i>
            <i
              onMouseOver={this.handleStarOver}
              onTouchStart={this.handleStarOver}
              onMouseLeave={this.handleStarLeave}
              onTouchEnd={this.handleStarLeave}
              onClick={() => {
                this.handleRatingConfirm(5);
              }}
              id="5"
              className={`fa${this.state["5Star"]} fa-star `}
            ></i>
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(withRouter(RatingPopUp));

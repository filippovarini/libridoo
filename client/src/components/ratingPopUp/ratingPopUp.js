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
    "5Star": "r",
    loading: false
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
    this.setState({ loading: true });
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
  };

  render() {
    const loaded = (
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
    );

    const loading = (
      <div id="ratingPopUp" className="rating-loading">
        <div id="alfa" className="loadingio-spinner-fidget-spinner-rpnwi4xirv">
          <div className="ldio-xj4o7xwbsdb">
            <div>
              <div>
                <div style={{ left: "33.835px", top: "5.555px" }}></div>
                <div style={{ left: "9.595px", top: "47.47px" }}></div>
                <div style={{ left: "58.075px", top: "47.47px" }}></div>
              </div>
              <div>
                <div style={{ left: "43.935px", top: "15.655px" }}></div>
                <div style={{ left: "19.695px", top: "57.57px" }}></div>
                <div style={{ left: "68.175px", top: "57.57px" }}></div>
              </div>
              <div style={{ left: "33.835px", top: "33.835px" }}></div>
              <div>
                <div
                  style={{
                    left: "37.875px",
                    top: "30.3px",
                    transform: "rotate(-20deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "58.075px",
                    top: "30.3px",
                    transform: "rotate(20deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "29.29px",
                    top: "45.45px",
                    transform: "rotate(80deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "39.39px",
                    top: "62.115px",
                    transform: "rotate(40deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "66.66px",
                    top: "45.45px",
                    transform: "rotate(100deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "56.56px",
                    top: "62.115px",
                    transform: "rotate(140deg)"
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
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

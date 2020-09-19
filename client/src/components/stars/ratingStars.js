import React, { Component } from "react";

class RatingStar extends Component {
  render() {
    // console.log(this.props.secondStar);
    return (
      <div id="ratingPopUp-stars-container">
        <i
          onMouseOver={() => this.props.handleStarOver(1, this.props.type)}
          onMouseLeave={() => this.props.handleStarLeave(1, this.props.type)}
          onClick={() => {
            this.props.handleRatingConfirm(1, this.props.type);
          }}
          id="1"
          className={`fa${
            this.props.rating >= 1 ? "s" : this.props.firstStar
          } fa-star `}
        ></i>
        <i
          onMouseOver={() => this.props.handleStarOver(2, this.props.type)}
          onMouseLeave={() => this.props.handleStarLeave(2, this.props.type)}
          onClick={() => {
            this.props.handleRatingConfirm(2, this.props.type);
          }}
          id="2"
          className={`fa${
            this.props.rating >= 2 ? "s" : this.props.secondStar
          } fa-star `}
        ></i>
        <i
          onMouseOver={() => this.props.handleStarOver(3, this.props.type)}
          onMouseLeave={() => this.props.handleStarLeave(3, this.props.type)}
          onClick={() => {
            this.props.handleRatingConfirm(3, this.props.type);
          }}
          id="3"
          className={`fa${
            this.props.rating >= 3 ? "s" : this.props.thirdStar
          } fa-star `}
        ></i>
        <i
          onMouseOver={() => this.props.handleStarOver(4, this.props.type)}
          onMouseLeave={() => this.props.handleStarLeave(4, this.props.type)}
          onClick={() => {
            this.props.handleRatingConfirm(4, this.props.type);
          }}
          id="4"
          className={`fa${
            this.props.rating >= 4 ? "s" : this.props.fourthStar
          } fa-star `}
        ></i>
        <i
          onMouseOver={() => this.props.handleStarOver(5, this.props.type)}
          onMouseLeave={() => this.props.handleStarLeave(5, this.props.type)}
          onClick={() => {
            this.props.handleRatingConfirm(5, this.props.type);
          }}
          id="5"
          className={`fa${
            this.props.rating === 5 ? "s" : this.props.fifthStar
          } fa-star `}
        ></i>
      </div>
    );
  }
}

export default RatingStar;

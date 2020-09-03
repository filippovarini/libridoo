import React, { Component } from "react";
import "./CheckoutReview.css";
import HeaderPart from "../../components/headerPart";
import ReviewBook from "../../components/reviewBook/reviewBook";

class CheckoutReview extends Component {
  componentDidMount = () => {
    if (!sessionStorage.getItem("searchParams")) {
      this.props.history.push("/search");
    } else {
      // something searched
      if (!sessionStorage.getItem("SBs")) {
        // nothing selected
        this.props.history.push("/results");
      } else {
        // both searched and book selected
        // if (!sessionStorage.getItem("JWT") && !localStorage.getItem("JWT")) {
        //   // not logged
        //   // login and then go back
        //   this.props.history.push("/login/buying");
        // }
      }
    }
  };
  render() {
    return (
      <div id="checkoutReview">
        <HeaderPart
          title="REVISIONE"
          mainClass={"checkout"}
          imageId="libridoo-logo-image"
          headerClass="checkout-"
        />
        <ReviewBook />
      </div>
    );
  }
}

export default CheckoutReview;

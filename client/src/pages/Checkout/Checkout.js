import React, { Component } from "react";
import { connect } from "react-redux";
import "./Checkout.css";

class Checkout extends Component {
  state = {
    palceEmpty: false,
    bodyInfoEmpty: false
  };
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
        if (Object.keys(this.props.user).length === 0) {
          // not logged
          // login and then go back
          this.props.history.push("/login/buying");
        } else {
          if (!this.props.user.place.city) {
            // logged, but no place
            this.setState({ palceEmpty: true });
          }
          if (!this.props.user.phone || !this.props.user.school) {
            // logged, but no phone or school
            this.setState({ bodyInfoEmpty: true });
          }
        }
      }
    }
  };

  componentDidUpdate = () => {
    //   reset search params and sbs on refresh
  };

  render() {
    console.log(this.state);
    return (
      <div id="checkout">
        <div id="checkout-header">
          <p id="checkout-header-container">Revisione Ordine</p>
        </div>
        <div id="selectedBooks-container">{/* formula map */}</div>
        <div id="info-review">{/* show info review if state.empty */}</div>
        <div id="bill-container">{/* bill */}</div>
        <div id="checkout-confirm">
          {/* alert "hai selezionato pure la consegna?" */}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    selectedBooks: state.selectedBooks,
    booksResult: state.booksResult
  };
};

export default connect(mapStateToProps)(Checkout);

import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./infoComponent.css";

// book / page / delivery
class InfoComponent extends Component {
  state = {
    imageClass: null,
    timeout: null
  };

  imageBigger = () => {
    this.setState({
      timeout: setInterval(() => {
        this.setState({ imageClass: "book-bigger" });
      }, 1500)
    });
  };

  imageSmaller = () => {
    clearTimeout(this.state.timeout);
    this.setState({ imageClass: null });
  };

  handleBookRemove = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Sei sicuro di voler rimuovere il libro dal carrello?")) {
      // remove sb from sessionStorage
      const SBs = JSON.parse(sessionStorage.getItem("SBs"));
      if (SBs.length === 1) {
        // just the book that is gonna be deleted
        sessionStorage.removeItem("SBs");
        this.props.history.push("/results");
      } else {
        const index = SBs.indexOf(this.props.book._id);
        SBs.splice(index, 1);
        sessionStorage.setItem("SBs", JSON.stringify(SBs));
      }
      this.props.dispatch({
        type: "SB-DELETE",
        clusterIndex: this.props.clusterIndex,
        bookIndex: this.props.index
      });
    }
  };

  render() {
    let price = this.props.book.price;
    if (String(price).indexOf(".") === -1) {
      // whole price
      price = `${price}.00`;
    } else {
      // decimal
      if (String(price).split(".")[1].length === 1) price = `${price}0`;
    }
    const checkoutBody = (
      <div id="infoContainer">
        <div id="title-container" className="info-container">
          <i className="fas fa-book info-book-ico"></i>
          <p id="title" className="info">
            {this.props.book.title}
          </p>
        </div>
        <div id="quality-container" className="info-container">
          <i className="fas fa-award info-book-ico"></i>
          <p id="quality" className="info">
            {this.props.book.quality}
          </p>
        </div>
        <div id="price-container" className="info-container">
          <i className="fas fa-euro-sign info-book-ico"></i>
          <p id="price" className="info">
            {/* {this.props.book.price} */}
            {price} €
          </p>
        </div>
        <div id="remove-container" className="info-container">
          <p id="remove" className="info" onClick={this.handleBookRemove}>
            Rimuovi
          </p>
        </div>
      </div>
    );

    const ordersBody = (
      <div id="infoContainer">
        <div id="title-container" className="info-container">
          <i className="fas fa-book info-book-ico"></i>
          <p id="title" className="info">
            {this.props.book.title}
          </p>
        </div>
        <div id="quality-container" className="info-container">
          <i className="fas fa-award info-book-ico"></i>
          <p id="quality" className="info">
            {this.props.book.quality}
          </p>
        </div>
        <div id="price-container" className="info-container">
          <i className="fas fa-euro-sign info-book-ico"></i>
          <p id="price" className="info">
            {/* {this.props.book.price} */}
            {price} €
            <span className={this.props.delivery.choosen ? null : "hidden"}>
              (+ {this.props.delivery.cost} euro di spedizione)
            </span>
          </p>
        </div>
        {/* <div id="remove-container" className="info-container">
        <p id="remove" className="info" onClick={this.handleBookRemove}>
          Rimuovi
        </p>
      </div> */}
      </div>
    );

    const dealsBody = (
      <div id="infoContainer">
        <div id="title-container" className="info-container">
          <i className="fas fa-book info-book-ico"></i>
          <p id="title" className="info">
            {this.props.book.title}
          </p>
        </div>
        <div id="quality-container" className="info-container">
          <i className="fas fa-award info-book-ico"></i>
          <p id="quality" className="info">
            {this.props.book.quality}
          </p>
        </div>
        <div id="price-container" className="info-container">
          <i className="fas fa-euro-sign info-book-ico"></i>
          <p id="price" className="info">
            {/* {this.props.book.price} */}
            {price} €
          </p>
        </div>
      </div>
    );

    let infoBody = null;
    switch (this.props.page) {
      case "checkout":
        infoBody = checkoutBody;
        break;
      case "orders":
        infoBody = ordersBody;
        break;
      case "deals":
        infoBody = dealsBody;
        break;
      default:
        break;
    }

    return (
      <div id="infoComponent">
        <div id="image-container" className={this.state.imageClass}>
          <img
            src={this.props.book.imageURL}
            id="image"
            alt="book cover"
            onMouseOver={this.imageBigger}
            onMouseLeave={this.imageSmaller}
          />
        </div>
        {infoBody}
      </div>
    );
  }
}

export default connect()(withRouter(InfoComponent));

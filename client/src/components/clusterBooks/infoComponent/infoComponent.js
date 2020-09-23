import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./infoComponent.css";

// book / page / delivery
class InfoComponent extends Component {
  state = {
    imageClass: null,
    timeout: null,
    spamHidden: true
  };

  spam = () => {
    fetch("/api/book/spam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ book: this.props.book })
    })
      .then(() => {
        this.setState({ spamHidden: true });
        alert(
          "Grazie per l'attenzione! Provvederemo subito a controllare il possibile spam."
        );
      })
      .catch(error => {
        console.log(error);
        this.setState({ spamHidden: true });
        alert(
          "Grazie per l'attenzione! Provvederemo subito a controllare il possibile spam."
        );
      });
  };

  toggleImage = () => {
    if (this.state.imageClass) this.setState({ imageClass: null });
    else this.setState({ imageClass: "book-bigger" });
  };

  imageSmaller = () => {
    clearTimeout(this.state.timeout);
    this.setState({ imageClass: null });
  };

  handleBookRemove = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Confermi di voler rimuovere il libro dal carrello?")) {
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
    //   get price .00
    const priceString = price => {
      if (String(price).indexOf(".") === -1) {
        // whole price
        return `${price}.00`;
      } else {
        // decimal
        if (String(price).split(".")[1].length === 1) return `${price}0`;
        else return price;
      }
    };

    const spam = (
      <div id="spam-container">
        <i
          className="fas fa-ellipsis-v"
          onClick={() => {
            this.setState({ spamHidden: !this.state.spamHidden });
          }}
        ></i>
        <div
          id="spam-container"
          onMouseLeave={() => this.setState({ spamHidden: true })}
        >
          <p
            className={`spam ${this.state.spamHidden ? "hidden" : null}`}
            onClick={this.spam}
          >
            SEGNALA SPAM
          </p>
          <p
            className={`spam second ${this.state.spamHidden ? "hidden" : null}`}
            onClick={this.handleBookRemove}
          >
            RIMUOVI
          </p>
        </div>
      </div>
    );

    const generalBody = (
      <div id="info-container" className="sub-container half">
        {this.props.page === "checkout" ? spam : null}
        <div id="contained">
          <p
            id="title"
            className={`info ${this.props.page !== "checkout" ? "wide" : null}`}
          >
            {this.props.book.title}
          </p>
          <div
            id="quality-container"
            className="info-container"
            onClick={this.generalClicked}
          >
            <i className="fas fa-award info-book-ico"></i>
            <p id="quality" className="info">
              {this.props.book.quality}
            </p>
          </div>
          <div id="price-container" className="info-container">
            <i className="fas fa-euro-sign info-book-ico fa-1x"></i>
            <p id="price" className="info">
              {priceString(this.props.book.price)}
              <span id="delivery-price">
                {this.props.page === "orders" && this.props.delivery.choosen
                  ? `+ ${this.props.delivery.cost} euro di spedizione`
                  : null}
              </span>
            </p>
          </div>
        </div>
      </div>
    );

    return (
      <div id="ic">
        <div id="container">
          <div
            id="image-container"
            className={`half sub-container ${this.state.imageClass}`}
          >
            <img
              src={this.props.book.imageURL}
              id="image"
              alt="book cover"
              onMouseLeave={this.imageSmaller}
            />
            <i
              className={`fas zoom-ico fa-search-${
                this.state.imageClass === "book-bigger" ? "minus" : "plus"
              }`}
              onClick={this.toggleImage}
            ></i>
          </div>
          {generalBody}
        </div>
        <div
          id="separator"
          className={
            this.props.index === this.props.maxLength - 1
              ? this.props.maxLength === 1
                ? null
                : "hidden"
              : null
          }
        ></div>
      </div>
    );
  }
}

export default connect()(withRouter(InfoComponent));

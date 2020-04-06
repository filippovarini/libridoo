import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./book.css";

class book extends Component {
  state = {
    imageClass: null,
    timeout: null,
    priceHover: false
  };

  priceHover = e => {
    this.setState({ priceHover: true });
  };

  priceAway = e => {
    this.setState({ priceHover: false });
  };

  imageBigger = e => {
    this.setState({
      timeout: setInterval(() => {
        this.setState({ imageClass: "result-bigger" });
      }, 1500)
    });
  };

  imageSmaller = () => {
    clearTimeout(this.state.timeout);
    this.setState({ imageClass: null });
  };

  addCart = () => {
    if (sessionStorage.getItem("SBs")) {
      // already added some
      const SBs = JSON.parse(sessionStorage.getItem("SBs"));
      SBs.push(this.props.book._id);
      sessionStorage.setItem("SBs", JSON.stringify(SBs));
    } else {
      // not added yet
      sessionStorage.setItem("SBs", JSON.stringify([this.props.book._id]));
    }
    this.props.dispatch({ type: "SB-PUSH", book: this.props.book });
    this.props.indexIncrease();
  };

  render() {
    let resultDelivery = null;
    if (this.props.user.place) {
      if (this.props.user.place.city) {
        let delivers = false;
        // logged
        switch (this.props.book.sellerUser.deliveryInfo.range) {
          case "NO":
            break;
          case "country":
            if (
              this.props.book.place.country === this.props.user.place.country
            ) {
              delivers = true;
            }
            break;

          case "region":
            if (this.props.book.place.region === this.props.user.place.region) {
              delivers = true;
            }
            break;

          case "city":
            if (this.props.book.place.city === this.props.user.place.city) {
              delivers = true;
            }
            break;
          default:
            break;
        }
        if (delivers) {
          resultDelivery = (
            <div id="result-delivery" className="delivery">
              <p className="delivery-header">Può spedirtelo</p>
            </div>
          );
        }
      }
    } else {
      // not logged
      let text = "";
      switch (this.props.book.sellerUser.deliveryInfo.range) {
        case "NO":
          break;
        case "country":
          text = `Spedisce in ${this.props.book.place.country}`;
          break;

        case "region":
          text = `Spedisce in zona ${this.props.book.place.region}`;
          break;

        case "city":
          text = `Spedisce in zona ${this.props.book.place.city}`;
          break;
        default:
          break;
      }
      if (text) {
        resultDelivery = (
          <div id="result-delivery" className="delivery">
            <p className="delivery-header">{text}</p>
          </div>
        );
      }
    }

    const notBoughtResultLowerIcon = this.state.priceHover ? (
      <div
        id="result-lower-icon-cart"
        onMouseLeave={this.priceAway}
        onClick={this.addCart}
        className="lowerIcon-container result-icon icon-container"
      >
        <i className="fas fa-cart-plus lower-icon book-icon"></i>
      </div>
    ) : (
      <div
        id="result-lower-icon"
        onMouseOver={this.priceHover}
        className="lowerIcon-container result-icon icon-container"
      >
        <span className="book-icon lower-icon span-icon">
          €{this.props.book.price}
        </span>
      </div>
    );

    const boughtResultLowerIcon = (
      <div
        id="result-lower-icon-bought"
        className="lowerIcon-container result-icon icon-container"
      >
        <i id="bought-icon" className="fas fa-check lower-icon book-icon"></i>
      </div>
    );

    // see if bought
    let bought = false;
    this.props.selectedBooks.forEach(cluster => {
      cluster.Books.forEach(book => {
        if (book._id === this.props.book._id) bought = true;
      });
    });

    const lowerIcon = bought ? boughtResultLowerIcon : notBoughtResultLowerIcon;

    let upperHeader = null;
    if (this.props.book.userSellsCount > 1) {
      upperHeader = (
        <div id="sells-count-container">
          <p id="sells-count">
            VENDE ALTRI{" "}
            <span id="number">
              {this.props.book.userSellsCount -
                1 /*ACTUALLY THIS SHOULD BE COUNTER : SELLS COUNT - ANY SELECTE BOOK SOLD BY HIM*/}{" "}
            </span>{" "}
            LIBRI CHE STAI CERCANDO
          </p>
        </div>
      );
    }

    const results = {
      infoContainer: (
        <div id="info-container" className="sub-container">
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
          <div id="place-container" className="info-container">
            <i className="fas fa-home fa-1x info-book-ico"></i>
            <p id="place" className="info">
              {this.props.book.place.city}, {this.props.book.sellerUser.school}
            </p>
          </div>
          <div id="timeToMeet-container" className="info-container">
            <i
              id="handshake"
              className="fas fa-handshake info-book-ico fa-1x"
            ></i>
            <p id="quality" className="info">
              Consegno in città entro{" "}
              {this.props.book.sellerUser.deliveryInfo.timeToMeet} giorni
            </p>
          </div>
        </div>
      ),
      delivery: resultDelivery,
      upperIcon: (
        <div
          id="result-upperIcon"
          className="upperIcon-container icon-container"
        >
          <i className="fas fa-address-card fa-1x upperIcon book-icon"></i>
        </div>
      ),
      lowerIcon,
      upperHeader
    };

    const page = results;

    return (
      <div id="book-container">
        <div id="book">
          {page.upperIcon}
          {page.lowerIcon}
          {page.upperHeader}
          <div id="general-container">
            <div
              id="image-container"
              className={`sub-container ${this.state.imageClass}`}
            >
              <img
                src={this.props.book.imageURL}
                id="image"
                alt="book cover"
                onMouseOver={this.imageBigger}
                onTouchStart={this.imageBigger}
                onMouseLeave={this.imageSmaller}
                onTouchEnd={this.imageSmaller}
              />
            </div>
            {page.infoContainer}
          </div>
          {page.delivery}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    selectedBooks: state.selectedBooks
  };
};

export default connect(mapStateToProps)(withRouter(book));

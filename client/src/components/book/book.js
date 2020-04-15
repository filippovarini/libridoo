import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import UserInfo from "../userInfo/userInfo";
import "./book.css";

class book extends Component {
  state = {
    imageClass: null,
    timeout: null,
    priceHover: false,
    userInfoHidden: true
  };

  toggleDisplay = () => {
    this.setState({
      userInfoHidden: !this.state.userInfoHidden
    });
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

  handleDelete = () => {
    fetch("/api/book/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ _id: this.props.book._id })
    })
      .then(res => res.json())
      .then(jsonRes => {
        if (jsonRes.code === 1.5) {
          alert("Libro già eliminato");
          window.location = "/deals";
        } else if (jsonRes.code === 1) {
          // error
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "Orders/book/handleDelete/code1", jsonRes }
          });
          this.props.history.push("/error");
        } else {
          // successful
          window.location = "/deals";
        }
      })
      .catch(error => {
        console.log(error);
        // error
        this.props.dispatch({
          type: "E-SET",
          error: { frontendPlace: "Orders/book/handleDelete/catch" }
        });
        this.props.history.push("/error");
      });
  };

  render() {
    let resultDelivery = null;
    if (this.props.user.place && this.props.user.place.city) {
      let delivers = false;
      // logged
      switch (this.props.book.sellerUser.deliveryInfo.range) {
        case "NO":
          break;
        case "country":
          if (this.props.book.place.country === this.props.user.place.country) {
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
        <span id="price-icon" className="book-icon lower-icon span-icon">
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
            <p id="timeToMeet" className="info">
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
          onClick={this.toggleDisplay}
        >
          <UserInfo
            userId={this.props.book.sellerId}
            user={this.props.book.sellerUser}
            hidden={true}
            place={this.props.book.place}
            toggleDisplay={this.toggleDisplay}
            display={this.state.userInfoHidden ? "hidden" : null}
          />
          <i className="fas fa-address-card fa-1x upperIcon book-icon"></i>
        </div>
      ),
      lowerIcon,
      upperHeader
    };

    const deals = {
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
          <div id="date-container" className="info-container">
            <i className="fas fa-calendar-alt info-book-ico"></i>
            <p id="date" className="info">
              {this.props.date}
            </p>
          </div>
          <div id="price-container" className="info-container">
            <i className="fas fa-euro-sign info-book-ico"></i>
            <p id="price" className="info">
              {this.props.book.price}
            </p>
          </div>
        </div>
      ),
      delivery: null,
      upperIcon: (
        <div
          id="deals-upperIcon"
          className="upperIcon-container icon-container"
          onClick={() => {
            this.props.toggleBookInfo(true, this.props.book);
          }}
        >
          <i className="fas fa-edit fa-1x upperIcon book-icon"></i>
        </div>
      ),
      lowerIcon: (
        <div
          id="deals-lowerIcon"
          className="lowerIcon-container icon-container"
          onClick={this.handleDelete}
        >
          <i className="fas fa-trash-alt lowerIcon book-icon"></i>
        </div>
      ),
      upperHeader: null
    };

    let page = null;
    switch (this.props.page) {
      case "results":
        page = results;
        break;
      case "deals":
        page = deals;
        break;
      default:
        break;
    }

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

import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./book.css";

import Stars from "../stars/stars";

class book extends Component {
  state = {
    imageClass: "results-bigger",
    timeout: null,
    priceHover: false,
    spamHidden: true,
    expDisplay: "hidden"
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

  imageBigger = e => {
    this.setState({ imageClass: "result-bigger" });
    if (window.innerWidth < 1000) {
      setInterval(() => {
        this.setState({ imageClass: null });
      }, 2500);
    }
  };

  imageSmaller = () => {
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
    this.props.indexIncrease("bought");
  };

  handleDelete = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Vuoi eliminare questo libro?")) {
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
              error: {
                frontendPlace: "Orders/book/handleDelete/code1",
                jsonRes
              }
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
    }
  };

  render() {
    console.log();
    //   make bookprice .00
    let bookPrice = 0;
    if (String(this.props.book.price).indexOf(".") === -1) {
      // whole price
      bookPrice = `${this.props.book.price}.00`;
    } else {
      // decimal
      if (String(this.props.book.price).split(".")[1].length === 1)
        bookPrice = bookPrice = `${this.props.book.price}0`;
      else bookPrice = this.props.book.price;
    }

    // see if can ship
    let text = "";
    if (
      this.props.user.place &&
      this.props.user.place.city &&
      this.props.book.sellerUser
    ) {
      //  delivery
      switch (this.props.book.sellerUser.deliveryInfo.range) {
        case "NO":
          break;
        case "country":
          text = `spedisco in ${this.props.book.place.country}`;
          break;
        case "region":
          text = `spedisco in zona ${this.props.book.place.region}`;
          break;
        case "city":
          text = `spedisco in zona ${this.props.book.place.city}`;
          break;
        default:
          break;
      }
    }

    // cart
    const notBoughtResultLowerIcon = (
      // this.state.priceHover ? (
      <div
        id="result-lower-icon-cart"
        // onMouseLeave={this.priceAway}
        onClick={this.addCart}
        className={`lowerIcon-container result-icon icon-container ${
          this.props.cartDisabled ? "hidden" : null
        }`}
      >
        <i className="fas fa-cart-plus lower-icon book-icon"></i>
      </div>
    );

    const boughtResultLowerIcon = (
      <div
        id="result-lower-icon-bought"
        className={`lowerIcon-container result-icon icon-container ${
          this.props.cartDisabled ? "hidden" : null
        }`}
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

    const spam = (
      <div id="spam-container">
        <i
          className="fas fa-ellipsis-v"
          onClick={() => {
            this.setState({ spamHidden: !this.state.spamHidden });
          }}
        ></i>
        <p
          className={`spam ${this.state.spamHidden ? "hidden" : null}`}
          onMouseLeave={() => this.setState({ spamHidden: true })}
          onClick={this.spam}
        >
          SEGNALA SPAM
        </p>
      </div>
    );

    const sellerUser = this.props.selectedBooks.map(
      cluster => cluster.sellerId
    );

    const results = this.props.book.sellerUser
      ? {
          infoContainer: (
            <div id="info-container" className="sub-container half">
              {lowerIcon}
              {spam}
              <div id="contained">
                {/* <div
            id="title-container"
            className="info-container results"
            onClick={this.generalClicked}
          >
            <i className="fas fa-book info-book-ico"></i> */}
                <p id="title" className="info">
                  {this.props.book.title}
                </p>
                {/* </div>
            <div
            id="place-container"
            className="info-container results"
            onClick={this.generalClicked}
          >
            <i className="fas fa-home fa-1x info-book-ico"></i> */}
                <p id="place" className="info">
                  {this.props.book.place.city}
                  {this.props.book.sellerUser.school
                    ? this.props.book.sellerUser.school ===
                      "Non frequento un'università"
                      ? null
                      : `, ${this.props.book.sellerUser.school}`
                    : null}
                </p>
                {/* </div> */}
                <div
                  id="quality-container"
                  className="info-container results"
                  // onClick={this.generalClicked}
                >
                  <i className="fas fa-award info-book-ico"></i>
                  <p id="quality" className="info">
                    {this.props.book.quality}
                  </p>
                </div>
                <div
                  className="info-container results"
                  //   onClick={this.generalClicked}
                >
                  <i className="fas fa-truck info-book-ico fa-1x"></i>
                  <p id="delivery" className="info">
                    Consegno in città entro{" "}
                    {this.props.book.sellerUser.deliveryInfo.timeToMeet} giorni{" "}
                    {text ? `e ${text}` : null}
                  </p>
                </div>
                <div
                  className="info-container"
                  //   onClick={this.generalClicked}
                >
                  <i className="fas fa-euro-sign info-book-ico fa-1x"></i>
                  <p id="price" className="info">
                    {bookPrice}
                  </p>
                </div>
              </div>
            </div>
          ),
          user: (
            <div id={this.props.cartDisabled ? "center" : null}>
              <div className="user-box-container">
                <div className="user-box box-big">
                  <i className="fas fa-user-graduate"></i>
                  <p id="user-header" className="box-text">
                    {this.props.user.name
                      ? this.props.user.name.split(" ")[0]
                      : "INFO VENDITORE"}
                  </p>
                </div>
                <div>
                  <div className="user-box box-small">
                    <p className="rating-header box-text">
                      {/* SINCERITÀ SULLA QUALITÀ{" "} */}
                      AFFIDABILITÀ
                    </p>
                    <div className="rating">
                      <Stars
                        rating={Math.round(
                          this.props.book.sellerUser.rating.qualityAverage
                        )}
                      />
                      <p className="mean box-text">
                        {Math.round(
                          this.props.book.sellerUser.rating.qualityAverage * 10
                        ) / 10}
                      </p>
                    </div>
                  </div>
                  <div className="user-box box-small">
                    <p className="rating-header box-text">CONSEGNA</p>
                    <div className="rating">
                      <Stars
                        rating={Math.round(
                          this.props.book.sellerUser.rating.deliveryAverage
                        )}
                      />
                      <p className="box-text mean">
                        {Math.round(
                          this.props.book.sellerUser.rating.deliveryAverage * 10
                        ) / 10}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  id="convenience-box"
                  className={`user-box box-big ${
                    this.props.cartDisabled ? "hidden" : null
                  } ${
                    this.props.book.userSellsCount ===
                    this.props.maxUserSellsCount
                      ? "highlight"
                      : null
                  }`}
                >
                  <p id="convenience-param" className="box-text">
                    {this.props.book.userSellsCount} /{" "}
                    {this.props.booksResult.length}
                    <i
                      id="convenience-check"
                      className={`fas fa-check ${
                        sellerUser.includes(this.props.book.sellerId)
                          ? null
                          : "hidden"
                      }`}
                    ></i>
                  </p>
                  <i
                    id="exp-cb-ico"
                    onClick={() => {
                      this.setState({ expDisplay: null });
                      setTimeout(
                        () => this.setState({ expDisplay: "hidden" }),
                        3000
                      );
                    }}
                    className="fas fa-info-circle"
                  ></i>
                  <p id="exp-cb" className={this.state.expDisplay}>
                    {sellerUser.includes(this.props.book.sellerId)
                      ? `vende ${this.props.book.userSellsCount} dei libri che ti servono e stai comprando altri libri di questo venditore`
                      : `vende ${this.props.book.userSellsCount} dei libri che ti servono`}
                  </p>
                </div>
              </div>
            </div>
          ),
          lowerIcon
        }
      : null;

    // insertionDate
    const insertion = new Date(this.props.book.insertionDate);

    const more = (
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
            onClick={() => {
              this.props.toggleBookInfo(true, this.props.book);
            }}
          >
            MODIFICA
          </p>
          <p
            className={`spam second ${this.state.spamHidden ? "hidden" : null}`}
            onClick={this.handleDelete}
          >
            ELIMINA
          </p>
        </div>
      </div>
    );

    const deals = this.props.book.sellerUser
      ? {
          infoContainer: (
            <div id="info-container" className="sub-container half">
              {/* {lowerIcon} */}
              {more}
              <div id="contained">
                {/* <div
              id="title-container"
              className="info-container results"
              onClick={this.generalClicked}
            >
              <i className="fas fa-book info-book-ico"></i> */}
                <p id="title" className="info">
                  {this.props.book.title}
                </p>
                {/* </div>
              <div
              id="place-container"
              className="info-container results"
              onClick={this.generalClicked}
            >
              <i className="fas fa-home fa-1x info-book-ico"></i> */}
                <p id="place" className="info">
                  {this.props.book.place.city}
                  {this.props.book.sellerUser.school
                    ? this.props.book.sellerUser.school ===
                      "Non frequento un'università"
                      ? null
                      : `, ${this.props.book.sellerUser.school}`
                    : null}
                </p>
                {/* </div> */}
                <div
                  id="quality-container"
                  className="info-container results"
                  // onClick={this.generalClicked}
                >
                  <i className="fas fa-award info-book-ico"></i>
                  <p id="quality" className="info">
                    {this.props.book.quality}
                  </p>
                </div>
                <div
                  className="info-container results"
                  //   onClick={this.generalClicked}
                >
                  <i className="fas fa-truck info-book-ico fa-1x"></i>
                  <p id="delivery" className="info">
                    Consegno in città entro{" "}
                    {this.props.book.sellerUser.deliveryInfo.timeToMeet} giorni{" "}
                    {text ? `e ${text}` : null}
                  </p>
                </div>
                <div
                  className="info-container"
                  //   onClick={this.generalClicked}
                >
                  <i className="fas fa-euro-sign info-book-ico fa-1x"></i>
                  <p id="price" className="info">
                    {bookPrice}
                  </p>
                </div>
              </div>
            </div>
          ),
          user: (
            <div id="user-container" className="user-box-container">
              <p className="even-box">
                {" "}
                {insertion.getDate() < 10
                  ? `0${insertion.getDate()}`
                  : insertion.getDate()}
              </p>
              <p className="even-box">
                {insertion.getMonth() < 10
                  ? `0${insertion.getMonth()}`
                  : insertion.getMonth()}
              </p>
              <p className="even-box">
                {insertion
                  .getFullYear()
                  .toString()
                  .substr(2, 3)}
              </p>
            </div>
          ),
          lowerIcon
        }
      : null;

    // const deals = {
    //   infoContainer: (
    //     <div id="info-container" className="sub-container">
    //       <div id="title-container" className="info-container">
    //         <i className="fas fa-book info-book-ico"></i>
    //         <p id="title" className="info">
    //           {this.props.book.title}
    //         </p>
    //       </div>
    //       <div id="quality-container" className="info-container">
    //         <i className="fas fa-award info-book-ico"></i>
    //         <p id="quality" className="info">
    //           {this.props.book.quality}
    //         </p>
    //       </div>
    //       <div id="price-container" className="info-container">
    //         <i className="fas fa-euro-sign info-book-ico"></i>
    //         <p id="price" className="info">
    //           {bookPrice} €
    //         </p>
    //       </div>
    //     </div>
    //   ),
    //   delivery: null,
    //   upperIcon: (
    //     <div
    //       id="deals-upperIcon"
    //       className="upperIcon-container icon-container"
    //       onClick={() => {
    //         this.props.toggleBookInfo(true, this.props.book);
    //       }}
    //     >
    //       <i className="fas fa-pen fa-1x upperIcon book-icon"></i>
    //     </div>
    //   ),
    //   lowerIcon: (
    //     <div
    //       id="deals-lowerIcon"
    //       className="lowerIcon-container icon-container"
    //       onClick={this.handleDelete}
    //     >
    //       <i className="fas fa-trash-alt lowerIcon book-icon"></i>
    //     </div>
    //   ),
    //   upperHeader: null
    // };

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
      <div id="book">
        <div id="firstHalf" className="half sub-container">
          <div id="user" className="child sub-container">
            {page ? page.user : null}
          </div>
          {/* <div id="image-container"  */}
          <img
            src={this.props.book.imageURL}
            id="image"
            alt="book cover"
            onMouseLeave={this.imageSmaller}
            className={this.state.imageClass}
          />
          <i className="fas fa-search-plus" onClick={this.imageBigger}></i>
        </div>
        {/* </div> */}
        {page ? page.infoContainer : null}
        {/* {page.delivery} */}
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

export default connect(mapStateToProps)(withRouter(book));

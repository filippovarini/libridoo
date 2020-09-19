import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import "./cart.css";

class Cart extends Component {
  removeSelectedBook = (clusterIndex, bookIndex, bookId) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Sei sicuro di voler rimuovere il libro dal carrello?")) {
      // remove sb from sessionStorage
      const SBs = JSON.parse(sessionStorage.getItem("SBs"));
      if (SBs.length === 1) {
        // just the book that is gonna be deleted
        sessionStorage.removeItem("SBs");
      } else {
        const index = SBs.indexOf(bookId);
        SBs.splice(index, 1);
        sessionStorage.setItem("SBs", JSON.stringify(SBs));
      }
      this.props.dispatch({ type: "SB-DELETE", clusterIndex, bookIndex });
    }
  };

  render() {
    let display = this.props.hidden ? "hidden" : null;
    if (this.props.hiderCart) display = "hidden";
    let totalPrice = 0;
    this.props.selectedBooks.forEach(cluster => {
      cluster.Books.forEach(book => {
        totalPrice = (totalPrice * 100 + book.price * 100) / 100;
      });
    });
    if (String(totalPrice).indexOf(".") === -1) {
      // whole price
      totalPrice = `${totalPrice}.00`;
    } else {
      // decimal
      if (String(totalPrice).split(".")[1].length === 1)
        totalPrice = `${totalPrice}0`;
    }
    return (
      <div
        id="cart"
        className={display}
        onMouseLeave={this.props.toggleDisplay}
      >
        {this.props.selectedBooks.map(cluster => {
          return (
            <div
              className="cluster-container"
              key={this.props.selectedBooks.indexOf(cluster)}
            >
              {cluster.Books.map(book => {
                let bookPrice = 0;
                if (String(book.price).indexOf(".") === -1) {
                  // whole price
                  bookPrice = `${book.price}.00`;
                } else {
                  // decimal
                  if (String(book.price).split(".")[1].length === 1)
                    bookPrice = `${book.price}0`;
                  else bookPrice = book.price;
                }
                return (
                  <div
                    className="book-container"
                    key={cluster.Books.indexOf(book)}
                  >
                    <i
                      className="delete fas fa-times"
                      onClick={() => {
                        this.removeSelectedBook(
                          this.props.selectedBooks.indexOf(cluster),
                          cluster.Books.indexOf(book),
                          book._id
                        );
                      }}
                    ></i>
                    <p className="title info">{book.title}</p>
                    <p className="place info">
                      {" "}
                      {cluster.sellerInfo.place.city},{" "}
                      <span id="uni-cart">{cluster.sellerInfo.school}</span>
                    </p>
                    <p className="quality info">{book.quality}</p>
                    <p className="book-price">{bookPrice} €</p>
                  </div>
                );
              })}
            </div>
          );
        })}
        <div id="bill">
          <p id="price-header">Totale:</p>
          <p id="price">{totalPrice} €</p>
        </div>
        <Link to="/checkoutReview" id="checkout-prompt">
          CHECKOUT
        </Link>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    selectedBooks: state.selectedBooks
  };
};

export default connect(mapStateToProps)(withRouter(Cart));

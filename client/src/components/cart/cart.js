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
    let totalPrice = 0;
    this.props.selectedBooks.forEach(cluster => {
      cluster.Books.forEach(book => {
        totalPrice += book.price;
      });
    });
    return (
      <div
        id="cart"
        className={this.props.hidden ? "hidden" : null}
        onMouseLeave={this.props.toggleDisplay}
      >
        <p id="cart-header">Carrello</p>

        {this.props.selectedBooks.map(cluster => {
          return (
            <div className="cluster-container" key={cluster.sellerId}>
              {cluster.Books.map(book => {
                return (
                  <div className="book-container" key={book._id}>
                    <p
                      className="delete"
                      onClick={() => {
                        this.removeSelectedBook(
                          this.props.selectedBooks.indexOf(cluster),
                          cluster.Books.indexOf(book),
                          book._id
                        );
                      }}
                    >
                      -
                    </p>
                    <p className="title info">{book.title}</p>
                    <p className="quality info">{book.quality}</p>
                    <p className="place info">
                      {" "}
                      {cluster.sellerInfo.place.city},{" "}
                      {cluster.sellerInfo.school}
                    </p>
                    <p className="book-price">€ {book.price}</p>
                  </div>
                );
              })}
            </div>
          );
        })}
        <div id="bill">
          <p id="price-header">Totale:</p>
          <p id="price">{totalPrice}</p>
        </div>
        <Link to="/checkout" id="checkout-prompt">
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

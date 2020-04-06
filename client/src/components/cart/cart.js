import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import "./cart.css";

class Cart extends Component {
  removeSelectedBook = (clusterIndex, bookIndex, bookId) => {
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
  };

  render() {
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
                  </div>
                );
              })}
            </div>
          );
        })}
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

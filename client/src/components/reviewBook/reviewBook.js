import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./reviewBook.css";

class ReviewBook extends Component {
  handleRemove = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Confermi di voler rimuovere il libro dal carrello?")) {
      // remove sb from sessionStorage
      const SBs = JSON.parse(sessionStorage.getItem("SBs"));
      if (SBs.length === 1) {
        // just the book that is gonna be deleted
        sessionStorage.removeItem("SBs");
        // !!not sure, maybe better empty cart
        this.props.history.push("/results");
      } else {
        const index = SBs.indexOf(this.props.book._id);
        SBs.splice(index, 1);
        sessionStorage.setItem("SBs", JSON.stringify(SBs));
      }
      // get index
      const bookId = this.props.book.id;
      let clusterIndex = 0;
      let bookIndex = 0;
      this.props.selectedBooks.forEach((cluster, clusterIndx) => {
        cluster.Books.forEach((book, index) => {
          if (book._id === bookId) {
            // book I was looking for
            bookIndex = index;
            clusterIndex = clusterIndx;
          }
        });
      });
      this.props.dispatch({
        type: "SB-DELETE",
        clusterIndex,
        bookIndex
      });
    }
  };

  render() {
    return (
      <div id="reviewBook">
        {/* <div id="rb-image" className="rb-titles"> */}
        <img
          src={this.props.book.imageURL}
          id="rb-image-contained"
          alt="cover"
        />
        {/* </div> */}
        <p id="rb-title" className="rb-titles">
          {this.props.book.title}
        </p>
        <p id="rb-place" className="rb-titles">
          {this.props.book.place}, {this.props.book.uni}
        </p>
        <p id="rb-quality" className="rb-titles">
          {this.props.book.quality}
        </p>
        <p id="rb-subtotal" className="rb-titles">
          {this.props.book.price}
        </p>
        <i
          id="rb-delete-ico"
          className="fas fa-times"
          onClick={this.handleRemove}
        ></i>
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

export default connect(mapStateToProps)(withRouter(ReviewBook));

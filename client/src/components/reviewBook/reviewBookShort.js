import React, { Component } from "react";
import "./reviewBook.css";

class ReviewBookShort extends Component {
  render() {
    return (
      <div id="reviewBook">
        <img
          src={this.props.book.imageURL}
          id="rb-image-contained"
          alt="cover"
        />
        <div id="rbs-item">
          <p id="rbs-title" className="rb-titles">
            {this.props.book.title}
          </p>
          <p id="rbs-place" className="rb-titles">
            {this.props.book.place}, {this.props.book.uni}
          </p>
          <p id="rbs-quality" className="rb-titles">
            {this.props.book.quality}
          </p>
        </div>
        <p id="rbs-subtotal" className="rb-titles">
          {this.props.book.price}
        </p>
      </div>
    );
  }
}

export default ReviewBookShort;

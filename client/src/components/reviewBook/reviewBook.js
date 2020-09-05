import React, { Component } from "react";
import "./reviewBook.css";

class ReviewBook extends Component {
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
      </div>
    );
  }
}

export default ReviewBook;

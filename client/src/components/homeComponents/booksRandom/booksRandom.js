import React, { Component } from "react";
import "./booksRandom.css";

// components
import Book from "../../book/book";

class booksRandom extends Component {
  state = {
    books: [],
    error: false
  };

  componentDidMount = () => {
    fetch("/api/book/fetch/buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "applicationjson"
      },
      body: JSON.stringify({
        searchParams: {
          ui: ""
        },
        limit: 20
      })
    })
      .then(res => res.json())
      .then(jsonRes => {
        if (jsonRes.code === 0) {
          this.setState({ books: jsonRes.results.filterResult });
        } else this.setState({ error: true });
      })
      .catch(error => console.log(error));
  };

  render() {
    const noError = (
      <div id="body">
        <div id="header-container">
          <p id="header">POTREBBERO INTERESSARTI:</p>
          <p id="sub-header">
            Più libri acquisti con noi, più riusciremo a proporti annunci
            interesanti.
          </p>
        </div>
        <div id="books-container">
          {this.state.books
            ? this.state.books.map(book => {
                return (
                  <Book
                    book={book}
                    key={book._id}
                    page="results"
                    cartDisabled={true}
                  />
                );
              })
            : null}
        </div>
      </div>
    );

    const error = null;

    const body = this.state.error ? error : noError;

    return <div id="rb">{body}</div>;
  }
}

export default booksRandom;

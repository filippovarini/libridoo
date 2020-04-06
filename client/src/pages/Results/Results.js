import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import "./Results.css";

// components
import Book from "../../components/book/book";

// modules
import AL1 from "./AL1";

class Results extends Component {
  state = {
    loading: true,
    index: 0,
    ready: false,
    updated: false,
    city: "",
    school: "",
    quality: ""
  };

  componentDidMount = () => {
    // sort them and set in state
    if (!sessionStorage.getItem("searchParams")) {
      this.props.history.push("/search");
    }
    const sortedResult = AL1(this.props.booksResult);
    this.props.dispatch({ type: "R-SET", results: sortedResult });
    this.setState({
      loading: false
    });
  };

  componentDidUpdate = () => {
    if (this.state.ready && !this.state.updated) {
      if (this.props.booksResult.length === 0) {
        // no books stored
        if (
          sessionStorage.getItem("searchParams") &&
          JSON.parse(sessionStorage.getItem("searchParams")).length !== 0
        ) {
          // something searched, but lost because of refresh
          const body = {
            searchParams: JSON.parse(sessionStorage.getItem("searchParams"))
          };
          this.setState({ loading: true });
          fetch("/api/book/generalFetch/UI", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify(body)
          })
            .then(res => res.json())
            .then(jsonRes => {
              if (jsonRes.code === 0) {
                // includes results with 2.5, but at least correct
                jsonRes.results.forEach(result => {
                  delete result.index;
                });
                const sortedResult = AL1(jsonRes.results);
                this.props.dispatch({ type: "R-SET", results: sortedResult });
                this.setState({
                  loading: false,
                  index: sessionStorage.getItem("index")
                    ? Number(sessionStorage.getItem("index"))
                    : 0
                });
              } else {
                // code 1, code 1.5 ...
                this.props.dispatch({
                  type: "E-SET",
                  error: {
                    frontendPlace: "Results/componentDidUpdate/code1",
                    jsonRes
                  }
                });
                sessionStorage.removeItem("searchParams");
                this.props.history.push("/error");
              }
            })
            .catch(() => {
              this.props.dispatch({
                type: "E-SET",
                error: { frontendPlace: "Results/componentDidUpdate/catch" }
              });
              sessionStorage.removeItem("searchParams");
              this.props.history.push("/error");
            });
        }
      }
      this.setState({ updated: true });
    } else if (!this.state.ready) {
      this.setState({ ready: true });
    }
  };

  handleReviewSearch = () => {
    // !!! check result index gets authomatically deleted
    // remove results, search params
    sessionStorage.removeItem("searchParams");
    this.props.dispatch({ type: "R-DELETE-ALL" });
    this.props.history.push("/search");
  };

  increaseIndex = () => {
    sessionStorage.setItem("index", this.state.index + 1);
    this.setState({ index: this.state.index + 1 });
    // }
  };

  decreaseIndex = () => {
    sessionStorage.setItem("index", this.state.index - 1);
    this.setState({ index: this.state.index - 1 });
  };

  handleFilterChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  handleFilterEdit = filter => {
    this.setState({
      [filter]: ""
    });
  };

  handleFilterDisable = filter => {
    this.setState({
      [filter]: "__disabled"
    });
  };

  handleFilterSubmit = e => {
    e.preventDefault();
    // !!!CHECK IF RIGHT
    const searchParams = JSON.parse(sessionStorage.getItem("searchParams"))[
      this.state.index
    ];
    // good even if state empty
    searchParams.city = this.state.city || searchParams.city;
    searchParams.school = this.state.school || searchParams.school;
    searchParams.quality = this.state.quality || searchParams.quality;
    if (this.state.city === "__disabled") searchParams.city = null;
    if (this.state.school === "__disabled") searchParams.school = null;
    if (this.state.quality === "__disabled") searchParams.quality = null;
    // body
    const body = { searchParams };
    this.setState({ loading: true });
    fetch("/api/book/fetch/buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(jsonRes => {
        if (jsonRes.code === 0 || jsonRes.code === 2.5) {
          // correct
          // update searchParams
          let paramsArray =
            JSON.parse(sessionStorage.getItem("searchParams")) || [];
          paramsArray[this.state.index] = searchParams;
          sessionStorage.setItem("searchParams", JSON.stringify(paramsArray));
          // update resultReducer
          let resultsArray = this.props.booksResult;
          resultsArray[this.state.index] = {
            searchParams,
            filterResult: jsonRes.results ? jsonRes.results.filterResult : [],
            wrongCode: jsonRes.code === 2.5 ? 2.5 : null,
            message: jsonRes.code === 2.5 ? jsonRes.message : null
          };
          // sort them
          const sortedResult = AL1(resultsArray);
          // store sorted in redux
          this.props.dispatch({ type: "R-SET", results: sortedResult });
          this.setState({
            loading: false,
            city: "",
            school: "",
            quality: ""
          });
        } else {
          // error:
          // 2 (shouldn't be a 2 ui already stored in session)
          // 1.5, 1
          sessionStorage.removeItem("searchParams");
          this.props.dispatch({
            type: "E-SET",
            error: {
              frontendPlace: "Results/handleFilterSubmit/code1",
              jsonRes
            }
          });
          this.props.history.push("/error");
        }
      })
      .catch(error => {
        // store and redirect
        sessionStorage.removeItem("searchParams");
        this.props.dispatch({
          type: "E-SET",
          error: { frontendPlace: "Results/handleFilterSubmit/catch" }
        });
        this.props.history.push("/error");
      });
  };

  render() {
    const uiList = sessionStorage.getItem("searchParams")
      ? JSON.parse(sessionStorage.getItem("searchParams")).map(
          param => param.ui
        )
      : [];

    let booksComponent,
      wrongFilters,
      resultsBody,
      loading,
      bodyComponent,
      filterSubmitClass,
      filters = null;

    if (this.state.index !== uiList.length) {
      booksComponent =
        this.props.booksResult.length !== 0
          ? this.props.booksResult[this.state.index].filterResult.map(book => {
              return (
                <Book
                  book={book}
                  key={book._id}
                  indexIncrease={this.increaseIndex}
                />
              );
            })
          : null;

      wrongFilters =
        this.props.booksResult.length !== 0 ? (
          <div id="wrongFilters">
            <p id="header">
              {this.props.booksResult[this.state.index].message}
            </p>
          </div>
        ) : null;
      resultsBody = booksComponent;
      if (this.props.booksResult.length !== 0) {
        if (this.props.booksResult[this.state.index].wrongCode)
          resultsBody = wrongFilters;
      }
      loading = <h1>loading...</h1>;

      bodyComponent = this.state.loading ? loading : resultsBody;

      filterSubmitClass =
        !this.state.city && !this.state.school && !this.state.quality
          ? "hidden"
          : null;

      filters =
        this.props.booksResult.length !== 0 ? (
          <form id="filters" onSubmit={this.handleFilterSubmit}>
            {/* <p id="header">FILTRI</p> */}
            <div className="input-container" id="inputs-container">
              <div className="input-container text">
                {this.state.city === "__disabled" ? (
                  <p
                    id="cityDelete"
                    onClick={() => {
                      this.handleFilterEdit("city");
                    }}
                    className="input-filter-icon edit"
                  >
                    +
                  </p>
                ) : (
                  <p
                    id="cityDelete"
                    className="input-filter-icon delete"
                    onClick={() => {
                      this.handleFilterDisable("city");
                    }}
                  >
                    -
                  </p>
                )}
                <input
                  autoComplete="off"
                  type="text"
                  className={`filter input ${
                    this.state.city !== "__disabled" ? "active" : null
                  }`}
                  id="city"
                  placeholder={
                    this.props.booksResult[this.state.index]
                      ? this.props.booksResult[this.state.index].searchParams
                          .city || "città"
                      : "città"
                  }
                  disabled={this.state.city === "__disabled" ? true : false}
                  onChange={this.handleFilterChange}
                  value={
                    this.state.city === "__disabled" ? "città" : this.state.city
                  }
                />
              </div>
              <div className="input-container text">
                {this.state.school === "__disabled" ? (
                  <p
                    id="schoolDelete"
                    onClick={() => {
                      this.handleFilterEdit("school");
                    }}
                    className="input-filter-icon edit"
                  >
                    +
                  </p>
                ) : (
                  <p
                    id="schoolDelete"
                    className="input-filter-icon delete"
                    onClick={() => {
                      this.handleFilterDisable("school");
                    }}
                  >
                    -
                  </p>
                )}
                <input
                  disabled={this.state.school === "__disabled" ? true : false}
                  autoComplete="off"
                  type="text"
                  className={`filter input ${
                    this.state.school !== "__disabled" ? "active" : null
                  }`}
                  id="school"
                  onChange={this.handleFilterChange}
                  placeholder={
                    this.props.booksResult[this.state.index].searchParams
                      .school || "scuola/università"
                  }
                  value={
                    this.state.school === "__disabled"
                      ? "scuola/università"
                      : this.state.school
                  }
                />
              </div>
              <div id="qualityDelete" className="input-container select">
                {this.state.quality === "__disabled" ? (
                  <p
                    id="qualityDelete"
                    onClick={() => {
                      this.handleFilterEdit("quality");
                    }}
                    className="input-filter-icon edit"
                  >
                    +
                  </p>
                ) : (
                  <p
                    id="qualityDelete"
                    className="input-filter-icon delete"
                    onClick={() => {
                      this.handleFilterDisable("quality");
                    }}
                  >
                    -
                  </p>
                )}
                <select
                  id="quality"
                  className="filter input"
                  disabled={this.state.quality === "__disabled" ? true : false}
                  onChange={this.handleFilterChange}
                  value={
                    this.state.quality === "__disabled"
                      ? "quality"
                      : this.state.quality ||
                        this.props.booksResult[this.state.index].searchParams
                          .quality ||
                        "quality"
                  }
                >
                  <option value="quality" defaultChecked hidden>
                    qualità
                  </option>
                  <option value="intatto">intatto</option>
                  <option value="ottimo, sottolineato a matita">
                    ottimo, sottolineato a matita
                  </option>
                  <option value="ottimo, sottolineato a penna/evidenziatore">
                    ottimo, sottolineato a penna
                  </option>
                  <option value="normale, sottolineato a matita">
                    normale, sottolineato a matita
                  </option>
                  <option value="ottimo, sottolineato a penna/evidenziatore">
                    normale, sottolineato a penna/evidenziatore
                  </option>
                  <option value="ottimo, sottolineato a penna/evidenziatore">
                    rovinato, sottolineato a matita
                  </option>
                  <option value="ottimo, sottolineato a penna/evidenziatore">
                    rovinato, sottolineato a penna/evidenziatore
                  </option>
                  <option value="distrutto">distrutto</option>
                  <option value="fotocopiato">fotocopiato</option>
                </select>
              </div>
            </div>
            <div
              className={`input-container ${filterSubmitClass}`}
              id="submit-container"
            >
              <input
                autoComplete="off"
                id="filter-submit"
                type="submit"
                className="filter"
                value="FILTRA"
                onClick={this.handleFilterSubmit}
              />
            </div>
          </form>
        ) : null;
    }

    const resultReview = (
      <div id="resultsReview">
        <p id="results-review-header">
          {this.props.selectedBooks.length !== 0
            ? "Hai finito la spesa"
            : "Non hai selezionato nessun libro"}
        </p>
        <div id="choices-container">
          <p onClick={this.handleReviewSearch} className="results-review-link">
            CERCA ALTRI LIBRI
          </p>
          <Link
            to="/checkout"
            className={`results-review-link ${
              this.props.selectedBooks.length !== 0 ? null : "hidden"
            }`}
          >
            {" "}
            VAI AL CHECKOUT
          </Link>
        </div>
      </div>
    );

    const bodyContainer =
      this.props.booksResult.length !== 0 ? (
        this.state.index === this.props.booksResult.length ? (
          resultReview
        ) : (
          <div>
            {filters}
            <div id="bodyComponent-container">{bodyComponent}</div>
          </div>
        )
      ) : (
        <h1>loading...</h1>
      );

    return (
      <div id="results">
        <div id="ui-container">
          <p id="ui-header">Risultati per:</p>
          <div id="list-container">
            {uiList.map(ui => {
              return (
                <p
                  className={`ui-list ${
                    uiList.indexOf(ui) === this.state.index ? "bold" : null
                  }`}
                  key={ui}
                >
                  {ui}
                </p>
              );
            })}
          </div>
        </div>
        {bodyContainer}
        <div id="results-footer">
          <i
            onClick={this.decreaseIndex}
            className={`fas fa-angle-left nav ${
              this.state.index === 0 ? "hidden" : null
            }`}
          ></i>
          <p id="nav-ui">{uiList[this.state.index] || null}</p>
          <i
            onClick={this.increaseIndex}
            className={`fas fa-angle-right nav ${
              uiList.length === this.state.index + 1 ? "hidden" : null
            }`}
          ></i>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    booksResult: state.booksResult,
    selectedBooks: state.selectedBooks
  };
};

export default connect(mapStateToProps)(Results);

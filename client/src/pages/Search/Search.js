import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import "./Search.css";

class Search extends Component {
  state = {
    inputClass: null,
    submitDisplay: "hidden",
    ui: null,
    loading: false,
    ready: false,
    updated: false
  };

  // no access limitation
  componentDidMount = () => {
    // trigget update
    this.setState({ ready: false });
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
                  this.props.dispatch({ type: "R-PUSH", results: result });
                });
                this.setState({ loading: false });
              } else {
                // code 1, code 1.5 ...
                this.props.dispatch({
                  type: "E-SET",
                  error: {
                    frontendPlace: "Search/componentDidUpdate/code",
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
                error: { frontendPlace: "Search/componentDidUpdate/catch" }
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
    // if nothing happens, it is not because it has mounted (refreshed)
  };

  handleChange = e => {
    if (!e.target.value) {
      this.setState({ submitDisplay: "hidden" });
    } else {
      this.setState({ submitDisplay: null });
    }
    this.setState({ ui: e.target.value, inputClass: null });
  };

  handleDelete = e => {
    const paramsArray = JSON.parse(sessionStorage.getItem("searchParams"));
    if (paramsArray.length === 1) {
      sessionStorage.removeItem("searchParams");
      this.props.dispatch({ type: "R-DELETE", index: 0 });
      window.location = "/search";
    } else {
      let index = null;
      let filtered = [];
      paramsArray.forEach(param => {
        if (param.ui === e.target.id) {
          // the one to be deleted
          index = paramsArray.indexOf(param);
        } else {
          filtered.push(param);
        }
      });
      // adjust searchParams
      sessionStorage.setItem("searchParams", JSON.stringify(filtered));
      // adjust reducer
      this.props.dispatch({ type: "R-DELETE", index });
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    let alreadySearched = false;
    if (sessionStorage.getItem("searchParams")) {
      JSON.parse(sessionStorage.getItem("searchParams")).forEach(param => {
        if (param.ui === this.state.ui) {
          alreadySearched = true;
        }
      });
    }
    if (alreadySearched) {
      this.setState({ inputClass: "invalid-input" });
      alert("Già hai cercato questo libro");
    } else {
      let cityFilter = null;
      let schoolfilter = null;
      if (this.props.user.place) {
        // logged
        if (this.props.user.place.city) {
          // place set
          cityFilter = this.props.user.place.city;
        }
        if (this.props.user.school) {
          schoolfilter = this.props.user.school;
        }
      }
      const searchParams = {
        ui: this.state.ui,
        city: cityFilter,
        school: schoolfilter,
        quality: null
      };
      this.setState({ loading: true });
      fetch("/api/book/fetch/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ searchParams })
      })
        .then(res => res.json())
        .then(jsonRes => {
          if (jsonRes.code === 2) {
            // wrong title
            this.setState({ inputClass: "invalid-input" });
            alert(jsonRes.message);
          } else if (jsonRes.code === 0 || jsonRes.code === 2.5) {
            // (half) correct
            // store searchParams in sessionStorage
            let paramsArray =
              JSON.parse(sessionStorage.getItem("searchParams")) || [];
            paramsArray.push(searchParams);
            sessionStorage.setItem("searchParams", JSON.stringify(paramsArray));
            if (jsonRes.code === 2.5) {
              // wrong filter
              this.props.dispatch({
                type: "R-PUSH",
                results: {
                  searchParams,
                  filterResult: [],
                  wrongCode: 2.5,
                  wrongFilter: jsonRes.wrongFilter,
                  message: jsonRes.message
                }
              });
            } else if (jsonRes.code === 0) {
              // perfect
              this.props.dispatch({
                type: "R-PUSH",
                results: {
                  searchParams,
                  filterResult: jsonRes.results.filterResult
                }
              });
            }
            this.setState({ inputClass: null });
          } else {
            // error
            this.props.dispatch({
              type: "E-SET",
              error: {
                frontendPlace: "search/handleSubmit/code1",
                jsonRes
              }
            });
            sessionStorage.removeItem("searchParams");
            this.props.history.push("/error");
          }
          this.setState({
            loading: false
          });
        })
        .catch(error => {
          // store and redirect
          this.props.dispatch({
            type: "E-SET",
            error: {
              frontendPlace: "header/searchBar/handleSubmit/catch",
              error
            }
          });
          sessionStorage.removeItem("searchParams");
          this.props.history.push("/error");
        });
    }
  };

  render() {
    const searchParams = JSON.parse(sessionStorage.getItem("searchParams"));
    let searchList = null;
    if (searchParams && searchParams.length !== 0) {
      searchList = (
        <div id="search-list-container">
          <div id="search-list">
            <p id="header">La mia lista</p>
            {searchParams.map(param => {
              return (
                <div
                  className="list-container"
                  key={searchParams.indexOf(param)}
                >
                  <p className="list">{param.ui}</p>
                  <p
                    id={param.ui}
                    className="list-delete"
                    title="elimina"
                    onClick={this.handleDelete}
                  >
                    -
                  </p>
                </div>
              );
            })}
            <Link
              to="/results"
              id="search-list-proceed"
              className="submit"
              onClick={this.proceed}
            >
              PROSEGUI
            </Link>
          </div>
        </div>
      );
    }

    const inputPlaceholder =
      this.props.booksResult.length === 0
        ? "cerca il primo libro"
        : "cercane un altro";

    const loaded = (
      <div id="body-container">
        <div id="input-container">
          <form onSubmit={this.handleSubmit} id="input-form">
            <input
              autoComplete="off"
              id="title"
              className={this.state.inputClass}
              type="text"
              onChange={this.handleChange}
              placeholder={inputPlaceholder}
            />
            <input type="submit" className="hidden" />
          </form>
          <p
            id="input-submit"
            className={`${this.state.submitDisplay} submit`}
            onClick={this.handleSubmit}
          >
            CERCA
          </p>
        </div>
        {searchList}
      </div>
    );

    const loading = <h1 id="loading">loading</h1>;

    const bodyComponent = this.state.loading ? loading : loaded;

    return (
      <div id="search">
        <div id="image">
          <span id="image-title">CERCA TUTTI I LIBRI CHE TI SERVONO</span>
        </div>
        {bodyComponent}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    booksResult: state.booksResult
  };
};

export default connect(mapStateToProps)(Search);

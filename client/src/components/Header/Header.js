import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import mainLogo from "../../images/logo-short-small.png";
import "./Header.css";

// components
import SlideBar from "../slideBar/slideBar";
import BookInfo from "../BookInfo/BookInfo";
import Cart from "../cart/cart";

class Header extends Component {
  state = {
    slideBarHidden: true,
    BookInfoDisplay: "hidden",
    ui: null,
    quickSearchDisplay: null,
    searChInputClass: null,
    loading: false,
    cartHidden: true,
    searched: false,
    quickSearchLabelMessage: null
  };

  componentDidMount = () => {
    if (sessionStorage.getItem("selling")) {
      // was selling and refreshed
      this.setState({ BookInfoDisplay: null });
    }
    if (sessionStorage.getItem("SBs")) {
      // something selected
      if (this.props.selectedBooks.length === 0) {
        // refreshed
        const body = {
          _ids: JSON.parse(sessionStorage.getItem("SBs"))
        };
        fetch("/api/book//generalFetch/ID", {
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
              // perfect
              this.props.dispatch({ type: "SB-SET", books: jsonRes.results });
            } else {
              // error
              this.props.dispatch({
                type: "E-SET",
                error: { frontendPlace: "Header/componentDidMount/code1" }
              });
              sessionStorage.removeItem("SBs");
              sessionStorage.removeItem("searchParams");
              this.props.history.push("/error");
            }
          })
          .catch(error => {
            // DELETE AFTER CHECK
            console.log(error);
            // store and redirect
            this.props.dispatch({
              type: "E-SET",
              error: { frontendPlace: "Header/componentDidMount/catch" }
            });
            sessionStorage.removeItem("SBs");
            sessionStorage.removeItem("searchParams");
            this.props.history.push("/error");
          });
      }
    }
  };

  componentDidUpdate = () => {
    // remove searchParams
    const location = this.props.history.location.pathname;
    if (
      location !== "/search" &&
      location !== "/results" &&
      location !== "/login/buying" &&
      location !== "/register/buying" &&
      location !== "/checkout" &&
      location !== "/paymentConfirm"
    ) {
      // remove everything
      sessionStorage.removeItem("searchParams");
      sessionStorage.removeItem("SBs");
      sessionStorage.removeItem("__cds_Ids");
      sessionStorage.removeItem("dealId");
      if (this.props.selectedBooks.length !== 0) {
        this.props.dispatch({ type: "SB-DELETE-ALL" });
      }
      if (this.props.booksResult.length !== 0) {
        this.props.dispatch({ type: "R-DELETE-ALL" });
      }
    }
    // index in sessionStorage
    if (
      sessionStorage.getItem("index") &&
      this.props.history.location.pathname !== "/results"
    ) {
      sessionStorage.removeItem("index");
    }
    // search Display
    if (
      (this.props.history.location.pathname === "/results" ||
        this.props.history.location.pathname === "/checkout") &&
      !this.state.quickSearchDisplay
    ) {
      // searching
      this.setState({ quickSearchDisplay: "button" });
    } else if (
      this.state.quickSearchDisplay &&
      this.props.history.location.pathname !== "/results" &&
      this.props.history.location.pathname !== "/checkout"
    ) {
      this.setState({ quickSearchDisplay: null });
    }
  };

  toggleDisplayCart = () => {
    this.setState({
      cartHidden: !this.state.cartHidden
    });
  };

  toggleDisplay = () => {
    if (!this.props.user.DeliveryInfo) {
      // not logged
      this.props.history.push("/login");
    } else {
      if (this.state.BookInfoDisplay === "hidden") {
        sessionStorage.setItem("selling", true);
        this.setState({ BookInfoDisplay: null });
      } else {
        sessionStorage.removeItem("selling");
        this.setState({ BookInfoDisplay: "hidden" });
      }
    }
  };

  toggleSlideBar = () => {
    this.setState({
      slideBarHidden: !this.state.slideBarHidden
    });
  };

  hideSlidebar = () => {
    this.setState({
      slideBarHidden: true
    });
  };

  handleLogout = () => {
    if (sessionStorage.getItem("JWT")) {
      sessionStorage.removeItem("JWT");
    } else if (localStorage.getItem("JWT")) {
      localStorage.removeItem("JWT");
    }
    this.props.dispatch({ type: "LOGOUT" });
    this.props.history.push("/");
  };

  handleSearchChange = e => {
    this.setState({ ui: e.target.value, searChInputClass: null });
    if (this.state.quickSearchLabelMessage) {
      this.setState({ quickSearchLabelMessage: null });
    }
  };

  handleSearchSubmit = e => {
    e.preventDefault();
    if (this.state.ui) {
      let alreadySearched = false;
      if (sessionStorage.getItem("searchParams")) {
        JSON.parse(sessionStorage.getItem("searchParams")).forEach(param => {
          if (param.ui === this.state.ui) {
            alreadySearched = true;
          }
        });
      }
      if (alreadySearched) {
        this.setState({
          searChInputClass: "invalid-input",
          quickSearchLabelMessage: "Già hai cercato questo libro"
        });
      } else {
        let cityFilter = null;
        let schoolfilter = null;
        if (this.props.user.place) {
          // logged
          if (this.props.user.place.city) {
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
        this.setState({ loading: true, searchedAway: true });
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
              this.setState({
                searChInputClass: "invalid-input",
                quickSearchLabelMessage: jsonRes.message
              });
              setTimeout(() => {
                this.setState({
                  searChInputClass: null,
                  quickSearchLabelMessage: null
                });
              }, 1000);
            } else if (jsonRes.code === 0 || jsonRes.code === 2.5) {
              // redirect
              this.props.history.push("/search");
              // store and redirect
              // store searchParams in sessionStorage
              if (sessionStorage.getItem("searchParams")) {
                // already searched
                let paramsArray = JSON.parse(
                  sessionStorage.getItem("searchParams")
                );
                paramsArray.push(searchParams);
                sessionStorage.setItem(
                  "searchParams",
                  JSON.stringify(paramsArray)
                );
              } else {
                sessionStorage.setItem(
                  "searchParams",
                  JSON.stringify([searchParams])
                );
              }
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
            } else {
              // error
              this.props.dispatch({
                type: "E-SET",
                error: {
                  frontendPlace: "header/searchBar/handleSubmit/code1",
                  jsonRes
                }
              });
              sessionStorage.removeItem("searchParams");
              this.props.history.push("/error");
            }
            this.setState({
              loading: false,
              ui: null
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
    }
  };

  render() {
    // 3rd Icon choice
    const cart = (
      <div id="cart-gContainer" className="header-component">
        <div
          id="cart-container"
          className={`promptIcon ${this.state.cartHidden ? "" : "clicked"}`}
          onClick={this.toggleDisplayCart}
        >
          <i className="fas fa-shopping-cart"></i>
        </div>
        <Cart
          toggleDisplay={this.toggleDisplayCart}
          hidden={this.state.cartHidden}
        />
      </div>
    );
    const sell = (
      <div
        id="quickSell"
        className="header-component promptIcon"
        onClick={this.toggleDisplay}
      >
        <span id="header-sell-prompt">VENDI </span>
        <i className="fas fa-plus"></i>
      </div>
    );
    let promptIcon = this.props.selectedBooks.length > 0 ? cart : sell;
    if (this.props.history.location.pathname === "/checkout") promptIcon = null;
    if (this.props.history.location.pathname === "/paymentConfirm")
      promptIcon = sell;

    // search input
    const searchInput = this.state.loading ? (
      <p id="loading-input">loading...</p>
    ) : (
      <input
        autoComplete="off"
        type="text"
        id="title-input"
        onChange={this.handleSearchChange}
        className={this.state.searChInputClass}
        defaultValue={this.state.ui}
        placeholder="Cerca"
      />
    );

    const quickSearchButton = (
      <div
        id="search-prompt"
        className="header-component"
        onClick={() => {
          this.props.history.push("/search");
        }}
      >
        <i className="fas fa-search"></i>
        <p id="search-header">CERCA ANCORA</p>
      </div>
    );

    const quickSearchBarInner = (
      <div
        id="quickSearch-general-container"
        className="header-component quick-search"
      >
        <form
          id="searchBar-form"
          className="searchBar-input input-real"
          onSubmit={this.handleSearchSubmit}
        >
          <label htmlFor="title-input">
            <i
              id="quickSearch-ico"
              className="fas fa-search searchBar-input"
              // onClick={this.handleSearchSubmit}
            ></i>
          </label>
          {searchInput}
          <input type="submit" className="hidden" />
        </form>
        <label
          htmlFor="text"
          id="quickSearch-label"
          className={this.state.quickSearchLabelMessage ? "" : "hidden"}
        >
          {this.state.quickSearchLabelMessage}
        </label>
      </div>
    );

    const quickSearch =
      this.state.quickSearchDisplay === "button"
        ? quickSearchButton
        : quickSearchBarInner;

    return (
      <div id="header-gContainer">
        <div id="header-container">
          <img
            src={mainLogo}
            alt="header logo"
            id="header-image-logo"
            onClick={() => this.props.history.push("/")}
          />
          {quickSearch}
          {promptIcon}
          <div id="slidebar-prompt">
            <i
              id="slidebar-prompt-icon"
              className={`fas fa-${
                this.state.slideBarHidden ? "book" : "book-open"
              } fa-2x`}
              onClick={this.toggleSlideBar}
            ></i>
            <SlideBar
              user={this.props.user}
              hidden={this.state.slideBarHidden}
              toggleSlideBar={this.toggleSlideBar}
              handleLogout={this.handleLogout}
              hideSlidebar={this.hideSlidebar}
            />
          </div>
          <BookInfo
            display={this.state.BookInfoDisplay}
            toggleDisplay={this.toggleDisplay}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    selectedBooks: state.selectedBooks,
    user: state.user,
    booksResult: state.booksResult
  };
};

export default connect(mapStateToProps)(withRouter(Header));

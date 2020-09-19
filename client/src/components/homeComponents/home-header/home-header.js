import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "react-slidedown/lib/slidedown.css";
import "./home-header.css";

import imageSrc from "../../../images/logo-black.png";
import LoadingS from "../../Loading/loading_s";
import BookInfo from "../../BookInfo/BookInfo";
import SlideBar from "../../slideBar/slideBar";
import Cart from "../../cart/cart";

// interface DropdownProps {
//   open: boolean;
//   overlay: boolean;
//   alwaysRender: boolean;
//   itemCount: number;
// }

// class HomeHeader extends Component<DropdownProps> {
class HomeHeader extends Component {
  state = {
    loading: false,
    imageDisplay: "hiddenVisibility",
    ui: null,
    quickSearchLabelMessage: "",
    slideBarHidden: true,
    cartHidden: true
  };

  toggleDisplayCart = () => {
    this.setState({
      cartHidden: !this.state.cartHidden
    });
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
    this.setState({ ui: e.target.value });
  };

  handleSubmit = e => {
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
              this.setState({
                quickSearchLabelMessage: jsonRes.message
              });
              setTimeout(() => {
                this.setState({
                  quickSearchLabelMessage: null
                });
              }, 2000);
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
              // !!!!!!! IN CASE GENERAL LOADING DOESN'T WORK, JUST UNCOMMENT THIS!
              // this.props.history.push("/results");
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
                  frontendPlace: "home-header/handleSubmit/code1:127",
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
                frontendPlace: "home-header/searchBar/handleSubmit/catch:144",
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
    // first Nav config
    let firstNavClass =
      this.props.selectedBooks.length > 0 ? null : "hiddenVisibility";

    const firstNav = (
      <div
        id="cart-container"
        onClick={this.toggleDisplayCart}
        className={`header-nav  ${
          this.state.cartHidden ? "" : "clicked"
        } ${firstNavClass}`}
      >
        <i className="nav-text fas fa-shopping-cart"></i>
        <Cart
          toggleDisplay={this.toggleDisplayCart}
          hidden={this.state.cartHidden}
        />
      </div>
    );
    return (
      <div id="hh">
        <BookInfo
          display={this.props.bookInfoDisplay}
          toggleDisplay={this.props.toggleBookInfoDisplay}
        />
        <div id="hh-contained">
          <div id="hh-header-container">
            <img
              id="image"
              src={imageSrc}
              alt="libridoo logo"
              onClick={() => this.props.history.push("/")}
              onLoad={() => this.setState({ imageDisplay: "" })}
            />

            <div id="header-navs">
              {firstNav}
              <p
                className="header-nav"
                onClick={this.props.toggleBookInfoDisplay}
              >
                VENDI
              </p>
              {sessionStorage.getItem("JWT") || localStorage.getItem("JWT") ? (
                <div
                  id="slidebar-nav"
                  className={`header-nav ${
                    this.state.slideBarHidden ? "" : "clicked"
                  }`}
                  onClick={this.toggleSlideBar}
                >
                  MENU
                  <SlideBar
                    user={this.props.user}
                    hidden={this.state.slideBarHidden}
                    toggleSlideBar={this.toggleSlideBar}
                    handleLogout={this.handleLogout}
                    hideSlidebar={this.hideSlidebar}
                    hiderSlidebar={this.props.hiderSlidebar}
                  />
                </div>
              ) : (
                <p
                  id="login-suggester"
                  className="header-nav"
                  onClick={() => this.props.history.push("/login")}
                >
                  LOGIN <i className="fas fa-sign-in-alt"></i>
                </p>
              )}
            </div>
          </div>
          <p id="use-explainer">VENDI E COMPRA I TUOI LIBRI UNIVERSITARI</p>
          <div id="search-container">
            <p id="search-header">COSA STAI CERCANDO?</p>
            {this.state.loading ? (
              <div id="search-input-loading">
                <LoadingS /> <span id="loading-text">un secondo...</span>
              </div>
            ) : (
              <form onSubmit={this.handleSubmit}>
                <input
                  id="search-input"
                  type="text"
                  autoComplete="OFF"
                  onChange={this.handleSearchChange}
                  placeholder="titolo"
                />
                <input type="submit" className="hidden" />
              </form>
            )}

            <p
              id="error"
              className={
                this.state.quickSearchLabelMessage ? null : "hiddenVisibility"
              }
            >
              {this.state.quickSearchLabelMessage || "errore"}
            </p>
          </div>
          <p id="search-submit" onClick={this.handleSubmit}>
            CERCA
          </p>
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

export default connect(mapStateToProps)(withRouter(HomeHeader));

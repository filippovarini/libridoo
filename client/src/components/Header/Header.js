import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./Header.css";

// image
import imageSrc from "../../images/logo-white.png";

// components
import SlideBar from "../slideBar/slideBar";
import Cart from "../cart/cart";

class Header extends Component {
  state = {
    slideBarHidden: true,
    ui: null,
    quickSearchDisplay: null,
    searChInputClass: null,
    loading: false,
    cartHidden: true,
    searched: false,
    quickSearchLabelMessage: null,
    headerDisplay: "hidden",
    location: "/"
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
        fetch("/api/book/generalFetch/ID", {
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
    if (window.location.pathname !== "/")
      this.setState({
        headerDisplay: null
      });
  };

  componentDidUpdate = () => {
    // show header if not home
    if (this.state.location !== window.location.pathname) {
      window.scrollTo(0, 0);
      // just redirected

      if (window.location.pathname !== "/" && this.state.headerDisplay)
        this.setState({
          headerDisplay: null,
          location: window.location.pathname
        });
      else if (window.location.pathname === "/" && !this.state.headerDisplay) {
        this.setState({
          headerDisplay: "hidden",
          location: window.location.pathname
        });
      }
    }

    if (
      window.location.pathname === "/" &&
      window.pageYOffset < 60 &&
      this.state.headerDisplay !== "hidden"
    ) {
      this.setState({
        headerDisplay: "hidden",
        location: window.location.pathname
      });
    }
    // remove searchParams
    const location = this.props.history.location.pathname;

    if (
      location !== "/search" &&
      location !== "/results" &&
      location !== "/orderReview" &&
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
    if (
      location !== "/checkout" &&
      location !== "/orderReview" &&
      location !== "/login/buying" &&
      location !== "/register/buying"
    ) {
      sessionStorage.removeItem("coupon");
    }
    if (location !== "/checkout") {
      sessionStorage.removeItem("client_secret");
      sessionStorage.removeItem("transfer_group");
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
        this.props.history.location.pathname === "/orderReview" ||
        this.props.history.location.pathname === "/search" ||
        this.props.history.location.pathname === "/checkout" ||
        this.props.history.location.pathname === "/paymentConfirm") &&
      !this.state.quickSearchDisplay
    ) {
      // searching
      this.setState({ quickSearchDisplay: "enabled" });
    } else if (
      this.state.quickSearchDisplay &&
      this.props.history.location.pathname !== "/results" &&
      this.props.history.location.pathname !== "/orderReview" &&
      this.props.history.location.pathname !== "/search" &&
      this.props.history.location.pathname !== "/checkout" &&
      this.props.history.location.pathname !== "/paymentConfirm"
    ) {
      this.setState({ quickSearchDisplay: null });
    }
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

  handleScroll = action => {
    if (action === "show" && this.state.headerDisplay) {
      this.setState({
        headerDisplay: ""
      });
      this.props.headerWinning(true);
    }
    if (action === "hide" && !this.state.headerDisplay) {
      this.setState({
        headerDisplay: "hidden"
      });
      this.props.headerWinning(false);
    }
  };

  render() {
    document.onscroll = () => {
      if (window.location.pathname === "/") {
        if (window.pageYOffset > 60 && this.state.headerDisplay)
          this.handleScroll("show");
        else if (window.pageYOffset < 60 && !this.state.headerDisplay)
          this.handleScroll("hide");
      }
    };
    const searchMore = (
      <p
        id="searchMore"
        onClick={() => {
          this.props.history.push("/search");
        }}
        className="nav nav-text"
      >
        CERCA
      </p>
    );

    const sell = (
      <p
        id="sell-prompt"
        className="nav nav-text"
        onClick={this.props.toggleBookInfo}
      >
        VENDI{" "}
      </p>
    );

    const menu = (
      <div
        id="menu"
        className={`nav ${this.state.slideBarHidden ? null : "clicked"}`}
      >
        <p className="nav-text" onClick={this.toggleSlideBar}>
          MENU
        </p>
        <SlideBar
          user={this.props.user}
          hidden={this.state.slideBarHidden}
          toggleSlideBar={this.toggleSlideBar}
          handleLogout={this.handleLogout}
          hideSlidebar={this.hideSlidebar}
        />
      </div>
    );

    const login = (
      <p
        className="nav nav-text"
        onClick={() => this.props.history.push("/login")}
      >
        LOGIN
        <i className="fas fa-sign-in-alt"></i>
      </p>
    );

    // first Nav config
    let firstNavClass =
      this.props.selectedBooks.length > 0 ? null : "hiddenVisibility";
    if (this.props.history.location.pathname === "/checkout")
      firstNavClass = "hiddenVisibility";

    const firstNav =
      firstNavClass === "hiddenVisibility" ? (
        sell
      ) : (
        <div
          id="cart-container"
          onClick={this.toggleDisplayCart}
          className={`nav  ${
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

    // second Nav
    let secnodNav = searchMore;

    // third NAv
    const thirdNav =
      sessionStorage.getItem("JWT") || localStorage.getItem("JWT")
        ? menu
        : login;

    return (
      <div id="hc" className={this.state.headerDisplay}>
        <div id="contained">
          <div
            id="logo-container"
            onClick={() => {
              this.props.history.push("/");
            }}
          >
            <img id="logo" alt="libridoo logo" src={imageSrc} />
          </div>
          <div id="navs-container">
            {firstNav}
            {secnodNav}
            {thirdNav}
          </div>
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

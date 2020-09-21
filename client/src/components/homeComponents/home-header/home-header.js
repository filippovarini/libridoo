import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./home-header.css";

import imageSrc from "../../../images/logo-black.png";
import LoadingS from "../../Loading/loading_s";
import BookInfo from "../../BookInfo/BookInfo";
import SlideBar from "../../slideBar/slideBar";
import Cart from "../../cart/cart";
import EmailPopUp from "../../emailPopUp/emailPopUp";
import InsertPopUp from "../../insertPopUp/insertPopUp";

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
    cartHidden: true,
    emailPPSuccess: false,
    emailPPHidden: true,
    ppLoading: false,
    IpHidden: true,
    IpLoading: false
  };

  componentDidMount = () => {
    if (this.props.user._id && !this.props.user.popUpSeen) {
      this.setState({ IpHidden: false });
    }
  };

  toggleEmailPP = () => {
    this.setState({ emailPPHidden: !this.state.emailPPHidden });
  };

  toggleIp = () => {
    // request
    this.setState({ IpLoading: true });
    fetch("/api/user/seen", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ _id: this.props.user._id })
    })
      .then(res => res.json())
      .then(jsonRes => {
        // regardless of success
        if (jsonRes.code === 0) {
          this.props.dispatch({ type: "SET-USER", user: jsonRes.activeUser });
          if (sessionStorage.getItem("JWT")) {
            // not rememberME
            sessionStorage.setItem("JWT", jsonRes.JWT);
          } else {
            // rememberMe, localStorage
            localStorage.setItem("JWT", jsonRes.JWT);
          }
          window.location = "/";
        } else {
          this.setState({ IpHidden: true });
        }
      })
      .catch(error => {
        // still nevermind
        console.log(error);
      });
  };

  contactMe = email => {
    const body = {
      title: this.state.ui,
      email
    };
    fetch("/api/book/notFound", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
      .then(() => {
        // nevermind if done or not!
        // if (!this.state.emailPPHidden) {
        // showing
        this.setState({ emailPPSuccess: true, emailPPHidden: false });
        setTimeout(
          () =>
            this.setState({
              emailPPSuccess: false,
              emailPPHidden: true,
              ppLoading: false
            }),
          2000
        );
        // }
      })
      .catch(error => {
        console.log(error);
        if (!this.state.emailPPHidden) {
          this.setState({ emailPPSuccess: true, emailPPHidden: false });
          setTimeout(
            () =>
              this.setState({
                emailPPSuccess: false,
                emailPPHidden: true,
                ppLoading: false
              }),
            2000
          );
        }
      });
    // request
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
    this.setState({ ui: e.target.value, quickSearchLabelMessage: null });
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
              loading: false
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
            <EmailPopUp
              success={this.state.emailPPSuccess}
              display={this.state.emailPPHidden ? "hidden" : null}
              contactMe={this.contactMe}
              toggleEmailPP={this.toggleEmailPP}
              ppLoading={this.state.ppLoading}
            />
            <InsertPopUp
              IpDisplay={this.state.IpHidden ? "hidden" : null}
              toggleIp={this.toggleIp}
              loading={this.state.IpLoading}
            />
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
            {this.state.quickSearchLabelMessage === "Nessun libro trovato" ? (
              <p
                id="error"
                className={
                  this.state.quickSearchLabelMessage ? null : "hiddenVisibility"
                }
              >
                Libro non in vendita.{" "}
                <span
                  id="contactMe"
                  onClick={() => {
                    if (this.props.user.email)
                      this.contactMe(this.props.user.email);
                    else this.toggleEmailPP();
                  }}
                >
                  Contattami appena è disponibile
                </span>
              </p>
            ) : (
              <p
                id="error"
                className={
                  this.state.quickSearchLabelMessage ? null : "hiddenVisibility"
                }
              >
                {this.state.quickSearchLabelMessage}
              </p>
            )}
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

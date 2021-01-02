import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";

// components
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

// pages
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Recover from "./pages/Recover/Recover";
import Search from "./pages/Search/Search";
import Results from "./pages/Results/Results";
import CheckoutReview from "./pages/CheckoutReview/CheckoutReview";
// import Checkout from "./pages/Checkout/Checkout";
import Checkout from "./pages/Checkout/CheckoutRenderer";
import PaymentConfirm from "./pages/PaymentConfirm/PaymentConfirm";
import sellReview from "./pages/InfoReview/sell/sellReview";
import buyReview from "./pages/InfoReview/buy/buyReview";
import Account from "./pages/Account//Account";
import Orders from "./pages/Orders/Orders";
import Deals from "./pages/Deals/Deals";
import Invite from "./pages/Invite/Invite";
import Feedback from "./pages/Feedback/Feedback";
import FAQs from "./pages/FAQs/FAQs";
import ErrorPage from "./pages/Error/Error";
import Privacy from "./pages/Pricacy/Privacy";
import TandC from "./pages/T&C/T&C";

// components
import BookInfo from "./components/BookInfo/BookInfo";

// ad Images
import adImageOne from "./pages/Invite/adImageOne";
import adImageTwo from "./pages/Invite/adImageTwo";
import adImageThree from "./pages/Invite/adImageThree";

class App extends React.Component {
  state = {
    BookInfoDisplay: "hidden",
    headerWinning: false,
    book: null
  };

  componentDidMount = () => {
    let storePlace = null;
    let token = null;
    let jwtFound = false;
    if (!this.props.user.name) {
      if (sessionStorage.getItem("JWT")) {
        // just refreshed
        storePlace = "sessionStorage";
        token = sessionStorage.getItem("JWT");
        jwtFound = true;
      } else if (localStorage.getItem("JWT")) {
        // remember me
        storePlace = "localStorage";
        token = localStorage.getItem("JWT");
        jwtFound = true;
      }
    }
    if (jwtFound) {
      fetch("/api/user/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ token })
      })
        .then(res => res.json())
        .then(jsonRes => {
          if (jsonRes.code === 1) {
            // error
            this.props.dispatch({
              type: "E-SET",
              error: { frontendPlace: "App/componentDidMount/code1" }
            });
            this.props.history.push("/error");
          } else if (jsonRes.code === 0) {
            // perfect
            this.props.dispatch({ type: "SET-USER", user: jsonRes.activeUser });
            if (storePlace === "localStorage") {
              localStorage.setItem("JWT", jsonRes.JWT);
            } else {
              sessionStorage.setItem("JWT", jsonRes.JWT);
            }
          } else {
            // expired
            if (storePlace === "localStorage") {
              localStorage.removeItem("JWT");
            } else {
              sessionStorage.removeItem("JWT");
            }
          }
        })
        .catch(error => {
          console.log(error);
          // store error and redirect
          // fetch("/api/feedback/error", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //     Accept: "application/json"
          //   },
          //   body: JSON.stringify({
          //     frontendPlace: "App/componentDidMount/catch"
          //   })
          // });
        });
    }
  };

  // bookInfo
  toggleBookInfo = book => {
    if (!this.props.user.DeliveryInfo) {
      // not logged
      window.location = "/login";
    } else {
      document.getElementById("bookInfo-form").reset();
      if (this.state.BookInfoDisplay === "hidden") {
        sessionStorage.setItem("selling", true);
        this.setState({ BookInfoDisplay: null });
      } else {
        sessionStorage.removeItem("selling");
        this.setState({ BookInfoDisplay: "hidden" });
      }
    }
    if (book && Object.keys(book).length < 10) {
      // editing
      this.setState({ book });
    } else {
      this.setState({ book: null });
    }
  };

  // bring back to false headerWinning (for double header)
  resetSlideBarHidden = () => {
    this.setState({ hideSlidebar: false });
  };

  headerWinning = value => {
    if (this.state.headerWinning !== value) {
      this.setState({ headerWinning: value });
    }
  };

  render() {
    console.log(this.state.book);
    return (
      <BrowserRouter>
        <div className="App">
          <Header
            toggleBookInfo={this.toggleBookInfo}
            headerWinning={this.headerWinning}
          />
          <BookInfo
            display={this.state.BookInfoDisplay}
            toggleDisplay={this.toggleBookInfo}
            book={this.state.book}
          />
          <div id="app-body">
            <Route
              exact
              path="/"
              render={() => (
                <Home
                  hideHomeSlidebar={this.state.headerWinning}
                  toggleBookInfo={this.toggleBookInfo}
                  editing={this.state.bookEditing}
                />
              )}
            />
            <Route path="/login/:action?" component={Login} />
            <Route path="/register/:invitingId?" component={Register} />
            <Route path="/recover" component={Recover} />
            <Route path="/search" component={Search} />
            <Route exact path="/results" component={Results} />
            <Route path="/orderReview" component={CheckoutReview} />
            <Route exact path="/checkout" component={Checkout} />
            <Route path="/paymentConfirm" component={PaymentConfirm} />
            <Route path="/infoReviewSell" component={sellReview} />
            <Route path="/infoReviewBuy" component={buyReview} />
            <Route path="/account" component={Account} />
            <Route path="/orders" component={Orders} />
            <Route
              path="/deals"
              render={() => (
                <Deals
                  toggleBookInfo={this.toggleBookInfo}
                  display={this.state.BookInfoDisplay}
                />
              )}
            />
            <Route path="/invite" component={Invite} />
            <Route path="/feedback" component={Feedback} />

            <Route path="/FAQs" component={FAQs} />
            <Route path="/error" component={ErrorPage} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/termsAndConditions" component={TandC} />
            <Route path="/adImageOne" component={adImageOne} />
            <Route path="/adImageTwo" component={adImageTwo} />
            <Route path="/adImageThree" component={adImageThree} />
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps)(App);

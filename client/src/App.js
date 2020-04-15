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
import Search from "./pages/Search/Search";
import Results from "./pages/Results/Results";
import Checkout from "./pages/Checkout/Checkout";
import PaymentConfirm from "./pages/PaymentConfirm/PaymentConfirm";
import sellReview from "./pages/InfoReview/sell/sellReview";
import buyReview from "./pages/InfoReview/buy/buyReview";
import Account from "./pages/Account//Account";
import Orders from "./pages/Orders/Orders";
import Deals from "./pages/Deals/Deals";
import Invite from "./pages/Invite/Invite";
import Help from "./pages/Help/Help";
import ErrorPage from "./pages/Error/Error";

class App extends React.Component {
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
            if (storePlace === "localStorage") {
              localStorage.removeItem("JWT");
            } else {
              sessionStorage.removeItem("JWT");
            }
          }
        })
        .catch(error => {
          alert("errro");
          console.log(error);
          // store error and redirect
          fetch("/api/feedback/error", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({
              frontendPlace: "App/componentDidMount/catch"
            })
          });
        });
    }
  };
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Header />
          <div id="app-body">
            <Route exact path="/" component={Home} />
            <Route path="/login/:action?" component={Login} />
            <Route path="/register/:invitingId?" component={Register} />
            <Route path="/search" component={Search} />
            <Route exact path="/results" component={Results} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/paymentConfirm" component={PaymentConfirm} />
            <Route path="/infoReview/sell" component={sellReview} />
            <Route path="/infoReview/buy" component={buyReview} />
            <Route path="/account" component={Account} />
            <Route path="/orders" component={Orders} />
            <Route path="/deals" component={Deals} />
            <Route path="/invite" component={Invite} />
            <Route path="/help" component={Help} />
            <Route path="/error" component={ErrorPage} />
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

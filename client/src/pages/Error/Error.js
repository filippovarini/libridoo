import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import "./Error.css";

class Error extends Component {
  state = {
    loading: false,
    message: null
  };

  componentDidMount = () => {
    if (Object.keys(this.props.error).length === 0) {
      //   redirect to previous page
      this.props.history.push("/");
    } else {
      // can stay here
      this.setState({
        message: this.props.error.jsonRes
          ? this.props.error.jsonRes.message || null
          : null
      });
      // clear all storage
      let JWT = null;
      let isLocal = true;
      if (sessionStorage.getItem("JWT")) {
        JWT = sessionStorage.getItem("JWT");
        isLocal = false;
      } else if (localStorage.getItem("JWT")) {
        JWT = localStorage.getItem("JWT");
      }
      localStorage.clear();
      sessionStorage.clear();
      if (isLocal) {
        localStorage.setItem("JWT", JWT);
      } else {
        localStorage.setItem("JWT", JWT);
      }
      // post error
      fetch("/api/feedback/error", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(this.props.error)
      })
        .then(res => res.json())
        .then(jsonRes => {
          if (jsonRes.code === 0) {
            this.setState({
              loading: false
            });
            // empty error state
            this.props.dispatch({ type: "E-DELETE" });
            // delete it after
          } else {
            console.log(jsonRes);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  render() {
    //   while request, loading
    const loading = (
      <div id="error-container" className="height-set">
        <div id="alfa" className="loadingio-spinner-fidget-spinner-rpnwi4xirv">
          <div className="ldio-xj4o7xwbsdb">
            <div>
              <div>
                <div style={{ left: "33.835px", top: "5.555px" }}></div>
                <div style={{ left: "9.595px", top: "47.47px" }}></div>
                <div style={{ left: "58.075px", top: "47.47px" }}></div>
              </div>
              <div>
                <div style={{ left: "43.935px", top: "15.655px" }}></div>
                <div style={{ left: "19.695px", top: "57.57px" }}></div>
                <div style={{ left: "68.175px", top: "57.57px" }}></div>
              </div>
              <div style={{ left: "33.835px", top: "33.835px" }}></div>
              <div>
                <div
                  style={{
                    left: "37.875px",
                    top: "30.3px",
                    transform: "rotate(-20deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "58.075px",
                    top: "30.3px",
                    transform: "rotate(20deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "29.29px",
                    top: "45.45px",
                    transform: "rotate(80deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "39.39px",
                    top: "62.115px",
                    transform: "rotate(40deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "66.66px",
                    top: "45.45px",
                    transform: "rotate(100deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "56.56px",
                    top: "62.115px",
                    transform: "rotate(140deg)"
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    const display = (
      <div id="error-container">
        <p id="error-body">
          {this.state.message ||
            "Qualcosa è andato storto nel browser. Assicurati di avere una connessione stabile."}
        </p>
        <p id="error-retry">
          Ti consigliamo di riprovare. Se il problema persiste, non esitare a
          contattarci
        </p>
        <Link id="error-link" to="/">
          HOME
        </Link>
      </div>
    );
    const errorComponent = this.state.loading ? loading : display;
    return (
      <div id="error">
        <div id="error-image-container">
          {/* <p id="error-fake-header">ERRORE</p> */}
          <img
            id="libridoo-logo-image"
            src="./images/logo-long.png"
            alt="logo"
          />
        </div>
        <div>
          <p id="error-header">Houston, we got a problem!</p>
        </div>
        {errorComponent}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    error: state.error
  };
};

export default connect(mapStateToProps)(Error);

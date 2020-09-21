import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import HeaderPart from "../../components/headerPart";
import "./Error.css";

import LoadingM from "../../components/Loading/loading_m";

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
          : this.props.error.message || null
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
      if (!this.props.error.noSave) {
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
      } else {
        console.log("not saving");
      }
    }
  };

  render() {
    //   while request, loading
    const loading = (
      <div id="error-container" className="height-set">
        <LoadingM />
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
        <HeaderPart
          title={"ERRORE"}
          mainClass={"error"}
          imageId="libridoo-logo-image"
          headerClass=""
        />
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

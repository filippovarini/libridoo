import React, { Component } from "react";
import { connect } from "react-redux";
import "./Error.css";

class Error extends Component {
  state = {
    loading: true
  };
  componentDidMount = () => {
    if (Object.keys(this.props.error).length === 0) {
      //   redirect to previous page
      this.props.history.push("/");
    } else {
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
        });
    }
  };
  render() {
    //   while request, loading
    const loading = (
      <div>
        <h1>loading...</h1>
      </div>
    );
    const display = (
      <div>
        <h1>Errore!</h1>
      </div>
    );
    const errorComponent = this.state.loading ? loading : display;
    return errorComponent;
  }
}

const mapStateToProps = state => {
  return {
    error: state.error
  };
};

export default connect(mapStateToProps)(Error);

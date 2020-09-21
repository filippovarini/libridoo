import React, { Component } from "react";
import "./emailPopUp.css";

import LoadingS from "../Loading/loading_s";

class EmailPopUp extends Component {
  state = {
    email: null,
    errorHidden: true
  };

  emailValidation = email => {
    var re = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  handleChange = e => {
    this.setState({ email: e.target.value });
    if (this.state.errorHidden) {
      this.setState({ errorHidden: true });
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    if (!this.emailValidation(this.state.email)) {
      this.setState({ errorHidden: false });
    } else {
      this.setState({ loading: true });
      this.props.contactMe(this.state.email);
    }
  };

  render() {
    const editing = (
      <div id="ep">
        <i
          onClick={this.props.toggleEmailPP}
          className={`fas fa-times ${this.state.loading ? "hidden" : null}`}
        ></i>
        <p id="header">Contattami su</p>
        <p id="sub-header">
          Ti scriveremo non appena il libro sarà disponibile
        </p>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            onChange={this.handleChange}
            placeholder="email"
            id="email-ep"
          />
          <label
            id="errorLabel-ep"
            htmlFor="email-ep"
            className={this.state.errorHidden ? "hidden" : null}
          >
            Email errata
          </label>
          <input type="submit" className="hidden" />
        </form>
        {!this.props.ppLoading ? (
          <div id="submit" onClick={this.handleSubmit}>
            SALVA
          </div>
        ) : (
          <div id="submit" className="disabled">
            <LoadingS />
          </div>
        )}
      </div>
    );

    const success = (
      <div id="ep" className="success">
        <i className="fas fa-check"></i>
        <p id="success">
          Grazie! Ti contatteremo appena il tuo libro sarà disponibile.
        </p>
      </div>
    );

    const body = this.props.success ? success : editing;

    return (
      <div id="ep-container" className={this.props.display}>
        {body}
      </div>
    );
  }
}

export default EmailPopUp;

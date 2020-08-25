import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./emailConfirm.css";

class EmailConfirm extends Component {
  state = {
    inputCode: null,
    inputCodeClass: null,
    placeholder: "codice",
    requestSent: false,
    editing: false,
    newEmail: null,
    newEmailClass: null,
    newEmailPlaceholder: null,
    canResend: false,
    emailLabelMessage: null,
    codeLabelHidden: true,
    emailLoading: false,
    generalLoading: false
  };

  sendEmail = () => {
    fetch(
      `/api/user/emailConfirm/${
        JSON.parse(sessionStorage.getItem("registerBody")).email
      }`
    )
      .then(res => res.json())
      .then(jsonRes => {
        if (jsonRes.code === 1) {
          // store error in redux and redirect
          this.props.dispatch({
            type: "E-SET",
            error: {
              frontendPlace: "emailConfirm/componentDidUpdate/code1",
              jsonRes
            }
          });
          this.props.history.push("/error");
        } else {
          sessionStorage.setItem("hashedCode", jsonRes.hashedCode);
        }
      })
      .catch(error => {
        // store error in redux and redirect
        this.props.dispatch({
          type: "E-SET",
          error: {
            frontendPlace: "emailConfirm/componentDidUpdate/.catch",
            error
          }
        });
        this.props.history.push("/error");
      });
  };

  emailValidation = email => {
    var re = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  emailEdit = () => {
    this.setState({
      editing: true
    });
  };

  emailChange = e => {
    if (!e.target.value) {
      this.setState({
        newEmailClass: "invalid-input",
        newEmailPlaceholder: "*email*"
      });
    } else if (this.emailValidation(e.target.value)) {
      this.setState({ newEmailClass: "correct-input" });
    } else {
      this.setState({
        newEmailClass: null,
        emailLabelMessage: null
      });
    }
    this.setState({
      newEmail: e.target.value
    });
  };

  emailSubmit = e => {
    e.preventDefault();
    if (!this.emailValidation(this.state.newEmail)) {
      this.setState({
        newEmailClass: "invalid-input",
        emailLabelMessage: "Email non valida"
      });
    } else {
      this.setState({ emailLoading: true });
      // check email is not saved to another account
      fetch("/api/user/register/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ email: this.state.newEmail.toLowerCase() })
      })
        .then(res => res.json())
        .then(jsonRes => {
          if (jsonRes.code === 1) {
            this.props.dispatch({
              type: "E-SET",
              error: {
                frontendPlace: "emailConfirm/emailSubmit/code1",
                jsonRes
              }
            });
            this.props.history.push("/error");
          } else if (jsonRes.code === 2) {
            this.setState({
              newEmailClass: "invalid-input",
              emailLabelMessage: "Email già registrata con un altro account",
              emailLoading: false
            });
          } else {
            // everything correct
            // update registerBody
            let body = JSON.parse(sessionStorage.getItem("registerBody"));
            body.email = this.state.newEmail;
            sessionStorage.setItem("registerBody", JSON.stringify(body));
            this.setState({ editing: false, emailLoading: false });
            this.sendEmail();
          }
        })
        .catch(error => {
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "emailConfirm/emailSubmit/catch", error }
          });
          this.props.history.push("/error");
        });
    }
  };

  componentDidUpdate = () => {
    if (
      this.props.display !== "hiddem" &&
      !sessionStorage.getItem("requestSent") &&
      sessionStorage.getItem("emailSent") === "true"
    ) {
      sessionStorage.setItem("requestSent", "true");
      this.sendEmail();
    }
  };

  handleChange = e => {
    if (!e.target.value) {
      this.setState({
        inputCodeClass: "invalid-input",
        placeholder: "*codice*"
      });
    } else {
      this.setState({
        placeholder: "codice"
      });
    }
    this.setState({
      inputCode: e.target.value
    });
  };

  handleBlur = e => {
    if (!e.target.value) {
      this.setState({
        inputCodeClass: "invalid-input",
        placeholder: "*codice*"
      });
    }
  };

  register = () => {
    fetch("/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: sessionStorage.getItem("registerBody")
    })
      .then(res => res.json())
      .then(jsonRes => {
        sessionStorage.removeItem("emailSent");
        sessionStorage.removeItem("requestSent");
        sessionStorage.removeItem("hashedCode");
        sessionStorage.removeItem("registerBody");
        if (jsonRes.code === 1) {
          // error
          this.props.dispatch({
            type: "E-SET",
            error: {
              frontendPlace: "emailConfirm/register/code1",
              jsonRes
            }
          });
          this.props.history.push("/error");
        } else {
          // code = 3 || 0 -> correct, save user and JWT
          this.props.dispatch({ type: "SET-USER", user: jsonRes.activeUser });
          if (this.props.rememberMe) {
            localStorage.setItem("JWT", jsonRes.JWT);
          } else {
            sessionStorage.setItem("JWT", jsonRes.JWT);
          }
          const redirection =
            this.props.match.params.invitingId === "buying" ? "/checkout" : "/";
          this.props.history.push(redirection);
        }
      })
      .catch(error => {
        // store error in redux and redirect
        sessionStorage.removeItem("emailSent");
        sessionStorage.removeItem("requestSent");
        sessionStorage.removeItem("hashedCode");
        sessionStorage.removeItem("registerBody");
        this.props.dispatch({
          type: "E-SET",
          error: { frontendPlace: "emailConfirm/register/catch", error }
        });
        this.props.history.push("/error");
      });
  };

  handleResend = () => {
    this.setState({
      canResend: false
    });
    document.getElementById("inputCode").value = "";
    this.sendEmail();
  };

  handleSubmit = e => {
    //   submit
    e.preventDefault();
    this.setState({ generalLoading: true });
    fetch("/api/user/emailConfirm/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        hashed: sessionStorage.getItem("hashedCode"),
        code: this.state.inputCode
      })
    })
      .then(res => res.json())
      .then(jsonRes => {
        if (jsonRes.code === 1) {
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "emailConfirm/compare/sintax", jsonRes }
          });
          this.props.history.push("/error");
        } else {
          if (!jsonRes.response) {
            // wrong inputcode
            this.setState({
              canResend: true,
              codeLabelHidden: false,
              generalLoading: false
            });
          } else {
            //   correct inputcode
            this.setState({
              inputCodeClass: "correct-input",
              placeholder: "codice"
            });
            this.register();
          }
        }
      })
      .catch(error => {
        this.props.dispatch({
          type: "E-SET",
          error: { frontendPlace: "emailConfirm/compare", error }
        });
        this.props.history.push("/error");
      });
  };

  render() {
    const canShow = this.state.canResend ? null : "hidden";
    let address = null;
    if (sessionStorage.getItem("registerBody")) {
      address = this.state.editing ? (
        <div id="email-address-container">
          <form onSubmit={this.emailSubmit}>
            <label
              id="emailConfirm-emailLabel"
              htmlFor="input"
              className={this.state.emailLabelMessage ? "" : "hidden"}
            >
              {this.state.emailLabelMessage}
            </label>
            <input
              id="emailEdit-input"
              type="text"
              onChange={this.emailChange}
              className={`email ${this.state.newEmailClass}`}
              placeholder={
                this.state.newEmailPlaceholder ||
                JSON.parse(sessionStorage.getItem("registerBody")).email
              }
            />
            <span id="edit" onClick={this.emailSubmit}>
              salva
            </span>
            <input type="submit" className="hidden" />
          </form>
        </div>
      ) : (
        <div id="email-address-container">
          <span id="email" className="email">
            {JSON.parse(sessionStorage.getItem("registerBody")).email}
          </span>
          <span id="edit" onClick={this.emailEdit}>
            modifica email
          </span>
        </div>
      );
    }

    if (this.state.emailLoading) {
      address = (
        <div id="email-address-container">
          <span id="email" className="email">
            loading...
          </span>
        </div>
      );
    }

    const displayClass = sessionStorage.getItem("emailSent")
      ? null
      : this.props.display;

    const inputActions = !this.state.generalLoading ? (
      <div id="emailConfirm-input-actions">
        <span id="header">
          Inserisci il codice di conferma che ti abbiamo appena inviato
          all'indirizzo:
        </span>
        {address}
        <form id="inputCode-form" onSubmit={this.handleSubmit}>
          <label
            htmlFor="inputCode"
            id="emailConfirm-inputCode-label"
            className={this.state.codeLabelHidden ? "hidden" : ""}
          >
            codice errato
          </label>
          <input
            autoComplete="off"
            id="inputCode"
            type="text"
            placeholder={this.state.placeholder}
            className={`input text ${this.state.inputCodeClass}`}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
          />
          <span className={canShow} onClick={this.handleResend} id="resend">
            rimanda email
          </span>
          <input type="submit" value="CONFERMA" className="hidden" />
          <p id="code-submit" className="input" onClick={this.handleSubmit}>
            CONFERMA
          </p>
        </form>
      </div>
    ) : (
      <div id="emailConfirm-input-actions" className="height-set">
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

    return (
      <div id="emailConfirm-gContainer" className={displayClass}>
        <div id="emailConfirm-container">
          <div id="emailConfirm-image-container">
            <p id="emailConfirm-fake-header">CONFERMA</p>
            <img
              id="emailConfirm-libridoo-logo-image"
              src="./images/logo-long.png"
              alt="logo"
            />
          </div>
          {inputActions}
        </div>
      </div>
    );
  }
}

export default connect()(withRouter(EmailConfirm));

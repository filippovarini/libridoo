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
    canResend: false
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
        newEmailPlaceholder: "*campo obligatorio"
      });
    } else {
      this.setState({
        newEmailClass: null
      });
    }
    this.setState({
      newEmail: e.target.value
    });
  };

  emailSubmit = () => {
    if (!this.emailValidation(this.state.newEmail)) {
      this.setState({
        newEmailClass: "invalid-input"
      });
      alert("Indirizzo email non valido");
    } else {
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
              newEmailClass: "invalid-input"
            });
            alert("Email già registrata con un altro account");
          } else {
            // everything correct
            // update registerBody
            let body = JSON.parse(sessionStorage.getItem("registerBody"));
            body.email = this.state.newEmail;
            sessionStorage.setItem("registerBody", JSON.stringify(body));
            this.setState({ editing: false });
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
        placeholder: "*campo obbligatorio"
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
        placeholder: "*campo obbligatorio"
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
          console.log(this.props.match.params.invitingId);
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
            alert("Il codice inserito non è corretto");
            this.setState({ canResend: true });
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
          <input
            id="input"
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
    const displayClass = sessionStorage.getItem("emailSent")
      ? null
      : this.props.display;

    return (
      <div id="emailConfirm-gContainer" className={displayClass}>
        <div id="emailConfirm-container">
          <div id="confirm-prompt-image">
            <span id="confirm-prompt-header">CONFERMA</span>
          </div>
          <div id="emailConfirm-input-actions">
            <span id="header">
              Inserisci il codice di conferma che ti abbiamo appena inviato
              all'indirizzo:
            </span>
            {address}
            <form id="form" onSubmit={this.handleSubmit}>
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
              <input
                type="submit"
                id="submit"
                value="CONFERMA"
                className="input"
              />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(withRouter(EmailConfirm));

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import "./Login.css";

class Login extends Component {
  state = {
    email: null,
    password: null,
    rememberMe: true,
    emailFeedbackClass: null,
    passwordFeedbackClass: null,
    emailPlaceholder: "email",
    passwordPlaceholder: "password",
    emailLabelClass: "hidden",
    passwordLabelClass: "hidden",
    incorrect: null
  };

  emailValidation = email => {
    var re = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  toggleRememberMe = () => {
    this.setState({
      rememberMe: !this.state.rememberMe
    });
  };

  handleLoginChange = e => {
    if (!e.target.value) {
      // invalid if empty
      if (e.target.id === "email") {
        this.setState({
          emailPlaceholder: "*campo obbligatorio",
          emailFeedbackClass: "invalid-input"
        });
      } else if (e.target.id === "password") {
        this.setState({
          passwordPlaceholder: "*campo obbligatorio",
          passwordFeedbackClass: "invalid-input"
        });
      }
    } else {
      if (e.target.id === "email") {
        this.setState({
          emailPlaceholder: "email",
          emailFeedbackClass: null
        });
      } else if (e.target.id === "password") {
        const feedBackClass =
          e.target.value.length > 8 && e.target.value.length < 15
            ? "correct-input"
            : null;
        this.setState({
          passwordPlaceholder: "password",
          passwordFeedbackClass: feedBackClass
        });
      }
    }
    if (this.state.incorrect) {
      this.setState({
        [`${this.state.incorrect}LabelClass`]: "hidden"
      });
    }
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  handleBlur = e => {
    if (!this.state[e.target.id]) {
      if (e.target.id === "email") {
        this.setState({
          emailPlaceholder: "*campo obbligatorio",
          emailFeedbackClass: "invalid-input"
        });
      } else if (e.target.id === "password") {
        this.setState({
          passwordPlaceholder: "*campo obbligatorio",
          passwordFeedbackClass: "invalid-input"
        });
      }
    } else {
      if (e.target.id === "email") {
        if (this.emailValidation(e.target.value)) {
          this.setState({
            emailFeedbackClass: "correct-input"
          });
        } else {
          this.setState({
            emailFeedbackClass: "invalid-input"
          });
        }
      }
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    if (!this.state.email || !this.state.password) {
      alert("Compila tutti i campi");
    } else if (!this.emailValidation(this.state.email)) {
      alert("Email non valida");
    } else if (
      this.state.password.length < 8 ||
      this.state.password.length > 15
    ) {
      alert("La password deve essere lunga minimo 8, massimo 15 caratteri");
    } else {
      fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          email: this.state.email.toLowerCase(),
          password: this.state.password
        })
      })
        .then(res => res.json())
        .then(jsonRes => {
          if (jsonRes.code === 1) {
            // software error
            // set error and redirect
            this.props.dispatch({
              type: "E-SET",
              error: { frontendPlace: "Login/handleSubmit/code1", jsonRes }
            });
            this.props.history.push("/error");
          }
          if (jsonRes.code === 2) {
            // wrong credentials
            if (jsonRes.incorrect === "email") {
              this.setState({
                emailLabelClass: null,
                incorrect: "email",
                emailFeedbackClass: "invalid-input"
              });
            } else {
              this.setState({
                passwordLabelClass: null,
                incorrect: "password",
                passwordFeedbackClass: "invalid-input"
              });
            }
          } else if (jsonRes.code === 0) {
            // correct
            // store user in redux
            this.props.dispatch({ type: "SET-USER", user: jsonRes.activeUser });
            if (this.state.rememberMe) {
              // store jwt to local
              localStorage.setItem("JWT", jsonRes.JWT);
            } else {
              // store it in session
              sessionStorage.setItem("JWT", jsonRes.JWT);
            }
            const redirection =
              this.props.match.params.action === "buying" ? "/checkout" : "/";
            this.props.history.push(redirection);
          }
        })
        .catch(error => {
          // store error in redux
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "Login/handleSubmit/catch" }
          });
          this.props.history.push("/error");
        });
    }
  };

  // permissions
  componentDidMount = () => {
    if (sessionStorage.getItem("JWT") || localStorage.getItem("JWT")) {
      this.props.history.push("/");
    }
  };

  render() {
    return (
      <div id="login">
        <div id="image">
          <span id="image-title">LOGIN</span>
        </div>
        <div id="login-actions">
          <span id="login-prompt">Effettua il login per continuare</span>
          <form id="login-form" onSubmit={this.handleSubmit}>
            <div className="text">
              <label
                htmlFor="email"
                className={`incorrect-input-label ${this.state.emailLabelClass}`}
              >
                email incorretta
              </label>
              <input
                id="email"
                maxLength="320"
                placeholder={this.state.emailPlaceholder}
                type="email"
                onChange={this.handleLoginChange}
                className={`login-input input-text ${this.state.emailFeedbackClass}`}
                onBlur={this.handleBlur}
              />
            </div>
            <div className="text">
              <label
                htmlFor="password"
                className={`incorrect-input-label ${this.state.passwordLabelClass}`}
              >
                password errata
              </label>
              <input
                id="password"
                placeholder={this.state.passwordPlaceholder}
                type="password"
                onChange={this.handleLoginChange}
                className={`login-input input-text ${this.state.passwordFeedbackClass}`}
                onBlur={this.handleBlur}
              />
            </div>
            <div id="checkbox" className="login-input">
              <input
                type="checkbox"
                id="remember-me"
                onChange={this.toggleRememberMe}
                defaultChecked={true}
                className="login-input"
              />
              <label htmlFor="remember-me" id="checbox-label">
                Resta Collegato
              </label>
            </div>
            <input type="submit" value="LOGIN" id="submit-btn" />
          </form>
          <Link to="/recover" id="recover-prompt">
            Credenziali dimenticate?
          </Link>
          <div id="register-prompt-container">
            <span id="register-prompt">Sei nuovo?</span>
            <Link
              to={
                this.props.match.params.action === "buying"
                  ? "/register/buying"
                  : "/register"
              }
              id="register-btn"
            >
              Registrati
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(Login);

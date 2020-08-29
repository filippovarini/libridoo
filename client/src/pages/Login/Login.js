import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import HeaderPart from "../../components/headerPart";
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
    emailLabelMessage: null,
    passwordLabelMessage: null,
    incorrect: null,
    generalLabelHidden: true,
    loading: false
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
          emailPlaceholder: "*email*",
          emailFeedbackClass: "invalid-input"
        });
      } else if (e.target.id === "password") {
        this.setState({
          passwordPlaceholder: "*pasword*",
          passwordFeedbackClass: "invalid-input"
        });
      }
    } else {
      if (e.target.id === "email") {
        if (this.emailValidation(e.target.value)) {
          this.setState({
            emailPlaceholder: "email",
            emailFeedbackClass: "correct-input"
          });
        } else {
          this.setState({
            emailPlaceholder: "email",
            emailFeedbackClass: null
          });
        }
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
    this.setState({
      [e.target.id]: e.target.value
    });
    if (this.state.emailLabelMessage) {
      this.setState({ emailLabelMessage: null });
    }
    if (this.state.passwordLabelMessage) {
      this.setState({ passwordLabelMessage: null });
    }
    if (!this.state.generalLabelHidden) {
      this.setState({ generalLabelHidden: true });
    }
  };

  handleBlur = e => {
    if (!this.state[e.target.id]) {
      if (e.target.id === "email") {
        this.setState({
          emailPlaceholder: "*email*",
          emailFeedbackClass: "invalid-input"
        });
      } else if (e.target.id === "password") {
        this.setState({
          passwordPlaceholder: "*password*",
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
      this.setState({ generalLabelHidden: false });
      if (!this.state.email) {
        this.setState({
          emailPlaceholder: "*email*",
          emailFeedbackClass: "invalid-input"
        });
      }
      if (!this.state.password) {
        this.setState({
          passwordPlaceholder: "*password*",
          passwordFeedbackClass: "invalid-input"
        });
      }
    } else if (!this.emailValidation(this.state.email)) {
      this.setState({ emailLabelMessage: "email non valida" });
    } else if (
      this.state.password.length < 8 ||
      this.state.password.length > 15
    ) {
      this.setState({
        passwordLabelMessage:
          "La password deve essere lunga minimo 8, massimo 15 caratteri"
      });
    } else {
      this.setState({ loading: true });
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
                emailLabelMessage: "email errata",
                incorrect: "email",
                emailFeedbackClass: "invalid-input",
                loading: false,
                passwordFeedbackClass: null
              });
            } else {
              this.setState({
                passwordLabelMessage: "password errata",
                incorrect: "password",
                passwordFeedbackClass: "invalid-input",
                loading: false,
                emailFeedbackClass: null
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
    const body = this.state.loading ? (
      <div id="login-form" className="height-set">
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
    ) : (
      <form id="login-form" onSubmit={this.handleSubmit}>
        <p
          id="login-generalLabel"
          className={`incorrect-input-label ${
            this.state.generalLabelHidden ? "hidden" : ""
          }`}
        >
          Compila tutti i campi obbligatori
        </p>
        <div className="text">
          <label
            htmlFor="email"
            className={`incorrect-input-label ${
              this.state.emailLabelMessage ? "" : "hidden"
            }`}
          >
            {this.state.emailLabelMessage}
          </label>
          <input
            id="email"
            maxLength="320"
            placeholder={this.state.emailPlaceholder}
            type="text"
            onChange={this.handleLoginChange}
            className={`login-input input-text ${this.state.emailFeedbackClass}`}
            onBlur={this.handleBlur}
          />
        </div>
        <div className="text">
          <label
            htmlFor="password"
            className={`incorrect-input-label ${
              this.state.passwordLabelMessage ? "" : "hidden"
            }`}
          >
            {this.state.passwordLabelMessage}
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
          <label
            htmlFor="remember-me"
            id="checbox-label"
            className="login-rememberMe"
          >
            Resta Collegato
          </label>
        </div>
        <input type="submit" value="LOGIN" className="hidden" />
        <p id="login-submit-btn" onClick={this.handleSubmit}>
          LOGIN
        </p>
      </form>
    );
    return (
      <div id="login">
        <HeaderPart
          title={"LOGIN"}
          mainClass={"deals"}
          imageId="libridoo-logo-image"
          headerClass=""
        />
        <div id="login-actions">
          <span id="login-prompt">Effettua il login per continuare</span>
          {body}
          <Link to="/recover" id="recover-prompt">
            Credenziali dimenticate?
          </Link>
          <div id="register-prompt-container">
            <span id="register-prompt">Sei nuovo? </span>
            <Link
              to={
                this.props.match.params.action === "buying"
                  ? "/register/buying"
                  : "/register"
              }
              id="register-btn"
            >
              {"  "}Registrati
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(Login);

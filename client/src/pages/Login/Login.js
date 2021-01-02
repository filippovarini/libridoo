import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import HeaderPart from "../../components/headerPart";
import "./Login.css";

// components
import SignInBox from "../../components/signBox/sign";

class Login extends Component {
  state = {
    email: null,
    password: null,
    rememberMe: true,
    errorMessage: "",
    loading: false
  };

  // permissions
  componentDidMount = () => {
    if (sessionStorage.getItem("JWT") || localStorage.getItem("JWT")) {
      this.props.history.push("/");
    }
  };

  handleCheckboxClick = () => {
    this.setState({
      errorMessage: "",
      rememberMe: !this.state.rememberMe
    });
  };

  handleChange = e => {
    this.setState({
      errorMessage: "",
      [e.target.id]: e.target.value
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    if (!this.state.email || !this.state.password) {
      this.setState({ errorMessage: "Compila tutti i campi" });
    } else if (
      this.state.password.length < 8 ||
      this.state.password.length > 15
    ) {
      this.setState({
        errorMessage:
          "La password deve essere lunga minimo 8, massimo 15 caratteri"
      });
    } else {
      // everything correct
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
          console.log(jsonRes);
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
                errorMessage: "email errata",
                loading: false
              });
            } else {
              this.setState({
                errorMessage: "password errata",
                loading: false
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
              this.props.match.params.action === "buying"
                ? // "/checkout"
                  "/orderReview"
                : "/";
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

  render() {
    const body = (
      <SignInBox
        handleInputChange={this.handleChange}
        toggleCheckbox={this.handleCheckboxClick}
        handleSubmit={this.handleSubmit}
        confirm="CONFERMA"
        loading={this.state.loading}
        errorMessage={this.state.errorMessage}
        prompt={
          this.props.match.params.action === "buying"
            ? "Effettua il login per completare l'ordine"
            : "LOGIN"
        }
        textInputs={[
          { id: "email", placeholder: "email", type: "email" },
          { id: "password", placeholder: "password", type: "password" }
        ]}
        checkboxInputs={[
          {
            id: "rememberMe",
            defaultChecked: true,
            text: (
              <label
                htmlFor="rememberMe"
                id="checbox-label"
                className="sign-checkBox"
              >
                Resta Collegato
              </label>
            )
          }
        ]}
      />
    );
    return (
      <div id="login">
        <HeaderPart
          title={"BENTORNATO!"}
          mainClass={"deals"}
          imageId="libridoo-logo-image"
          headerClass=""
        />
        <div id="login-actions">
          {body}
          <Link
            className={this.state.loading ? "hidden" : null}
            to="/recover"
            id="recover-prompt"
          >
            Credenziali dimenticate?
          </Link>
          <div
            id="register-prompt-container"
            className={this.state.loading ? "hidden" : null}
          >
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

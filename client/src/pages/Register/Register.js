import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import "./Register.css";

// components
import EmailConfirm from "../../components/emailConfirm/emailConfirm";

class Register extends Component {
  state = {
    avatarImgURL: null,
    name: null,
    email: null,
    password: null,
    passwordConfirm: null,
    nameEmptyClass: null,
    emailEmptyClass: null,
    passwordEmptyClass: null,
    passwordConfirmEmptyClass: null,
    tcpClicked: false,
    rememberClicked: true,
    namePlaceholder: "nome",
    emailPlaceholder: "email",
    passwordPlaceholder: "password",
    passwordConfirmPlaceholder: "conferma password",
    emailConfirmClass: "hidden"
  };

  emailValidation = email => {
    var re = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  //   access
  componentDidMount = () => {
    if (sessionStorage.getItem("JWT") || localStorage.getItem("JWT")) {
      this.props.history.push("/");
    }
  };

  handleCheckboxClick = e => {
    this.setState({
      [e.target.id + "Clicked"]: !this.state[[e.target.id + "Clicked"]]
    });
  };

  handleChange = e => {
    if (e.target.id === "password") {
      if (e.target.value === this.state.passwordConfirm) {
        this.setState({
          passwordConfirmEmptyClass: "correct-input"
        });
      } else {
        this.setState({
          passwordConfirmEmptyClass: "invalid-input"
        });
      }
    }
    if (!e.target.value) {
      this.setState({
        [`${e.target.id}EmptyClass`]: "invalid-input",
        [`${e.target.id}Placeholder`]: `*campo obbligatorio`
      });
    }
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  //   check not empty
  handleBlur = e => {
    if (
      !e.target.value ||
      (e.target.id === "email" && !this.emailValidation(e.target.value)) ||
      (e.target.id === "password" && e.target.value.length < 8) ||
      (e.target.id === "password" && e.target.value.length > 15) ||
      (e.target.id === "passwordConfirm" &&
        e.target.value !== this.state.password)
    ) {
      // empty
      this.setState({
        [`${e.target.id}EmptyClass`]: "invalid-input",
        [`${e.target.id}Placeholder`]: `*campo obbligatorio`
      });
    } else {
      // not empty and valid
      this.setState({
        [`${e.target.id}EmptyClass`]: "correct-input",
        [`${e.target.id}Placeholder`]: e.target.id
      });
    }
  };

  deleteImage = () => {
    this.setState({
      avatarImgURL: null
    });
  };

  setAvatarImg = () => {
    this.setState({
      avatarImgURL:
        "https://scontent-fco1-1.xx.fbcdn.net/v/t1.0-9/55822168_1355705201259453_1842124246487138304_n.jpg?_nc_cat=100&_nc_sid=85a577&_nc_ohc=r4iDfEzSkZAAX9NUgx7&_nc_ht=scontent-fco1-1.xx&oh=910142c0ef27ba00e78883c66a5fb64a&oe=5EA37D2D"
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    if (
      !this.state.name ||
      !this.state.email ||
      !this.state.password ||
      !this.state.passwordConfirm
    ) {
      alert("Inserisci tutti i campi obligatori");
    } else if (!this.emailValidation(this.state.email)) {
      alert("Email non valida");
    } else if (this.state.password !== this.state.passwordConfirm) {
      alert("Le due password non combaciano");
    } else if (
      this.state.password.length < 8 ||
      this.state.password.length > 15
    ) {
      alert("La password deve essere lunga minimo 8 massimo 15 caratteri");
    } else if (!this.state.tcpClicked) {
      alert("Accetta i termini e condizioni");
    } else {
      fetch("/api/user/register/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ email: this.state.email.toLowerCase() })
      })
        .then(res => res.json())
        .then(jsonRes => {
          if (jsonRes.code === 1) {
            this.props.dispatch({
              type: "E-SET",
              error: { frontendPlace: "Register/handleSubmit/code1", jsonRes }
            });
            this.props.history.push("/error");
          } else if (jsonRes.code === 2) {
            this.setState({
              emailEmptyClass: "invalid-input"
            });
            alert("Email già registrata con un altro account");
          } else {
            // everything correct
            const avatarImgURL =
              this.state.avatarImgURL || /*default image*/ null;
            const invitingUserId =
              this.props.match.params.invitingId === "buying"
                ? null
                : this.props.match.params.invitingId;
            const body = {
              avatarImgURL,
              name: this.state.name,
              email: this.state.email.toLowerCase(),
              password: this.state.password,
              invitingUserId
            };
            sessionStorage.setItem("registerBody", JSON.stringify(body));
            sessionStorage.setItem("emailSent", "true");
            this.setState({
              emailConfirmClass: ""
            });
          }
        })
        .catch(error => {
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "Register/handleSubmit/catch", error }
          });
          this.props.history.push("/error");
        });
    }
  };

  render() {
    const avatarImages = (
      <div id="register-avatarImgs">
        <span id="agatarImg-prompt">Scegli un avatar</span>
        <div id="images-container" onClick={this.setAvatarImg}>
          {/* images with onClick={this.setAvatarImg}*/}
        </div>
      </div>
    );
    const avatarImage = (
      <div id="avatar-image-container">
        <span id="image-delete" onClick={this.deleteImage}>
          -
        </span>
        <img src={this.state.avatarImgURL} id="avatar-image" alt="avatar" />
      </div>
    );
    const avatarHeader = this.state.avatarImgURL ? avatarImage : avatarImages;
    return (
      <div id="register-general-container">
        <div id="image">
          <span id="image-title">REGISTRATI</span>
        </div>
        {avatarHeader}
        <div id="register-actions">
          <form onSubmit={this.handleSubmit} id="register-form">
            <input
              autoComplete="off"
              type="text"
              id="name"
              placeholder={this.state.namePlaceholder}
              className={`text-input ${this.state.nameEmptyClass}`}
              onBlur={this.handleBlur}
              onChange={this.handleChange}
            />
            <input
              type="text"
              id="email"
              placeholder={this.state.emailPlaceholder}
              className={`text-input ${this.state.emailEmptyClass}`}
              onBlur={this.handleBlur}
              onChange={this.handleChange}
            />
            <input
              type="password"
              id="password"
              placeholder={this.state.passwordPlaceholder}
              className={`text-input password ${this.state.passwordEmptyClass}`}
              onBlur={this.handleBlur}
              onChange={this.handleChange}
            />
            <input
              autoComplete="off"
              type="password"
              id="passwordConfirm"
              placeholder={this.state.passwordConfirmPlaceholder}
              className={`text-input password ${this.state.passwordConfirmEmptyClass}`}
              onBlur={this.handleBlur}
              onChange={this.handleChange}
            />
            <div id="tcp-container" className="checkbox-container">
              <input
                type="checkbox"
                id="tcp"
                onChange={this.handleCheckboxClick}
              />
              <label htmlFor="tcp">
                Accetto termini e condizioni e la privacy policy
              </label>
            </div>
            <div id="remember-container" className="checkbox-container">
              <input
                type="checkbox"
                id="remember"
                onChange={this.handleCheckboxClick}
                defaultChecked={true}
              />
              <label htmlFor="remember">Resta Collegato</label>
            </div>
            <input type="submit" id="register-confirm" value="REGISTRATI" />
          </form>
          <div id="login-prompt-container">
            <span id="login-prompt-link">Già registrato?</span>
            <Link to="/login" id="login-btn">
              Login
            </Link>
          </div>
        </div>
        <EmailConfirm
          display={this.state.emailConfirmClass}
          rememberMe={this.state.rememberClicked}
          invalidEmail={this.invalidEmail}
        />
      </div>
    );
  }
}

export default connect()(Register);

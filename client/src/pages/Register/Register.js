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
    emailConfirmClass: "hidden",
    errorMessage: null
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
    } else if (e.target.id === "email") {
      if (this.emailValidation(e.target.value)) {
        this.setState({
          emailEmptyClass: "correct-input"
        });
      } else {
        this.setState({
          emailEmptyClass: null
        });
      }
    } else if (
      e.target.id === "passwordConfirm" &&
      e.target.value === this.state.password
    ) {
      this.setState({ passwordConfirmEmptyClass: "correct-input" });
    }
    if (!e.target.value) {
      this.setState({
        [`${e.target.id}EmptyClass`]: "invalid-input",
        [`${e.target.id}Placeholder`]:
          e.target.id === "name"
            ? "*nome*"
            : e.target.id === "email"
            ? "*email*"
            : e.target.id === "password"
            ? "*password*"
            : "*conferma password*"
      });
    }
    this.setState({
      [e.target.id]: e.target.value
    });
    if (this.state.errorMessage) {
      this.setState({ errorMessage: null });
    }
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
        [`${e.target.id}Placeholder`]:
          e.target.id === "name"
            ? "*nome*"
            : e.target.id === "email"
            ? "*email*"
            : e.target.id === "password"
            ? "*password*"
            : "*conferma password*"
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

  setAvatarImg = e => {
    this.setState({
      avatarImgURL: e.target.src
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
      this.setState({ errorMessage: "Inserisci tutti i campi obbligatori" });
      if (!this.state.name) {
        this.setState({
          nameEmptyClass: "invalid-input",
          namePlaceholder: "*nome*"
        });
      }
      if (!this.state.email) {
        this.setState({
          emailEmptyClass: "invalid-input",
          emailPlaceholder: "*email*"
        });
      }
      if (!this.state.password) {
        this.setState({
          passwordEmptyClass: "invalid-input",
          passwordPlaceholder: "*password*"
        });
      }
      if (!this.state.passwordConfirm) {
        this.setState({
          passwordConfirmEmptyClass: "invalid-input",
          passwordConfirmPlaceholder: "*conferma password*"
        });
      }
    } else if (!this.emailValidation(this.state.email)) {
      this.setState({ errorMessage: "Email non valida" });
    } else if (this.state.password !== this.state.passwordConfirm) {
      this.setState({ errorMessage: "Le due password non coincidono" });
    } else if (
      this.state.password.length < 8 ||
      this.state.password.length > 15
    ) {
      this.setState({
        errorMessage:
          "La password deve essere lunga minimo 8 massimo 15 caratteri"
      });
    } else if (!this.state.tcpClicked) {
      this.setState({
        errorMessage: "Accetta i termini e condizioni"
      });
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
            this.setState({
              errorMessage: "Email già registrata con un altro account"
            });
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
        <div id="images-container">
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981680454"
            alt="meme"
            className="register-avatarImage"
          />
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981687254"
            alt="uccellino"
            className="register-avatarImage"
          />
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981692298"
            alt="schifomadò"
            className="register-avatarImage"
          />
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981699850"
            alt="morgan e bugo"
            className="register-avatarImage"
          />
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981712262"
            alt="lavoro onesto"
            className="register-avatarImage"
          />
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981716946"
            alt="baby yoda"
            className="register-avatarImage"
          />
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981720614"
            alt="stonks"
            className="register-avatarImage"
          />
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981725500"
            alt="foca coccolosa"
            className="register-avatarImage"
          />
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981730904"
            alt="donna-giraffa"
            className="register-avatarImage"
          />
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981735139"
            alt="disappointed"
            className="register-avatarImage"
          />
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981739335"
            alt="cane carino"
            className="register-avatarImage"
          />
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981743022"
            alt="vecchietto"
            className="register-avatarImage"
          />
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981747101"
            alt="spongebob uccello"
            className="register-avatarImage"
          />
          <img
            onClick={this.setAvatarImg}
            src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587996448726"
            alt="fidanzato distratto"
            className="register-avatarImage"
          />
        </div>
      </div>
    );
    const avatarImage = (
      <div id="avatar-image-container">
        <span id="image-delete" onClick={this.deleteImage}>
          -
        </span>
        <img
          src={this.state.avatarImgURL}
          id="register-avatar-image"
          alt="avatar"
        />
      </div>
    );
    const avatarHeader = this.state.avatarImgURL ? avatarImage : avatarImages;
    return (
      <div id="register-general-container">
        <div id="register-image-container">
          {/* <p id="register-fake-header">REGISTRATI</p> */}
        </div>
        {avatarHeader}
        <div id="register-actions">
          <form onSubmit={this.handleSubmit} id="register-form">
            <p
              id="register-error-message"
              className={`incorrect-input-label ${
                this.state.errorMessage ? "" : "hidden"
              }`}
            >
              {this.state.errorMessage}
            </p>
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
              autoComplete="off"
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
                Accetto{" "}
                <Link to="termsAndConditions">termini e condizioni</Link> e la{" "}
                <Link to="privacy">privacy policy</Link>
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
            <input type="submit" value="REGISTRATI" className="hidden" />
            <p id="register-confirm-btn" onClick={this.handleSubmit}>
              REGISTRATI
            </p>
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

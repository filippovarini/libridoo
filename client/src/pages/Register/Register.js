import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import HeaderPart from "../../components/headerPart";
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
    errorMessage: null,
    loading: false
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
      this.setState({ loading: true });
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
              emailEmptyClass: "invalid-input",
              nameEmptyClass: "",
              passwordEmptyClass: "",
              passwordConfirm: ""
            });
            this.setState({
              errorMessage: "Email già registrata con un altro account",
              loading: false
            });
          } else {
            // everything correct
            const avatarImgURL =
              this.state.avatarImgURL ||
              "https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598352393512";
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
              emailConfirmClass: "",
              loading: false
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
    const loading = (
      <div id="register-loading">
        <div className="loadingio-spinner-fidget-spinner-udtray956qm">
          <div className="ldio-sqv79tocehf">
            <div>
              <div>
                <div
                  style={{ left: "87.435px", top: "14.354999999999999px" }}
                ></div>
                <div
                  style={{
                    left: "24.794999999999998px",
                    top: "122.66999999999999px"
                  }}
                ></div>
                <div
                  style={{ left: "150.075px", top: "122.66999999999999px" }}
                ></div>
              </div>
              <div>
                <div style={{ left: "113.535px", top: "40.455px" }}></div>
                <div
                  style={{
                    left: "50.894999999999996px",
                    top: "148.76999999999998px"
                  }}
                ></div>
                <div
                  style={{
                    left: "176.17499999999998px",
                    top: "148.76999999999998px"
                  }}
                ></div>
              </div>
              <div style={{ left: "87.435px", top: "87.435px" }}></div>
              <div>
                <div
                  style={{
                    left: "97.875px",
                    top: "78.3px",
                    transform: "rotate(-20deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "150.075px",
                    top: "78.3px",
                    transform: "rotate(20deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "75.69px",
                    top: "117.44999999999999px",
                    transform: "rotate(80deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "101.78999999999999px",
                    top: "160.515px",
                    transform: "rotate(40deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "172.26px",
                    top: "117.44999999999999px",
                    transform: "rotate(100deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "146.16px",
                    top: "160.515px",
                    transform: "rotate(140deg)"
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    const avatarImages = (
      <div id="register-avatarImgs">
        <span id="agatarImg-prompt">Scegli un avatar</span>
        <div id="images-container">
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981692298"
              alt="schifomadò"
              className="register-avatarImage"
            />
            <p className="image-register-header">Il professore</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981699850"
              alt="morgan e bugo"
              className="register-avatarImage"
            />
            <p className="image-register-header">L'appello</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981735139"
              alt="disappointed"
              className="register-avatarImage"
            />
            <p className="image-register-header">Il 18</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981716946"
              alt="baby yoda"
              className="register-avatarImage"
            />
            <p className="image-register-header">Pausa caffè</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981730904"
              alt="donna-giraffa"
              className="register-avatarImage"
            />
            <p className="image-register-header">Il copione</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981720614"
              alt="stonks"
              className="register-avatarImage"
            />
            <p className="image-register-header">L'economista</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598765298832"
              alt="matematica"
              className="register-avatarImage"
            />
            <p className="image-register-header">L'ingegnere</p>
          </div>

          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598780677065"
              alt="the wolf of wall street leonardo di caprio"
              className="register-avatarImage"
            />
            <p className="image-register-header">Il legale</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598780236639"
              alt="de luca il medico"
              className="register-avatarImage"
            />
            <p className="image-register-header">Il medico</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981712262"
              alt="lavoro onesto"
              className="register-avatarImage"
            />
            <p className="image-register-header">L'agronomo</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598781381406"
              alt="alberto angela"
              className="register-avatarImage"
            />
            <p className="image-register-header">Storia</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598780483720"
              alt="ragazzo che si sforza"
              className="register-avatarImage"
            />
            <p className="image-register-header">Psicologia</p>
          </div>
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

    const loaded = (
      <div id="register-general-container">
        <HeaderPart
          title={"TI VOGLIAMO!"}
          mainClass={"register"}
          imageId={"register-libridoo-logo-image"}
          headerClass="register-"
        />
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
                <Link className="reg-link" to="termsAndConditions">
                  termini e condizioni
                </Link>{" "}
                e la{" "}
                <Link className="reg-link" to="privacy">
                  privacy policy
                </Link>
              </label>
            </div>
            <div id="remember-container" className="checkbox-container">
              <input
                type="checkbox"
                id="remember"
                onChange={this.handleCheckboxClick}
                defaultChecked={true}
              />
              <label id="rememberMe" htmlFor="remember">
                Resta Collegato
              </label>
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

    const body = this.state.loading ? loading : loaded;
    return body;
  }
}

export default connect()(Register);

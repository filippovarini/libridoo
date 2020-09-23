import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import HeaderPart from "../../components/headerPart";
import "./Register.css";

// components
import EmailConfirm from "../../components/emailConfirm/emailConfirm";
import LoadingL from "../../components/Loading/loading_l";

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
    namePlaceholder: "nome e cognome",
    emailPlaceholder: "email",
    passwordPlaceholder: "password",
    passwordConfirmPlaceholder: "conferma password",
    emailConfirmClass: "hidden",
    emailConfirm: null,
    emailConfirmEmptyClass: null,
    emailConfirmPlaceholder: "conferma email",
    errorMessage: null,
    loading: false,
    description: null,
    opposite: null,
    male: true
  };

  handleToggleChange = () => {
    this.setState({ male: !this.state.male });
    if (this.state.opposite) {
      this.setState({
        opposite: this.state.description,
        description: this.state.opposite
      });
    }
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
      avatarImgURL: null,
      description: null,
      opposite: null
    });
  };

  setAvatarImg = (url, male, gender, female) => {
    const description = !gender ? male : this.state.male ? male : female;
    const opposite = !gender ? null : this.state.male ? female : male;
    this.setState({
      avatarImgURL: url,
      description,
      opposite
    });
  };

  // old submit
  handleSubmit1 = e => {
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
      if (!this.state.emailConfirm) {
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
              "https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1599843473300";
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
      if (!this.state.emailConfirm) {
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
    } else if (
      this.state.email.toLowerCase() !== this.state.emailConfirm.toLowerCase()
    ) {
      this.setState({ errorMessage: "Le due email non coincidono" });
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
              "https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1599843473300";
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
            fetch("/api/user/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
              },
              body: JSON.stringify(body)
            })
              .then(res => res.json())
              .then(jsonRes => {
                // sessionStorage.removeItem("emailSent");
                // sessionStorage.removeItem("requestSent");
                // sessionStorage.removeItem("hashedCode");
                // sessionStorage.removeItem("registerBody");
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
                  this.props.dispatch({
                    type: "SET-USER",
                    user: jsonRes.activeUser
                  });
                  if (this.state.rememberClicked) {
                    localStorage.setItem("JWT", jsonRes.JWT);
                  } else {
                    sessionStorage.setItem("JWT", jsonRes.JWT);
                  }
                  const redirection =
                    this.props.match.params.invitingId === "buying"
                      ? "/orderReview"
                      : // "/checkout"
                        "/";
                  this.props.history.push(redirection);
                }
              })
              .catch(error => {
                // store error in redux and redirect
                // sessionStorage.removeItem("emailSent");
                // sessionStorage.removeItem("requestSent");
                // sessionStorage.removeItem("hashedCode");
                // sessionStorage.removeItem("registerBody");
                this.props.dispatch({
                  type: "E-SET",
                  error: { frontendPlace: "emailConfirm/register/catch", error }
                });
                this.props.history.push("/error");
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
        <LoadingL />
      </div>
    );

    const avatarImages = (
      <div id="register-avatarImgs">
        <span id="agatarImg-prompt">Scegli un avatar</span>
        <div id="images-container">
          <div className="image-register-container">
            <img
              onClick={() =>
                this.setAvatarImg(
                  "https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981692298",
                  "Il professore",
                  true,
                  "La professoressa"
                )
              }
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981692298"
              alt="schifomadò"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.state.male ? "Il professore" : "La professoressa"}
            </p>
          </div>
          <div className="image-register-container">
            <img
              onClick={() =>
                this.setAvatarImg(
                  "https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981699850",
                  "L'appello",
                  false
                )
              }
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981699850"
              alt="morgan e bugo"
              className="register-avatarImage"
            />
            <p className="image-register-header">L'appello</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={() =>
                this.setAvatarImg(
                  "https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981735139",
                  "Il 18",
                  false
                )
              }
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981735139"
              alt="disappointed"
              className="register-avatarImage"
            />
            <p className="image-register-header">Il 18</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={() =>
                this.setAvatarImg(
                  "https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981716946",
                  "Pausa caffè",
                  false
                )
              }
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981716946"
              alt="baby yoda"
              className="register-avatarImage"
            />
            <p className="image-register-header">Pausa caffè</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={() =>
                this.setAvatarImg(
                  "https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981730904",
                  "Il copione",
                  true,
                  "La copiona"
                )
              }
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981730904"
              alt="donna-giraffa"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.state.male ? "Il copione" : "La copiona"}
            </p>
          </div>
          <div className="image-register-container">
            <img
              onClick={() =>
                this.setAvatarImg(
                  "https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981720614",
                  "Il businessman",
                  true,
                  "La businesswoman"
                )
              }
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981720614"
              alt="stonks"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.state.male ? "Il businessman" : "La businesswoman"}
            </p>
          </div>
          <div className="image-register-container">
            <img
              onClick={() =>
                this.setAvatarImg(
                  "https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598765298832",
                  "L'ingegnere",
                  false
                )
              }
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598765298832"
              alt="matematica"
              className="register-avatarImage"
            />
            <p className="image-register-header">L'ingegnere</p>
          </div>

          <div className="image-register-container">
            <img
              onClick={() =>
                this.setAvatarImg(
                  "https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598780677065",
                  "Il giurista",
                  true,
                  "La giurista"
                )
              }
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598780677065"
              alt="the wolf of wall street leonardo di caprio"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.state.male ? "Il giurista" : "La giurista"}
            </p>
          </div>
          <div className="image-register-container">
            <img
              onClick={() =>
                this.setAvatarImg(
                  "https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598780236639",
                  "Il medico",
                  false
                )
              }
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598780236639"
              alt="de luca il medico"
              className="register-avatarImage"
            />
            <p className="image-register-header">Il medico</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={() =>
                this.setAvatarImg(
                  "https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981712262",
                  "L'agronomo",
                  true,
                  "L'agronoma"
                )
              }
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981712262"
              alt="lavoro onesto"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.state.male ? "L'agronomo" : "L'agronoma"}
            </p>
          </div>
          <div className="image-register-container">
            <img
              onClick={() =>
                this.setAvatarImg(
                  "https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598781381406",
                  "Lo storico",
                  true,
                  "La storica"
                )
              }
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598781381406"
              alt="alberto angela"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.state.male ? "Lo storico" : "La storica"}
            </p>
          </div>
          <div className="image-register-container">
            <img
              onClick={() =>
                this.setAvatarImg(
                  "https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598780483720",
                  "Lo psicologo",
                  true,
                  "La psicologa"
                )
              }
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598780483720"
              alt="ragazzo che si sforza"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.state.male ? "Lo psicologo" : "La psicologa"}
            </p>
          </div>
        </div>
      </div>
    );
    const avatarImage = (
      <div id="ai-general-container">
        <div id="avatar-image-container">
          <i
            id="image-delete"
            onClick={this.deleteImage}
            className="fas fa-times"
          ></i>
          <img
            src={this.state.avatarImgURL}
            id="register-avatar-image"
            alt="avatar"
          />
        </div>
        <p id="ai-description">{this.state.description}</p>
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
        <div id="rg-sex">
          <p id="rg-sex-header">Sono {this.state.male ? "un" : "una"}</p>
          <div className="onoffswitch">
            <input
              type="checkbox"
              name="onoffswitch"
              className="onoffswitch-checkbox"
              id="myonoffswitch"
              tabIndex="0"
              defaultChecked
              onChange={this.handleToggleChange}
            />
            <label className="onoffswitch-label" htmlFor="myonoffswitch">
              <span className="onoffswitch-inner"></span>
              <span className="onoffswitch-switch"></span>
            </label>
          </div>
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
            {/* emailConfirm */}
            <input
              autoComplete="off"
              type="text"
              id="emailConfirm"
              placeholder={this.state.emailConfirmPlaceholder}
              className={`text-input ${this.state.emailConfirmEmptyClass}`}
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

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import HeaderPart from "../../components/headerPart";
import "./Register.css";

// components
import LoadingL from "../../components/Loading/loading_l";
import AvatarImagesComponent from "../../components/avatarImages/avatarImages";
import AvatarSingleImage from "../../components/avatarImages/singleAvatarImage";
import SexChange from "../../components/avatarImages/sexChanger";
import SignUpBox from "../../components/signBox/sign";

class Register extends Component {
  state = {
    avatarImgURL: null,
    imageDescription: null,
    male: true,
    name: null,
    phone: null,
    password: null,
    termsConditions: false,
    rememberMe: true,
    errorMessage: "",
    loading: false
  };

  //   access
  componentDidMount = () => {
    if (sessionStorage.getItem("JWT") || localStorage.getItem("JWT")) {
      this.state.history.push("/");
    }
  };

  setAvatarImg = (src, name) => {
    this.setState({
      avatarImgURL: src,
      imageDescription: name
    });
  };

  deleteImage = () => {
    this.setState({
      avatarImgURL: null,
      description: null,
      opposite: null
    });
  };

  handleSexChange = () => this.setState({ male: !this.state.male });

  handleCheckboxClick = e => {
    this.setState({
      errorMessage: "",
      [e.target.id]: !this.state[[e.target.id]]
    });
  };

  handleChange = e => {
    this.setState({
      errorMessage: "",
      [e.target.id]: e.target.value
    });
  };

  // complete registration
  // check phone is correct before it!!
  handleSubmit = e => {
    e.preventDefault();
    if (!this.state.name || !this.state.phone || !this.state.password) {
      this.setState({ errorMessage: "Inserisci tutti i campi obbligatori" });
    } else if (
      this.state.password.length < 8 ||
      this.state.password.length > 15
    ) {
      this.setState({
        errorMessage:
          "La password deve essere lunga minimo 8 massimo 15 caratteri"
      });
    } else if (!this.state.termsConditions) {
      this.setState({
        errorMessage: "Accetta i termini e condizioni"
      });
    } else {
      // all conditions met
      this.setState({ loading: true });

      // check the phone number is new
      fetch("/api/user/register/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ phone: this.state.phone })
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
              errorMessage: "Cellulare già registrato con un altro account",
              loading: false
            });
          } else {
            // everything correct
            // default avatarImage functionality
            const avatarImgURL =
              this.state.avatarImgURL ||
              "https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1599843473300";

            // if it is not buying, it can have an invitingUserId
            const invitingUserId =
              this.props.match.params.invitingId === "buying"
                ? null
                : this.props.match.params.invitingId;

            const body = {
              avatarImgURL,
              name: this.state.name,
              phone: this.state.phone.replace(/\s+/g, ""),
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
                console.log(jsonRes);
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
                  console.log(jsonRes);
                  // code = 3 || 0 -> correct, save user and JWT
                  this.props.dispatch({
                    type: "SET-USER",
                    user: jsonRes.activeUser
                  });
                  if (this.state.rememberMe) {
                    localStorage.setItem("JWT", jsonRes.JWT);
                  } else {
                    sessionStorage.setItem("JWT", jsonRes.JWT);
                  }
                  const redirection =
                    this.props.match.params.invitingId === "buying"
                      ? "/orderReview"
                      : "/";
                  sessionStorage.setItem("insertPopUpToSee", true);
                  this.props.history.push(redirection);
                }
              })
              .catch(error => {
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

    const avatarImage = (
      <AvatarSingleImage
        avatarImgURL={this.state.avatarImgURL}
        description={this.state.imageDescription}
        deleteImage={this.deleteImage}
      />
    );

    const avatarImages = (
      <AvatarImagesComponent
        male={this.state.male}
        setAvatarImg={this.setAvatarImg}
      />
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
        {this.state.avatarImgURL ? null : (
          <SexChange
            male={this.state.male}
            handleSexChange={this.handleSexChange}
          />
        )}
        {avatarHeader}
        <div id="register-box">
          <SignUpBox
            prompt="REGISTRATI"
            errorMessage={this.state.errorMessage}
            textInputs={[
              { id: "name", placeholder: "nome e cognome", type: "text" },
              { id: "phone", placeholder: "cellulare", type: "number" },
              { id: "password", placeholder: "password", type: "password" }
            ]}
            checkboxInputs={[
              {
                id: "termsConditions",
                defaultChecked: false,
                text: (
                  <label
                    htmlFor="termsConditions"
                    id="checbox-label"
                    className="sign-checkBox sign-small"
                  >
                    Accetto{" "}
                    <Link className="reg-link" to="termsAndConditions">
                      termini e condizioni
                    </Link>{" "}
                    e la{" "}
                    <Link className="reg-link" to="privacy">
                      privacy policy
                    </Link>
                  </label>
                )
              },
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
            handleInputChange={this.handleChange}
            toggleCheckbox={this.handleCheckboxClick}
            handleSubmit={this.handleSubmit}
            confirm="ENTRA A BORDO!"
            loading={this.state.loading}
          />
        </div>
        <div id="login-prompt-container">
          <span id="login-prompt-link">Già registrato?</span>
          <Link to="/login" id="login-btn">
            Login
          </Link>
        </div>
      </div>
    );

    const body = this.state.loading ? loading : loaded;
    return body;
  }
}

export default connect()(Register);

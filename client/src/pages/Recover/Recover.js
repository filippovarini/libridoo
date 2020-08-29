import React, { Component } from "react";
import { connect } from "react-redux";
import HeaderPart from "../../components/headerPart";
import "./Recover.css";

class Recover extends Component {
  state = {
    inputStatus: null,
    inputClass: null,
    inputPlaceHolder: "email",
    email: null,
    loading: false,
    success: false
  };

  emailValidation = email => {
    var re = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  componentDidMount = () => {
    if (sessionStorage.getItem("JWT") || localStorage.getItem("JWT")) {
      this.props.history.push("/");
    }
  };

  handleChange = e => {
    this.setState({ inputStatus: null, inputClass: null });
    if (!e.target.value) {
      this.setState({
        inputClass: "invalid-input",
        inputPlaceHolder: "*email*"
      });
    } else if (this.emailValidation(e.target.value)) {
      this.setState({ inputClass: "correct-input" });
    } else {
      this.setState({ inputClass: null });
    }
    this.setState({ email: e.target.value });
  };

  handleBlur = e => {
    if (!e.target.value) {
      this.setState({
        inputClass: "invalid-input",
        inputPlaceHolder: "*email*",
        inputStatus: "empty"
      });
    } else if (!this.emailValidation(e.target.value)) {
      // invalid email
      this.setState({
        inputClass: "invalid-input",
        inputStatus: "invalid"
      });
    } else {
      this.setState({
        inputClass: "correct-input",
        inputStatus: null
      });
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    if (!this.state.email) {
      this.setState({
        inputClass: "invalid-input",
        inputStatus: "empty",
        inputPlaceHolder: "*email*"
      });
    } else if (!this.emailValidation(this.state.email)) {
      this.setState({
        inputClass: "invalid-input",
        inputStatus: "invalid"
      });
    } else {
      // correct
      this.setState({ loading: true });
      fetch("/api/user/recover", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ email: this.state.email })
      })
        .then(res => res.json())
        .then(jsonRes => {
          if (jsonRes.code === 1) {
            //   error
            this.props.dispatch({
              type: "E-SET",
              error: { frontendPlace: "Recover/handleSubmit/code1", jsonRes }
            });
            this.props.history.push("/error");
          } else if (jsonRes.code === 2) {
            //   no account
            this.setState({
              loading: false,
              inputClass: "invalid-input",
              inputStatus: "noAccount"
            });
          } else {
            //   success
            this.setState({
              success: true,
              loading: false
            });
            setTimeout(() => {
              this.props.history.push("/login");
            }, 2500);
          }
        })
        .catch(error => {
          console.log(error);
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "Recover/handleSubmit/catch" }
          });
          this.props.history.push("/error");
        });
    }
  };

  render() {
    let labelMessage = null;
    switch (this.state.inputStatus) {
      case "invalid":
        labelMessage = "Email non valida";
        break;
      case "noAccount":
        labelMessage = "Nessun account registrato con questa email";
        break;
      case "empty":
        labelMessage = "Campo obbligatorio";
        break;
      default:
        break;
    }

    const doing = (
      <div id="recover-subContainer">
        <p id="recover-header">Reimposta la password</p>
        <p id="recover-explainer">
          Inserisci l'email associata con l'account con cui vuoi accedere. Ti
          invieremo una mail con la tua nuova password.
        </p>
        <form id="recover-form" onSubmit={this.handleSubmit}>
          <label
            id="recover-label"
            htmlFor="recover-input"
            className={
              this.state.inputStatus === "invalid" ||
              this.state.inputStatus === "noAccount" ||
              this.state.inputStatus === "empty"
                ? null
                : "hidden"
            }
          >
            {labelMessage}
          </label>
          <input
            autoComplete="OFF"
            type="text"
            id="recover-input"
            className={this.state.inputClass}
            placeholder={this.state.inputPlaceHolder}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
          />
          <input type="submit" className="hidden" />
          {this.state.loading ? (
            <p id="recover-confirm">loading...</p>
          ) : (
            <p id="recover-confirm" onClick={this.handleSubmit}>
              CONFERMA
            </p>
          )}
        </form>
      </div>
    );

    const success = (
      <div id="recover-subContainer" className="success">
        <p id="recover-success-shower">
          Password reimpostata con successo! Ti abbiamo appena mandato un'email
        </p>
      </div>
    );

    const bodyContainer = this.state.success ? success : doing;

    return (
      <div id="recover">
        <HeaderPart
          title={"RECOVER"}
          mainClass={"checkout"}
          imageId="libridoo-logo-image"
          headerClass="checkout-"
        />
        {bodyContainer}
      </div>
    );
  }
}

export default connect()(Recover);

import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./passwordInfo.css";

class PasswordInfo extends Component {
  state = {
    oldPsw: null,
    newPsw: null,
    confirmNewPsw: null,
    oldPswClass: null,
    newPswClass: null,
    confirmNewPswClass: null,
    oldPswPlaceholder: "vecchia password",
    newPswPlaceholder: "nuova password",
    confirmNewPswPlaceholder: "conferma",
    editing: false,
    loading: false,
    errorLabelMessage: null
  };

  handleEdit = () => {
    this.setState({ editing: true });
  };

  handleChange = e => {
    if (!e.target.value) {
      this.setState({
        [`${e.target.id}Class`]: "invalid-input",
        [`${e.target.id}Placeholder`]:
          e.target.id === "oldPsw"
            ? "*vecchia password*"
            : e.target.id === "newPsw"
            ? "*nuova password*"
            : "*conferma*"
      });
    } else {
      if (e.target.id === "newPsw" || e.target.id === "confirmNewPsw") {
        if (
          e.target.value !== this.state.newPsw &&
          e.target.value !== this.state.confirmNewPsw
        ) {
          // true if they are the same because state of current input not updated yet
          this.setState({
            confirmNewPswClass: "invalid-input"
          });
        } else if (e.target.value.length > 8 && e.target.value.length < 15) {
          this.setState({
            [`${e.target.id}Class`]: "correct-input"
          });
        } else {
          this.setState({
            [`${e.target.id}Class`]: null
          });
        }
      } else {
        // old psw
        if (e.target.value.length > 8 && e.target.value.length < 15) {
          this.setState({ oldPswClass: "correct-input" });
        } else {
          this.setState({ oldPswClass: null });
        }
      }
    }
    this.setState({
      [e.target.id]: e.target.value
    });
    if (this.state.errorLabelMessage) {
      this.setState({
        errorLabelMessage: null
      });
    }
  };

  handleBlur = e => {
    if (e.target.value.length < 8 || e.target.value.length > 15) {
      this.setState({
        [`${e.target.id}Class`]: "invalid-input",
        [`${e.target.id}Placeholder`]:
          e.target.id === "oldPsw"
            ? "*vecchia password*"
            : e.target.id === "newPsw"
            ? "*nuova password*"
            : "*conferma*"
      });
    } else {
      if (
        e.target.id === "confirmNewPsw" &&
        e.target.value !== this.state.newPsw
      ) {
        this.setState({ confirmNewPswClass: "invalid-input" });
      } else {
        this.setState({
          [`${e.target.id}Class`]: "correct-input",
          [`${e.target.id}Placeholder`]: null
        });
      }
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    if (!this.state.oldPsw || !this.state.newPsw || !this.state.confirmNewPsw) {
      this.setState({ errorLabelMessage: "Compila tutti i campi obbligatori" });
      // think dont have to do it, already done it in blur
      if (!this.state.oldPsw) {
        this.setState({
          oldPswClass: "invalid-input",
          oldPswPlaceholder: "*vecchia password*"
        });
      }
      if (!this.state.newPsw) {
        this.setState({
          newPswClass: "invalid-input",
          newPswPlaceholder: "*nuova password*"
        });
      }
      if (!this.state.confirmNewPsw) {
        this.setState({
          confirmNewPswClass: "invalid-input",
          confirmNewPswPlaceholder: "*conferma*"
        });
      }
    } else if (
      this.state.oldPsw.length < 8 ||
      this.state.oldPsw.length > 15 ||
      this.state.newPsw.length < 8 ||
      this.state.newPsw.length > 15 ||
      this.state.confirmNewPsw.length < 8 ||
      this.state.confirmNewPsw.length > 15
    ) {
      this.setState({
        errorLabelMessage:
          "La password deve essere lunga minimo 8 caratteri e massimo 15"
      });
    } else if (this.state.newPsw !== this.state.confirmNewPsw) {
      this.setState({
        errorLabelMessage: "La nuova password è diversa dalla sua conferma"
      });
    } else {
      // everything correct
      const body = {
        _id: this.props.user._id,
        oldPassword: this.state.oldPsw,
        newPassword: this.state.newPsw
      };
      this.setState({ loading: true });
      // delete loading because of code = 2 (for now, vecchia password errata)
      // this.setState({ loading: true });
      fetch("/api/user/passwordUpdate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then(jsonRes => {
          if (jsonRes.code === 1 || jsonRes.code === 1.5) {
            // error
            this.props.dispatch({
              type: "E-SET",
              error: {
                frontendPlace: "passwordInfo/handleSubmit/code1-1.5",
                jsonRes
              }
            });
            this.props.history.push("/error");
          } else if (jsonRes.code === 2) {
            this.setState({
              errorLabelMessage: "Vecchia password errata",
              loading: false,
              oldPswPlaceholder: "vecchia password",
              newPswPlaceholder: "nuova password",
              confirmNewPswPlaceholder: "conferma",
              oldPswClass: "invalid-input"
            });
          } else if (jsonRes.code === 0) {
            // correct
            // set user
            this.props.dispatch({ type: "SET-USER", user: jsonRes.activeUser });
            if (sessionStorage.getItem("JWT")) {
              // not rememberME
              sessionStorage.setItem("JWT", jsonRes.JWT);
            } else {
              // rememberMe, localStorage
              localStorage.setItem("JWT", jsonRes.JWT);
            }
            this.setState({
              oldPsw: null,
              newPsw: null,
              confirmNewPsw: null,
              oldPswClass: null,
              newPswClass: null,
              confirmNewPswClass: null,
              oldPswPlaceholder: "vecchia password",
              newPswPlaceholder: "nuova password",
              confirmNewPswPlaceholder: "conferma",
              editing: false,
              loading: false
            });
          }
        })
        .catch(error => {
          // store error and redirect
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "passwordInfo/handleSubmit/catch", error }
          });
          this.props.history.push("/error");
        });
    }
  };

  render() {
    const editing = this.props.user.passwordLength ? (
      <div className="body-gContainer">
        <i className="fas fa-lock-open set-ico top fa-1x"></i>
        <p id="header-text">Modifica la tua password</p>
        <div id="passwordInfo-form-container">
          <p
            id="passwordInfo-errorLabel"
            className={this.state.errorLabelMessage ? "" : "hidden"}
          >
            {this.state.errorLabelMessage}
          </p>
          <form
            className="body-container input-container"
            onSubmit={this.handleSubmit}
          >
            <input
              autoComplete="off"
              type="password"
              id="oldPsw"
              onChange={this.handleChange}
              onBlur={this.handleBlur}
              className={`info input ${this.state.oldPswClass}`}
              placeholder={this.state.oldPswPlaceholder}
            />
            <input
              autoComplete="off"
              type="password"
              id="newPsw"
              onChange={this.handleChange}
              onBlur={this.handleBlur}
              className={`info input ${this.state.newPswClass}`}
              placeholder={this.state.newPswPlaceholder}
            />
            <input
              autoComplete="off"
              type="password"
              id="confirmNewPsw"
              onChange={this.handleChange}
              onBlur={this.handleBlur}
              className={`info input ${this.state.confirmNewPswClass}`}
              placeholder={this.state.confirmNewPswPlaceholder}
            />
            <input type="submit" className="hidden" />
            {/* <i
              id="save"
              onClick={this.handleSubmit}
              className="fas fa-check fa-1x set-ico bottom"
            ></i> */}
            <p
              id="save"
              className="set-ico p-icon bottom"
              onClick={this.handleSubmit}
            >
              SALVA
            </p>
          </form>
        </div>
      </div>
    ) : null;

    const notEditing = this.props.user.passwordLength ? (
      <div className="body-container">
        <i className="fas fa-lock fa-1x set-ico top"></i>
        <p id="password-shower" className="info text">
          {"*".repeat(this.props.user.passwordLength)}
        </p>
        <i
          id="edit"
          onClick={this.handleEdit}
          className="fas fa-pen fa-1x set-ico bottom"
        ></i>
      </div>
    ) : null;

    const loading = (
      <div id="passwordInfo-loading">
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
    );

    let bodyComponent = this.state.editing ? editing : notEditing;
    if (this.state.loading) bodyComponent = loading;

    return (
      <div id="passwordInfo-gContainer" className="infoContainer">
        <div id="passwordInfo">{bodyComponent}</div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps)(withRouter(PasswordInfo));

import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./bodyInfo.css";

class BodyInfo extends Component {
  state = {
    editing: false,
    editingEmail: null,
    editingSchool: null,
    editingPhone: null,
    editingEmailClass: null,
    editingPhoneClass: null,
    editingSchoolClass: null,
    firstUpdated: false,
    editingEmailPlaceholder: "email",
    editingPhonePlaceholder: "numero",
    editingSchoolPlaceholder: "scuola/università",
    loading: false,
    editingEmailLabelMessage: null
  };

  componentDidMount = () => {
    this.setState({ loading: false });
  };

  componentDidUpdate = () => {
    if (this.props.user.DeliveryInfo) {
      // I have user
      if (!this.props.user.phone && !this.state.firstUpdated) {
        this.setState({ firstUpdated: true, editing: true });
      }
    }
  };

  emailValidation = email => {
    var re = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  handleEmailBlur = e => {
    if (e.target.id === "editingEmail") {
      if (!this.emailValidation(e.target.value) && e.target.value) {
        this.setState({
          editingEmailClass: "invalid-input"
        });
      } else {
        this.setState({
          editingEmailClass: "correct-input"
        });
      }
    } else {
      this.setState({
        [`${e.target.id}Class`]: "correct-input"
      });
    }
    if (!e.target.value) {
      this.setState({
        [`${e.target.id}Class`]: null
      });
    }
  };

  handleEdit = () => {
    this.setState({
      editing: true
    });
  };

  handleChange = e => {
    if (e.target.if === "editingEmail" && !e.target.value) {
      this.setState({ editingEmailClass: "correct-input" });
    }
    this.setState({
      [e.target.id]: e.target.value
    });
    if (e.target.id === "editingEmail" && this.state.editingEmailLabelMessage) {
      this.setState({
        editingEmailLabelMessage: null
      });
    }
    if (this.emailValidation(e.target.value)) {
      this.setState({ editingEmailClass: "correct-input" });
    } else {
      this.setState({ editingEmailClass: null });
    }
  };

  handleSave = e => {
    e.preventDefault();
    if (
      this.state.editingEmail &&
      !this.emailValidation(this.state.editingEmail)
    ) {
      this.setState({
        editingEmailClass: "invalid-input",
        editingEmailLabelMessage: "email non valida"
      });
    } else if (
      (!this.state.editingSchool && !this.props.user.school) ||
      (!this.state.editingPhone && !this.props.user.phone)
    ) {
      if (!this.state.editingSchool) {
        this.setState({
          editingSchoolClass: "invalid-input"
        });
      }
      if (!this.state.editingPhone) {
        this.setState({
          editingPhoneClass: "invalid-input",
          editingSchoolPlaceholder: "*telefono*"
        });
      }
    } else {
      const bodyInfo = {
        email: this.state.editingEmail || this.props.user.email,
        phone: this.state.editingPhone || this.props.user.phone,
        school: this.state.editingSchool || this.props.user.school
        // also schoolLogoURL associated with it
      };
      const body = {
        _id: this.props.user._id,
        defaultEmail: this.props.user.email,
        newBodyInfo: bodyInfo
      };
      this.setState({ loading: true });
      fetch("/api/user/bodyInfo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then(jsonRes => {
          if (jsonRes.code === 1) {
            // error
            this.props.dispatch({
              type: "E-SET",
              error: { frontendPlace: "bodyInfo/handleSave/code1", jsonRes }
            });
            this.props.history.push("/error");
          } else if (jsonRes.code === 2) {
            this.setState({
              editingEmailClass: "invalid-input",
              editingEmailLabelMessage:
                "email già registrata su un altro account",
              loading: false
            });
          } else {
            // code = 0
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
              editing: false,
              editingEmail: null,
              editingSchool: null,
              editingPhone: null,
              editingEmailClass: "correct-input",
              editingPhoneClass: "correct-input",
              editingSchoolClass: "correct-input",
              loading: false
            });
          }
        })
        .catch(error => {
          // store in reducer and redirect
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "bodyInfo/handleSave/catch", error }
          });
          this.props.history.push("/error");
        });
    }
  };

  render() {
    const notEditing = (
      <div id="notEditing-container" className="info-gContainer">
        <div id="email-container" className="info-container">
          <i id="email-ico" className="fas fa-at info-ico "></i>
          <span id="email-info" className="info-text">
            {this.props.user.email}
          </span>
        </div>
        <div id="phone-container" className="info-container">
          <i id="phone-ico" className="fas fa-mobile-alt info-ico"></i>
          <span id="phone-text" className="info-text">
            {this.props.user.phone}
          </span>
        </div>
        <div id="school-container" className="info-container">
          <i id="school-ico" className="fas fa-graduation-cap info-ico"></i>
          <span id="school-text" className="info-text">
            {this.props.user.school}
          </span>
        </div>
        <i
          id="edit"
          onClick={this.handleEdit}
          className="fas fa-pen fa-1x set-ico bottom"
        ></i>
      </div>
    );
    const editing = !this.state.loading ? (
      <div className="info-gContainer">
        <p id="header-text">Fatti contattare dai clienti</p>
        <form
          id="editing-container"
          className="info-container-inter"
          onSubmit={this.handleSave}
        >
          <label
            htmlFor="editingEmail"
            id="editingEmail-label"
            className={this.state.editingEmailLabelMessage ? "" : "hidden"}
          >
            {this.state.editingEmailLabelMessage}
          </label>
          <div id="email-e-container" className="info-container">
            <i id="email-e-ico" className="fas fa-at info-ico"></i>

            <input
              autoComplete="off"
              type="text"
              onChange={this.handleChange}
              onBlur={this.handleEmailBlur}
              id="editingEmail"
              placeholder={this.props.user.email}
              className={`info-text info-input ${this.state.editingEmailClass}`}
            />
          </div>
          <div id="phone-container" className="info-container">
            <i id="phone-ico" className="fas fa-mobile-alt info-ico"></i>
            <input
              autoComplete="off"
              type="number"
              onChange={this.handleChange}
              onBlur={this.handleEmailBlur}
              id="editingPhone"
              placeholder={this.props.user.phone || "*telefono*"}
              className={`info-text info-input ${this.state.editingPhoneClass}`}
            />
          </div>
          <div id="school-container" className="info-container">
            <i id="school-ico" className="fas fa-graduation-cap info-ico"></i>
            <input
              // in future, make it type select
              type="text"
              autoComplete="off"
              onBlur={this.handleEmailBlur}
              onChange={this.handleChange}
              id="editingSchool"
              placeholder={this.props.user.school || "*scuola/università*"}
              className={`info-text info-input ${this.state.editingSchoolClass}`}
            />
          </div>
          {/* <i
            id="save"
            onClick={this.handleSave}
            className="fas fa-check fa-1x set-ico bottom"
          ></i> */}
          <p
            id="save"
            className="set-ico p-icon bottom"
            onClick={this.handleSave}
          >
            SALVA
          </p>
          <input type="submit" className="hidden" />
        </form>
      </div>
    ) : (
      <div className="info-gContainer">
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

    const componentBody = this.state.editing ? editing : notEditing;

    return (
      <div id="bodyInfo-Gcontainer" className="infoContainer">
        <div id="bodyInfo">
          <i id="header" className="fas fa-address-card set-ico"></i>
          {componentBody}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps)(withRouter(BodyInfo));

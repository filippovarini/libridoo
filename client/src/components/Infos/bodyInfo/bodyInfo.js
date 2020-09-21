import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./bodyInfo.css";

import LoadingM from "../../Loading/loading_m";

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
    editingEmailLabelMessage: null,
    noSchool: false
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

  toggleNoSchool = e => {
    this.setState({ noSchool: !this.state.noSchool });
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
    if (this.props.user.school === "Non frequento un'università") {
      this.setState({
        noSchool: true
      });
    }
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
      !this.state.editingSchool &&
      (!this.props.user.school ||
        this.props.user.school === "Non frequento un'università") &&
      !this.state.noSchool
    ) {
      this.setState({
        editingSchoolClass: "invalid-input"
      });
    } else if (!this.state.editingPhone && !this.props.user.phone) {
      this.setState({
        editingPhoneClass: "invalid-input",
        editingSchoolPlaceholder: "*telefono*"
      });
    } else {
      const bodyInfo = {
        email: this.state.editingEmail || this.props.user.email,
        phone: this.state.editingPhone || this.props.user.phone,
        school: this.state.editingSchool || this.props.user.school
      };
      if (this.state.noSchool && !this.state.editingSchool) {
        bodyInfo.school = "Non frequento un'università";
      }
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
    const schoolContainerHiddenClass = this.state.noSchool ? "hidden" : null;

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
            <label id="plus-phone" htmlFor="editingPhone">
              +39
            </label>
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
          <div
            id="school-container"
            className={`info-container  ${schoolContainerHiddenClass}`}
          >
            <i id="school-ico" className="fas fa-graduation-cap info-ico"></i>
            <input
              // in future, make it type select
              // type="text"
              autoComplete="off"
              onBlur={this.handleEmailBlur}
              onChange={this.handleChange}
              id="editingSchool"
              list="universities"
              placeholder={
                this.props.user.school
                  ? this.props.user.school === "Non frequento un'università"
                    ? "*università*"
                    : this.props.user.school
                  : "università"
              }
              className={`info-text info-input ${this.state.editingSchoolClass}`}
            />
            <datalist id="universities">
              <option value="Università degli Studi di Verona" />
              <option value="Università degli Studi di Padova" />
              <option value="Università Ca Foscari di Venezia" />
              <option value="Università Iuav di Venezia" />
              <option value="Università della Valle d'Aosta" />
              <option value="Università per Stranieri di Perugia" />
              <option value="Università degli Studi di Perugia" />
              <option value="Università degli Studi di Trento" />
              <option value="Libera Università di Bolzano" />
              <option value="Università per Stranieri di Siena" />
              <option value="Università degli Studi di Siena" />
              <option value="Università degli Studi di Pisa" />
              <option value="Università degli Studi di Firenze" />
              <option value="Scuola Superiore di Studi Sant'Anna - Pisa" />
              <option value="Scuola Normale Superiore - Pisa" />
              <option value="Università degli Studi di Palermo" />
              <option value="Università degli Studi di Messina" />
              <option value="Università degli Studi di Catania" />
              <option value="Università degli Studi di Sassari" />
              <option value="Università degli Studi di Cagliari" />
              <option value="Università degli Studi del Salento" />
              <option value="Università degli Studi di Foggia" />
              <option value="Università degli Studi di Bari" />
              <option value="Politecnico di Bari" />
              <option value="LUM - Libera Università Mediterranea Jean Monnet" />
              <option value="Università di Scienze Gastronomiche" />
              <option value="Università degli Studi di Torino" />
              <option value="Università degli Studi del Piemonte Orientale" />
              <option value="Politecnico di Torino" />
              <option value="Università degli Studi del Molise" />
              <option value="Università degli Studi di Urbino Carlo Bo" />
              <option value="Università degli Studi di Macerata" />
              <option value="Università degli Studi di Camerino" />
              <option value="Università Politecnica delle Marche" />
              <option value="Università Vita-Salute San Raffaele" />
              <option value="Università degli Studi di Pavia" />
              <option value="Università degli Studi di Milano-Bicocca" />
              <option value="Università degli Studi di Milano" />
              <option value="Università degli Studi di Brescia" />
              <option value="Università degli Studi di Bergamo" />
              <option value="Università degli Studi dell'Insubria Varese-Como" />
              <option value="Università Commerciale Luigi Bocconi" />
              <option value="Università Cattolica del Sacro Cuore" />
              <option value="Università Carlo Cattaneo - LIUC" />
              <option value="Politecnico di Milano" />
              <option value="IULM - Libera Università di Lingue e Comunicazione" />
              <option value="Università degli Studi di Genova" />
              <option value="Università degli Studi Roma Tre" />
              <option value="Università degli Studi Europea di Roma" />
              <option value="Università degli Studi di Roma Tor Vergata" />
              <option value="Università degli Studi di Roma La Sapienza" />
              <option value="Università degli Studi di Cassino" />
              <option value="Università degli Studi della Tuscia" />
              <option value="Università Campus Bio-Medico di Roma" />
              <option value="LUMSA - Libera Università Maria Ss. Assunta" />
              <option value="LUISS - Guido Carli" />
              <option value="Libera Università degli Studi San Pio V" />
              <option value="IUSM - Università degli Studi di Roma Foro Italico" />
              <option value="Università degli Studi di Udine" />
              <option value="Università degli Studi di Trieste" />
              <option value="SISSA - Scuola Internazionale Superiore di Studi Avanzati" />
              <option value="Università degli Studi di Parma" />
              <option value="Università degli Studi di Modena e Reggio Emilia" />
              <option value="Università degli Studi di Ferrara" />
              <option value="Università degli Studi di Bologna" />
              <option value="Università degli Studi di Salerno" />
              <option value="Università degli Studi di Napoli Partenophe" />
              <option value="Università degli Studi di Napoli L'Orientale" />
              <option value="Università degli Studi di Napoli Federico II" />
              <option value="Università degli Studi del Sannio" />
              <option value="Seconda Università degli Studi di Napoli" />
              <option value="Istituto Universitario Suor Orsola Benincasa" />
              <option value="Università della Calabria" />
              <option value="Università degli Studi Mediterranea di Reggio Calabria" />
              <option value="Università degli Studi Magna Graecia di Catanzaro" />
              <option value="Università degli Studi della Basilicata" />
              <option value="Università degli Studi di Teramo" />
              <option value="Università degli Studi di L'Aquila" />
              <option value="Università degli Studi Gabriele D'Annunzio" />
            </datalist>
          </div>
          <div id="noSchool-container">
            <input
              type="checkbox"
              onChange={this.toggleNoSchool}
              id="noSchool-input"
              defaultChecked={
                this.props.user.school === "Non frequento un'università"
              }
            />
            <label htmlFor="noSchool-input" id="noSchool-label">
              Non frequento un'università
            </label>
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
        <LoadingM />
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

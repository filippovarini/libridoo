import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./deliveryInfo.css";

class DeliveryInfo extends Component {
  state = {
    editing: false,
    range: null,
    cost: null,
    timeToMeet: null,
    firstLabelClass: "hidden",
    secondLabelClass: "hidden",
    thirdLabelClass: "hidden",
    rangeClass: null,
    costClass: null,
    timeToMeetClass: null,
    costPlaceholder: "prezzo",
    timeToMeetPlaceholder: "numero",
    loading: false,
    firstUpdated: false
  };

  componentDidMount = () => {
    this.setState({ loading: false });
  };

  componentDidUpdate = () => {
    if (this.props.user.DeliveryInfo) {
      if (
        !this.props.user.DeliveryInfo.timeToMeet &&
        !this.state.firstUpdated
      ) {
        this.setState({ firstUpdated: true, editing: true, range: "NO" });
      }
    }
  };

  handleEdit = () => {
    const DeliveryInfo = this.props.user.DeliveryInfo;
    if (DeliveryInfo) {
      this.setState({
        rangeClass: "correct-input",
        costClass: "correct-input",
        timeToMeetClass: "correct-input",
        range: DeliveryInfo.range,
        cost: DeliveryInfo.cost,
        timeToMeet: DeliveryInfo.timeToMeet
      });
    }
    this.setState({
      editing: true
    });
  };

  handleChange = e => {
    if (!e.target.value) {
      this.setState({
        [`${e.target.id}Class`]: "invalid-input",
        [`${e.target.id}Placeholder`]: "***"
      });
    }
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  handleBlur = e => {
    if (!e.target.value) {
      this.setState({
        [`${e.target.id}Class`]: "invalid-input",
        [`${e.target.id}Placeholder`]: "***"
      });
    } else {
      this.setState({
        [`${e.target.id}Class`]: "correct-input",
        [`${e.target.id}Placeholder`]: `${e.target.id}`
      });
    }
  };

  handleOver = e => {
    this.setState({
      [`${e.target.id}Class`]: null
    });
  };

  handleOut = e => {
    this.setState({
      [`${e.target.id}LabelClass`]: "hidden"
    });
  };

  handleSave = e => {
    e.preventDefault();
    if (this.state.range && this.state.range !== "NO" && !this.state.cost) {
      alert("Compila tutti i campi obbligatori nel modo corretto");
      this.setState({
        costClass: "invalid-input",
        costPlaceholder: "***"
      });
    } else if (!this.state.timeToMeet) {
      alert("Compila tutti i campi obbligatori nel modo corretto");
      this.setState({
        timeToMeetClass: "invalid-input",
        timeToMeetPlaceholder: "***"
      });
    } else {
      const DeliveryInfo =
        !this.state.range || this.state.range === "NO"
          ? {
              range: "NO",
              timeToMeet: Number(this.state.timeToMeet),
              cost: null
            }
          : {
              range: this.state.range,
              timeToMeet: Number(this.state.timeToMeet),
              cost: Number(this.state.cost)
            };
      const body = {
        _id: this.props.user._id,
        deliveryUpdate: { DeliveryInfo }
      };
      this.setState({ loading: true });
      fetch("/api/user/delivery", {
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
              error: { frontendPlace: "deliveryInfo/handleSave/code1", jsonRes }
            });
            this.props.history.push("/error");
          } else if (jsonRes.code === 0) {
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
              range: null,
              cost: null,
              timeToMeet: null,
              firstLabelClass: "hidden",
              secondLabelClass: "hidden",
              thirdLabelClass: "hidden",
              rangeClass: null,
              costClass: null,
              timeToMeetClass: null,
              costPlaceholder: "prezzo",
              timeToMeetPlaceholder: "numero",
              loading: false
            });
          }
        })
        .catch(error => {
          // store and redirect
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "deliveryInfo/handleSave/catch", error }
          });
          this.props.history.push("/error");
        });
    }
  };

  render() {
    let outputRange = "";
    if (this.props.user.DeliveryInfo) {
      switch (this.props.user.DeliveryInfo.range) {
        case "country":
          outputRange = `in ${this.props.user.place.country}`;
          break;
        case "region":
          outputRange = "nella mia regione";
          break;
        case "city":
          outputRange = "nella mia città";
          break;
        default:
          outputRange = "NO";
          break;
      }
    }
    const country = this.props.user.place
      ? this.props.user.place.country
      : "nazione";

    const singleEditing = this.props.user.DeliveryInfo ? (
      <div className="header-container">
        <p id="header-text">
          Fagli sapere se spedisci e quando sei disposto ad incontrarti
        </p>
        <form onSubmit={this.handleSave} className="body-container">
          <div className="body text single">
            <p
              id="first"
              onMouseLeave={this.handleOut}
              className={`info-label-explainer editing ${this.state.firstLabelClass}`}
            >
              Se sei disposto a spedire i libri al cliente con un corriere,
              seleziona dove lo faresti.
            </p>
            <span
              id="firstLabel"
              className="info-label"
              onMouseOver={this.handleOver}
            >
              SPEDISCO:
            </span>
            <select
              id="range"
              onChange={this.handleChange}
              className="info input"
              defaultValue="NO"
            >
              <option value="NO">NO</option>
              <option value="country">In {country || "nazione"}</option>
              <option value="region">Nella mia regione</option>
              <option value="city">Nella mia città</option>
            </select>
          </div>
          <div className="body text single">
            <p
              id="third"
              onMouseLeave={this.handleOut}
              className={`info-label-explainer ${this.state.thirdLabelClass}`}
            >
              I clienti della tua città vogliono sapere entro quanti giorni sei
              disposto ad incontrarti con loro
            </p>
            <span
              id="thirdLabel"
              className="info-label"
              onMouseOver={this.handleOver}
            >
              INCONTRO:
            </span>
            <div
              id="timeToMeet-container"
              className="input-container info input"
            >
              <span id="timeToMeet-within" className="input-span">
                Entro
              </span>
              <input
                autoComplete="off"
                type="number"
                id="timeToMeet"
                defaultValue={this.props.user.DeliveryInfo.timeToMeet || null}
                placeholder={this.state.timeToMeetPlaceholder}
                className={`contained-input ${this.state.timeToMeetClass}`}
                onChange={this.handleChange}
                onBlur={this.handleBlur}
              />
              <span id="timeToMeet-days" className="input-span">
                giorni
              </span>
            </div>
          </div>
          <i
            id="save"
            onClick={this.handleSave}
            className="fas fa-check fa-1x set-ico bottom"
          ></i>
          <input type="submit" className="hidden" />
        </form>
      </div>
    ) : null;
    const singleNotEditing = this.props.user.DeliveryInfo ? (
      <div className="body-container">
        <div className="body text single">
          <p
            id="first"
            onMouseLeave={this.handleOut}
            className={`info-label-explainer editing ${this.state.firstLabelClass}`}
          >
            Se sei disposto a spedire i libri al cliente con un corriere,
            seleziona dove lo faresti.
          </p>
          <span
            id="firstLabel"
            className="info-label"
            onMouseOver={this.handleOver}
          >
            SPEDISCO:
          </span>
          <p id="range" className="info">
            {outputRange}
          </p>
        </div>
        <div className="body text single">
          <p
            id="third"
            onMouseLeave={this.handleOut}
            className={`info-label-explainer ${this.state.thirdLabelClass}`}
          >
            I clienti della tua città vogliono sapere entro quanti giorni sei
            disposto ad incontrarti con loro
          </p>
          <span
            id="thirdLabel"
            className="info-label"
            onMouseOver={this.handleOver}
          >
            INCONTRO:
          </span>
          <p id="range" className="info">
            Entro {this.props.user.DeliveryInfo.timeToMeet} giorni
          </p>
        </div>
        <i
          id="edit"
          onClick={this.handleEdit}
          className="fas fa-edit fa-1x set-ico bottom"
        ></i>
      </div>
    ) : null;
    const loading = <h1>loading...</h1>;

    const editing = this.props.user.DeliveryInfo ? (
      <div className="header-container">
        <p id="header-text">
          Compila informazioni su spedizioni ed incontri per i tuoi clienti
        </p>
        <form id="form" className="body-container" onSubmit={this.handleSave}>
          <div className="body text">
            <p
              id="first"
              onMouseLeave={this.handleOut}
              className={`info-label-explainer editing ${this.state.firstLabelClass}`}
            >
              Se sei disposto a spedire i libri al cliente con un corriere,
              seleziona dove lo faresti.
            </p>
            <span
              id="firstLabel"
              className="info-label"
              onMouseOver={this.handleOver}
            >
              SPEDISCO:
            </span>
            <select
              id="range"
              onChange={this.handleChange}
              className="info input"
              defaultValue={
                this.state.range || this.props.user.DeliveryInfo.range
              }
            >
              <option value="NO">NO</option>
              <option value="country">In {country || "nazione"}</option>
              <option value="region">Nella mia regione</option>
              <option value="city">Nella mia città</option>
            </select>
          </div>
          <div className="body text">
            <p
              id="second"
              onMouseLeave={this.handleOut}
              className={`info-label-explainer ${this.state.secondLabelClass}`}
            >
              Seleziona il prezzo aggiuntivo che il cliente dovrà pagarti, dal
              momento che il corriere è a carico.
            </p>
            <span
              id="secondLabel"
              className="info-label"
              onMouseOver={this.handleOver}
            >
              PER:
            </span>
            <div id="cost-container" className="input-container info input">
              <input
                autoComplete="off"
                type="number"
                id="cost"
                defaultValue={this.props.user.DeliveryInfo.cost || null}
                placeholder={this.state.costPlaceholder}
                className={`contained-input ${this.state.costClass}`}
                onChange={this.handleChange}
                onBlur={this.handleBlur}
              />
              <span id="cost-euro" className="input-span">
                euro
              </span>
            </div>
          </div>
          <div className="body text">
            <p
              id="third"
              onMouseLeave={this.handleOut}
              className={`info-label-explainer ${this.state.thirdLabelClass}`}
            >
              I clienti della tua città vogliono sapere entro quanti giorni sei
              disposto ad incontrarti con loro
            </p>
            <span
              id="thirdLabel"
              className="info-label"
              onMouseOver={this.handleOver}
            >
              INCONTRO:
            </span>
            <div
              id="timeToMeet-container"
              className="input-container info input"
            >
              <span id="timeToMeet-within" className="input-span">
                Entro
              </span>
              <input
                autoComplete="off"
                type="number"
                id="timeToMeet"
                defaultValue={
                  this.state.timeToMeet ||
                  this.props.user.DeliveryInfo.timeToMeet ||
                  null
                }
                placeholder={this.state.timeToMeetPlaceholder}
                className={`contained-input ${this.state.timeToMeetClass}`}
                onChange={this.handleChange}
                onBlur={this.handleBlur}
              />
              <span id="timeToMeet-days" className="input-span">
                giorni
              </span>
            </div>
          </div>
          <i
            id="save"
            onClick={this.handleSave}
            className="fas fa-check fa-1x set-ico bottom"
          ></i>
          <input type="submit" className="hidden" />
        </form>
      </div>
    ) : null;

    const notEditing = this.props.user.DeliveryInfo ? (
      <div id="notEditing" className="body-container">
        <div className="body text">
          <p
            id="first"
            onMouseLeave={this.handleOut}
            className={`info-label-explainer ${this.state.firstLabelClass}`}
          >
            Se sei disposto a spedire i libri al cliente con un corriere,
            seleziona dove lo faresti.
          </p>
          <span
            id="firstLabel"
            className="info-label"
            onMouseOver={this.handleOver}
          >
            SPEDISCO:
          </span>
          <p id="range" className="info">
            {outputRange}
          </p>
        </div>
        <div className="body text">
          <p
            id="second"
            onMouseLeave={this.handleOut}
            className={`info-label-explainer ${this.state.secondLabelClass}`}
          >
            Seleziona il prezzo aggiuntivo che il cliente dovrà pagarti, dal
            momento che il corriere è a carico.
          </p>
          <span
            id="secondLabel"
            className="info-label"
            onMouseOver={this.handleOver}
          >
            PER:
          </span>
          <p id="cost" className="info">
            {this.props.user.DeliveryInfo.cost} euro
          </p>
        </div>
        <div className="body text">
          <p
            id="third"
            onMouseLeave={this.handleOut}
            className={`info-label-explainer ${this.state.thirdLabelClass}`}
          >
            I clienti della tua città vogliono sapere entro quanti giorni sei
            disposto ad incontrarti con loro
          </p>
          <span
            id="thirdLabel"
            className="info-label"
            onMouseOver={this.handleOver}
          >
            INCONTRO:
          </span>
          <p id="range" className="info">
            Entro {this.props.user.DeliveryInfo.timeToMeet} giorni
          </p>
        </div>
        <i
          id="edit"
          onClick={this.handleEdit}
          className="fas fa-edit fa-1x set-ico bottom"
        ></i>
      </div>
    ) : null;

    const single = this.state.editing ? singleEditing : singleNotEditing;
    const full = this.state.editing ? editing : notEditing;

    let bodyComponent = full;

    if (this.props.user.DeliveryInfo) {
      if (
        (!this.state.editing && this.props.user.DeliveryInfo.range === "NO") ||
        (this.state.editing && (this.state.range === "NO" || !this.state.range))
      ) {
        bodyComponent = single;
      }
    }

    if (this.state.loading) {
      bodyComponent = loading;
    }

    return (
      <div id="deliveryInfo" className="infoContainer">
        <div id="container">
          <i id="header-ico" className="fas fa-truck set-ico fa-1x"></i>
          {bodyComponent}
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

export default connect(mapStateToProps)(withRouter(DeliveryInfo));

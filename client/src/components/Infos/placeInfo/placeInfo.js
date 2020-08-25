import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./placeInfo.css";

class PlaceInfo extends Component {
  state = {
    country: "Italia",
    region: null,
    city: null,
    countryClass: "correct-input",
    regionClass: null,
    cityClass: null,
    countryPlaceholder: "stato",
    regionPlaceholder: "regione",
    cityPlaceholder: "città",
    loading: false,
    errorLabelMessage: null
  };

  handleChange = e => {
    if (!e.target.value) {
      this.setState({
        [`${e.target.id}Class`]: "invalid-input",
        [`${e.target.id}Placeholder`]:
          e.target.id === "country"
            ? "*stato*"
            : e.target.id === "city"
            ? "*città*"
            : "*regione*"
      });
    } else {
      this.setState({ [`${e.target.id}Class`]: null });
    }
    this.setState({
      [e.target.id]: e.target.value
    });
    if (!this.state.errorLabelHidden) {
      this.setState({ errorLabelHidden: null });
    }
    if (e.target.id === "region") {
      this.setState({ regionClass: null });
    }
  };

  handleBlur = e => {
    if (!e.target.value) {
      this.setState({
        [`${e.target.id}Class`]: "invalid-input",
        [`${e.target.id}Placeholder`]:
          e.target.id === "country"
            ? "*stato*"
            : e.target.id === "city"
            ? "*città*"
            : "*regione*"
      });
    } else {
      this.setState({
        [`${e.target.id}Class`]: "correct-input"
      });
    }
    if (e.target.id === "region") {
      const regions = [
        "Abruzzo",
        "Basilicata",
        "Calabria",
        "Campania",
        "Emilia Romagna",
        "Friuli Venezia Giulia",
        "Lazio",
        "Liguria",
        "Lombardia",
        "Marche",
        "Molise",
        "Piemonte",
        "Puglia",
        "Sardegna",
        "Sicilia",
        "Toscana",
        "Trentino Alto Adige",
        "Umbria",
        "Valle d'Aosta",
        "Veneto"
      ];
      if (regions.indexOf(e.target.value) === -1) {
        this.setState({ regionClass: "invalid-input" });
      } else {
        this.setState({ regionClass: "correct-input" });
      }
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    const regions = [
      "Abruzzo",
      "Basilicata",
      "Calabria",
      "Campania",
      "Emilia Romagna",
      "Friuli Venezia Giulia",
      "Lazio",
      "Liguria",
      "Lombardia",
      "Marche",
      "Molise",
      "Piemonte",
      "Puglia",
      "Sardegna",
      "Sicilia",
      "Toscana",
      "Trentino Alto Adige",
      "Umbria",
      "Valle d'Aosta",
      "Veneto"
    ];
    if (!this.state.country || !this.state.region || !this.state.city) {
      this.setState({ errorLabelMessage: "Compila tutti i campi obbligatori" });
      if (!this.state.country) {
        this.setState({
          countryClass: "invalid-input",
          countryPlaceholder: "*stato*"
        });
      }
      if (!this.state.region) {
        this.setState({
          regionClass: "invalid-input",
          regionPlaceholder: "*regione*"
        });
      }
      if (!this.state.city) {
        this.setState({
          cityClass: "invalid-input",
          cityPlaceholder: "*città*"
        });
      }
    } else if (regions.indexOf(this.state.region) === -1) {
      // new input
      this.setState({ errorLabelMessage: "Inserisci una regione valida" });
    } else if (
      // eslint-disable-next-line no-restricted-globals
      confirm(
        "Sicuro che il domicilio sia giusto? Una volta confermato non potrai più cambiarlo."
      )
    ) {
      const place = {
        country: this.state.country,
        region: this.state.region,
        city: this.state.city
      };
      const body = {
        _id: this.props.user._id,
        placeUpdate: { place }
      };
      this.setState({ loading: true });
      fetch("/api/user/place", {
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
              error: {
                frontendPlace: "placeInfo/handleSubmit/code1",
                jsonRes
              }
            });
          } else {
            // correct
            this.props.dispatch({ type: "SET-USER", user: jsonRes.activeUser });
            if (sessionStorage.getItem("JWT")) {
              // not rememberME
              sessionStorage.setItem("JWT", jsonRes.JWT);
            } else {
              // rememberMe, localStorage
              localStorage.setItem("JWT", jsonRes.JWT);
            }
          }
          this.setState({
            countryClass: null,
            regionClass: null,
            cityClass: null,
            countryPlaceholder: "stato",
            regionPlaceholder: "regione",
            cityPlaceholder: "città",
            loading: false
          });
        })
        .catch(error => {
          // store and redirect
          this.props.dispatch({
            type: "E-SET",
            error: {
              frontendPlace: "placeInfo/handleSubmit/catch",
              error
            }
          });
          this.setState({
            country: "Itala",
            region: null,
            city: null,
            countryClass: null,
            regionClass: null,
            cityClass: null,
            countryPlaceholder: "stato",
            regionPlaceholder: "regione",
            cityPlaceholder: "città",
            loading: false
          });
          this.props.history.push("/error");
        });
    }
  };

  render() {
    let notEditing = null;
    if (this.props.user.name) {
      notEditing = (
        <div id="notEditing-placeInfoBody" className="placeInfoBody">
          <p id="country" className="placeInfo text">
            {this.props.user.place.country}
          </p>
          <p id="region" className="placeInfo text">
            {this.props.user.place.region}
          </p>
          <p id="city" className="placeInfo text">
            {this.props.user.place.city}
          </p>
        </div>
      );
    }

    // !!!! implement SELECT !!!
    const editing = (
      <div id="editing-placeInfoBody">
        <div id="placeInfo-header-container">
          <p id="header-text">Fai sapere ai clienti di dove sei</p>
        </div>
        <div id="placeInfo-form-container">
          <p
            id="placeInfo-error-label"
            className={this.state.errorLabelMessage ? "" : "hidden"}
          >
            {this.state.errorLabelMessage}
          </p>
          <form
            id="placeInfo-form"
            className="placeInfoBody form"
            onSubmit={this.handleSubmit}
          >
            <input
              autoComplete="off"
              id="country"
              type="text"
              defaultValue="Italia"
              onChange={this.handleChange}
              onBlur={this.handleBlur}
              className={`placeInfo ${this.state.countryClass}`}
              placeholder={this.state.countryPlaceholder}
            />
            <input
              autoComplete="off"
              id="region"
              type="text"
              onChange={this.handleChange}
              onBlur={this.handleBlur}
              className={`placeInfo ${this.state.regionClass}`}
              placeholder={this.state.regionPlaceholder}
              list="place-region-list"
            />
            <datalist id="place-region-list">
              <option value="Abruzzo">Abruzzo</option>
              <option value="Basilicata">Basilicata</option>
              <option value="Calabria">Calabria</option>
              <option value="Campania">Campania</option>
              <option value="Emilia Romagna">Emilia Romagna</option>
              <option value="Friuli Venezia Giulia">
                Friuli Venezia Giulia
              </option>
              <option value="Lazio">Lazio</option>
              <option value="Liguria">Liguria</option>
              <option value="Lombardia">Lombardia</option>
              <option value="Marche">Marche</option>
              <option value="Molise">Molise</option>
              <option value="Piemonte">Piemonte</option>
              <option value="Puglia">Puglia</option>
              <option value="Sardegna">Sardegna</option>
              <option value="Sicilia">Sicilia</option>
              <option value="Toscana">Toscana</option>
              <option value="Trentino Alto Adige">Trentino Alto Adige</option>
              <option value="Umbria">Umbria</option>
              <option value="Valle d'Aosta">Valle d’Aosta</option>
              <option value="Veneto">Veneto</option>
            </datalist>
            <input
              autoComplete="off"
              id="city"
              type="text"
              onChange={this.handleChange}
              onBlur={this.handleBlur}
              className={`placeInfo ${this.state.cityClass}`}
              placeholder={this.state.cityPlaceholder}
            />
            <input type="submit" className="hidden" />
          </form>
        </div>
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
      </div>
    );

    const loading = (
      <div id="placeInfo-loading">
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

    let placeInfoBody = notEditing;
    if (this.props.user.place) {
      if (!this.props.user.place.country) {
        placeInfoBody = editing;
      }
    }
    const placeInfoGBody = this.state.loading ? loading : placeInfoBody;
    return (
      <div id="placeInfo-gContainer">
        <div id="placeInfo">
          <i id="ico" className="fas fa-home fa-1x set-ico"></i>
          {placeInfoGBody}
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

export default connect(mapStateToProps)(withRouter(PlaceInfo));

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
    loading: false
  };

  handleChange = e => {
    if (!e.target.value) {
      this.setState({
        [`${e.target.id}Class`]: "invalid-input",
        [`${e.target.id}Placeholder`]: "*campo obbligatorio"
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
        [`${e.target.id}Placeholder`]: "*campo obbligatorio"
      });
    } else {
      this.setState({
        [`${e.target.id}Class`]: "correct-input"
      });
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    if (!this.state.country || !this.state.region || !this.state.city) {
      alert("Compila tutti i campi obbligatori");
      if (!this.state.country) {
        this.setState({
          countryClass: "invalid-input",
          countryPlaceholder: "*campo obbligatorio"
        });
      }
      if (!this.state.region) {
        this.setState({
          regionClass: "invalid-input",
          regionPlaceholder: "*campo obbligatorio"
        });
      }
      if (!this.state.city) {
        this.setState({
          cityClass: "invalid-input",
          cityPlaceholder: "*campo obbligatorio"
        });
      }
    } else if (
      // eslint-disable-next-line no-restricted-globals
      confirm(
        "Sei sicuro di aver inserito i dati giusti? Una volta confermato non potrai più cambiarli."
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
        <form className="placeInfoBody form" onSubmit={this.handleSubmit}>
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
          />
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
        <i
          id="save"
          onClick={this.handleSubmit}
          className="fas fa-check fa-1x set-ico bottom"
        ></i>
      </div>
    );

    const loading = <h1>loading...</h1>;

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

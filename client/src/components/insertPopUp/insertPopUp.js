import React, { Component } from "react";
import "./insertPopUp.css";

import LoadingM from "../Loading/loading_m";

class InsertPopUp extends Component {
  render() {
    const loaded = (
      <div id="ip">
        <i className="fas fa-times" onClick={this.props.toggleIp}></i>
        <p id="header">LANCIAMO INSIEME LA COMMUNITY</p>
        <p id="sub">SIAMO APPENA PARTITI ED ABBIAMO POCHI ANNUNCI</p>
        <p id="body">
          Se vuoi trovare i libri che cerchi, pubblica quelli che non vuoi, per
          far si che studenti come te li possano trovare.
        </p>
      </div>
    );

    const loading = (
      <div id="ip" className="loading">
        <LoadingM />
      </div>
    );

    const body = this.props.loading ? loading : loaded;
    return (
      <div id="ip-container" className={this.props.IpDisplay}>
        {body}
      </div>
    );
  }
}

export default InsertPopUp;

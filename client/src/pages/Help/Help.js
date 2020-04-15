import React, { Component } from "react";
import "./Help.css";

class Help extends Component {
  state = {
    buyHover: false,
    sellHover: false,
    inviteHover: false
  };

  over = div => {
    this.setState({
      [div]: true
    });
  };

  leave = div => {
    this.setState({
      [div]: false
    });
  };

  render() {
    return (
      <div id="help">
        <div id="help-image-container">
          <p id="help-fake-header">AIUTO</p>
        </div>
        <div id="help-main-gContainer">
          <div
            className="help-main-outContainer"
            onMouseOver={() => {
              this.over("buyHover");
            }}
            onTouchStart={() => {
              this.over("buyHover");
            }}
            onMouseLeave={() => {
              this.leave("buyHover");
            }}
            onTouchEnd={() => {
              this.leave("buyHover");
            }}
          >
            {!this.state.buyHover ? (
              <div
                id="help-main-header-container"
                className="help-main-container"
              >
                <p className="help-main help-header">COMPRARE</p>
              </div>
            ) : (
              <div className="help-main-container">
                <p className="help-main">1. Cerca tutti i libri</p>
                <p className="help-main">2. Selezionali</p>
                <p className="help-main">3. Fatteli Spedire (se vuoi)</p>
                <p className="help-main">4. Paga</p>
                <p className="help-main">
                  5. Contatta i venditori ed organizzati per la consegna
                </p>
                <p className="help-main">6. Conferma l'avvenuta consegna</p>
              </div>
            )}
          </div>
          <div
            className="help-main-outContainer"
            onMouseOver={() => {
              this.over("sellHover");
            }}
            onTouchStart={() => {
              this.over("sellHover");
            }}
            onMouseLeave={() => {
              this.leave("sellHover");
            }}
            onTouchEnd={() => {
              this.leave("sellHover");
            }}
          >
            {!this.state.sellHover ? (
              <div
                id="help-main-header-container"
                className="help-main-container"
              >
                <p className="help-main help-header">VENDERE</p>
              </div>
            ) : (
              <div className="help-main-container">
                <p className="help-main">1. Caricali sul sito</p>
                <p className="help-main">2. Falli comprare</p>
                <p className="help-main">
                  3. Leggi la mail con le informazioni di vendita che ti inviamo
                </p>
                <p className="help-main">
                  4. Organizzati con il compratore per la consegna
                </p>
                <p className="help-main">
                  5. Spedisci i libri se lui lo ha selezionato (e pagato)
                </p>
                <p className="help-main">
                  6. Ricevi i soldi solo dopo che lui ha confermato l'avvenuta
                  consegna
                </p>
              </div>
            )}
          </div>
        </div>
        <div
          id="help-outContainer"
          onMouseOver={() => {
            this.over("inviteHover");
          }}
          onTouchStart={() => {
            this.over("inviteHover");
          }}
          onMouseLeave={() => {
            this.leave("inviteHover");
          }}
          onTouchEnd={() => {
            this.leave("inviteHover");
          }}
        >
          {!this.state.inviteHover ? (
            <div id="help-header-container" className="help-container">
              <p className="help-info help-single-header">
                GUADAGNARE INVITANDO AMICI
              </p>
            </div>
          ) : (
            <div className="help-container">
              <p className="help-info">
                1. Copia il link che trovi sulla pagina{" "}
                <a href="/invite">https://libridoo.it/invite</a>
              </p>
              <p className="help-info">2. Mandalo a più amici possibili</p>
              <p className="help-info">
                3. Ottieni 5 punti per ogni amico iscritto
              </p>
              <p className="help-info">
                4. Ogni punto ti da sconti sui libri che compri
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Help;
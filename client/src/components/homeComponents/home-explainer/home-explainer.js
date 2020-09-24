import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./home-explainer.css";

class HomeExplainer extends Component {
  state = {
    nav: "buy"
  };

  handleNavChange = nav => {
    this.setState({ nav });
  };

  render() {
    return (
      <div id="hmg">
        <div id="hec">
          <div id="explainer-contained">
            <div id="nav-container">
              <p id="nav-header">COME FUNZIONA LIBRIDOO?</p>
              <div id="navs">
                <p
                  id="buy-nav"
                  className={`nav ${this.state.nav === "buy" ? "active" : ""}`}
                  onClick={() => this.handleNavChange("buy")}
                >
                  COMPRA
                </p>
                <p
                  id="buy-nav"
                  className={`nav ${this.state.nav === "sell" ? "active" : ""}`}
                  onClick={() => this.handleNavChange("sell")}
                >
                  VENDI
                </p>
                <p
                  id="buy-nav"
                  className={`nav ${this.state.nav === "earn" ? "active" : ""}`}
                  onClick={() => this.handleNavChange("earn")}
                >
                  GUADAGNA
                </p>
              </div>
            </div>
            <div id="steps-container">
              <div className="half">
                <div className="step-container">
                  <p className="step-number">1</p>
                  <p className="step-text-header">
                    {this.state.nav === "buy"
                      ? "CERCA E PAGA"
                      : this.state.nav === "sell"
                      ? "INSERISCI"
                      : "PORTA AMICI"}
                  </p>
                  {this.state.nav === "earn" ? (
                    <p className="step-text">
                      Fai iscrivere gli amici condividendo il link che trovi{" "}
                      <Link style={{ color: "white" }} to="/invite">
                        qui
                      </Link>
                    </p>
                  ) : (
                    <p className="step-text">
                      {this.state.nav === "buy"
                        ? "Ti aiuteremo a trovare i libri venduti dallo stesso proprietario, per evitare troppi incontri"
                        : "Pubblica gratuitamente e scegli se incassare su PayPal o attraverso un bonifico"}
                    </p>
                  )}
                </div>
                <div className="step-container">
                  <p className="step-number">2</p>
                  <p className="step-text-header">
                    {this.state.nav === "buy"
                      ? "OTTIENI I CONTATTI"
                      : this.state.nav === "sell"
                      ? "RICEVI UN ORDINE"
                      : "SEGUICI SU INSTA"}
                  </p>
                  <p className="step-text">
                    {this.state.nav === "buy"
                      ? "Ti invieremo via email i contatti dei venditori per organizzare la consegna."
                      : this.state.nav === "sell"
                      ? "Ti notificheremo via email, mandandoti i contatti dei compratori per organizzarti per la consegna"
                      : "Segui la nostra pagina @libridoo.it su Instagram e Facebook"}
                  </p>
                </div>
              </div>
              <div className="half">
                <div className="step-container">
                  <p className="step-number">3</p>
                  <p className="step-text-header">
                    {this.state.nav === "buy"
                      ? "RICEVI L'ORDINE"
                      : this.state.nav === "sell"
                      ? "CONSEGNA"
                      : "CONDIVIDI"}
                  </p>

                  {this.state.nav === "earn" ? (
                    <p className="step-text">
                      Condividi i post che trovi{" "}
                      <Link style={{ color: "white" }} to="/invite">
                        qui
                      </Link>{" "}
                      su instagram per 24h, taggando @libridoo.it
                    </p>
                  ) : (
                    <p className="step-text">
                      {this.state.nav === "buy"
                        ? "Organizzati con il venditore per l'incontro o la spedizione, qualora l'avessi selezionata"
                        : "Contatta il cliente per incontrarti o spedire l'ordine. Ricorda, il cliente giá ha pagato per i libri"}
                    </p>
                  )}
                </div>
                <div className="step-container">
                  <p className="step-number">4</p>
                  <p className="step-text-header">
                    {this.state.nav === "buy"
                      ? "CONFERMA"
                      : this.state.nav === "sell"
                      ? "INCASSA"
                      : "INCASSA"}
                  </p>
                  <p className="step-text">
                    {this.state.nav === "buy"
                      ? "Ricevuto l'ordine, confermalo, per far sì che il venditore venga pagato"
                      : this.state.nav === "sell"
                      ? "Ricorda all'compratore di confermare l'ordine, per poter ricevere il pagamento"
                      : "Guadagni 1 punto per ogni azione. 10 punti equivalgono ad uno sconto del 10%"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="medium-black">
          VENDI E COMPRA I TUOI LIBRI UNIVERSITARI IN 10 SECONDI
        </div>
        <div id="sell-prompt-container">
          <div id="sell-prompt-contained">
            <p id="sell-prompt">GUADAGNA SUBITO</p>
            <p id="sell-confirm" onClick={this.props.toggleBookInfoDisplay}>
              VENDI
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default HomeExplainer;

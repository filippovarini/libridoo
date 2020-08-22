import React, { Component } from "react";
import "./Help.css";

class Help extends Component {
  state = {
    nav: "buy"
  };

  handleCick = e => {
    this.setState({
      nav: e.target.id
    });
  };

  render() {
    const buyExplainer = (
      <div id="help-buy-explainer" className="help-explainer-container">
        {/* <p className="help-exp-header">COMPRARE</p> */}
        <div className="exp-sub-container">
          <div className="explainer">
            <i className="fas fa-search exp-ico"></i>
            <p className="exp-title">Cerca</p>
            <p className="exp-description">
              Cerca tutti i libri che stai cercando prima di procedere.
            </p>
          </div>
          <div className="explainer">
            <i className="far fa-hand-pointer exp-ico"></i>
            <p className="exp-title">Scegli</p>
            <p className="exp-description">
              Ti aiuteremo a trovare i libri venduti dallo stesso proprietario,
              così da risparmiarti qualche incontro.
            </p>
          </div>
          <div className="explainer">
            <i className="fas fa-truck exp-ico"></i>
            <p className="exp-title">Spedizione</p>
            <p className="exp-description">
              Scegli se farteli spedire direttamente a casa.
            </p>
          </div>
          <div className="explainer">
            <i className="fas fa-cash-register exp-ico"></i>
            <p className="exp-title">Paga</p>
            <p className="exp-description">
              Paga tutto in anticipo, così da dover solo ritirare i libri.
            </p>
          </div>
          <div className="explainer">
            <i className="fas fa-envelope-open-text exp-ico"></i>
            <p className="exp-title">Email</p>
            <p className="exp-description">
              Visualizza l'email che ti mandiamo dopo il pagamento, con tutte le
              informazioni per contattare i venditori.
            </p>
          </div>
          <div className="explainer">
            <i className="fas fa-handshake exp-ico"></i>
            <p className="exp-title">Ritira</p>
            <p className="exp-description">
              Organizzati con il venditore per ritirare i libri. Non ti
              preoccupare, il venditore sa che verrà pagato solo dopo averti
              consegnato i libri.
            </p>
          </div>
          <div className="explainer">
            <i className="fas fa-calendar-check exp-ico"></i>
            <p className="exp-title">Conferma</p>
            <p className="exp-description">
              Conferma di aver ritirato i libri, così il venditore sarà pagato.
            </p>
          </div>
        </div>
      </div>
    );

    const sellExplainer = (
      <div id="help-buy-explainer" className="help-explainer-container">
        {/* <p className="help-exp-header">VENDERE</p> */}
        <div className="exp-sub-container">
          <div className="explainer">
            <i className="fas fa-upload exp-ico"></i>
            <p className="exp-title">Inserisci</p>
            <p className="exp-description">
              Publica annunci dei tuoi libri sul sito.
            </p>
          </div>
          <div className="explainer">
            <i className="fas fa-shopping-cart exp-ico"></i>
            <p className="exp-title">Vendi</p>
            <p className="exp-description">
              Aspetta che un cliente compri i tuoi libri.
            </p>
          </div>
          <div className="explainer">
            <i className="fas fa-envelope-open-text exp-ico"></i>
            <p className="exp-title">Email</p>
            <p className="exp-description">
              Visualizza l'email che ti mandiamo, con tutte le informazioni per
              contattare il cliente.
            </p>
          </div>
          <div className="explainer">
            <i className="fas fa-handshake exp-ico"></i>
            <p className="exp-title">Consegna</p>
            <p className="exp-description">
              Consegna il libro al venditore, e spediscilo se lui lo ha
              selezionato <br />(<b>lui ha già pagato</b>).
            </p>
          </div>
          <div className="explainer">
            <i className="fas fa-bell exp-ico"></i>
            <p className="exp-title">Conferma</p>
            <p className="exp-description">
              Ricorda al cliente di confermare l'avvenuta consegna.
            </p>
          </div>
          <div className="explainer">
            <i className="fas fa-euro-sign exp-ico"></i>
            <p className="exp-title">Incassa</p>
            <p className="exp-description">
              Ricevi i soldi via email, con le informazioni per passarle sul tuo
              conto corrente.
            </p>
          </div>
        </div>
      </div>
    );

    const inviteExplainer = (
      <div id="help-buy-explainer" className="help-explainer-container">
        {/* <p className="help-exp-header help-smaller">
          GUADAGNARE INVITANDO AMICI
        </p> */}
        <div className="exp-sub-container">
          <div className="explainer">
            <i className="fas fa-copy exp-ico"></i>
            <p className="exp-title">Link</p>
            <p className="exp-description">
              Copia il link che trovi sulla pagina:
              <br />
              <a href="/invite">libridoo.it/invite</a>
            </p>
          </div>
          <div className="explainer">
            <i className="fas fa-users exp-ico"></i>
            <p className="exp-title">Condividilo</p>
            <p className="exp-description">Mandalo a più amici possibili.</p>
          </div>
          <div className="explainer">
            <i className="fas fa-user-plus exp-ico"></i>
            <p className="exp-title">Falli iscrivere</p>
            <p className="exp-description">
              Fai iscrivere ogni tuo amico attraverso il link.
            </p>
          </div>
          <div className="explainer">
            <i className="fas fa-coins exp-ico"></i>
            <p className="exp-title">Guadagna Punti</p>
            <p className="exp-description">
              Guadagna 5 punti per ogni utente iscritto con il tuo link.
            </p>
          </div>
          <div className="explainer">
            <i className="fas fa-hand-holding-usd exp-ico"></i>
            <p className="exp-title">Risparmia</p>
            <p className="exp-description">
              Usa quei punti per risparmiare sull'acquisto di libri.
            </p>
          </div>
        </div>
      </div>
    );

    let explainer = null;
    switch (this.state.nav) {
      case "buy":
        explainer = buyExplainer;
        break;
      case "sell":
        explainer = sellExplainer;
        break;
      case "invite":
        explainer = inviteExplainer;
        break;
      default:
        break;
    }
    return (
      <div id="help">
        <div id="help-image-container">
          {/* <p id="help-fake-header">AIUTO</p> */}
        </div>
        <div id="help-nav">
          <p id="help-header">Scopri come:</p>
          <div id="help-container">
            <div id="help-main-container">
              <p
                id="buy"
                className={`help-link ${
                  this.state.nav === "buy" ? "bold" : null
                }`}
                onClick={this.handleCick}
              >
                COMPRARE
              </p>
              <p
                id="sell"
                className={`help-link ${
                  this.state.nav === "sell" ? "bold" : null
                }`}
                onClick={this.handleCick}
              >
                VENDERE
              </p>
            </div>
            <p
              id="invite"
              className={`help-link ${
                this.state.nav === "invite" ? "bold" : null
              }`}
              onClick={this.handleCick}
            >
              GUADAGNARE INVITANDO AMICI
            </p>
          </div>
        </div>
        <div id="help-explainer-gContainer">{explainer}</div>
      </div>
    );
  }
}

export default Help;

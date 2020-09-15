import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import "./Footer.css";

class Footer extends Component {
  render() {
    return (
      <div id="footer-gContainer">
        <div id="footer-right" className="footer-container">
          <div id="asskeeper-container">
            <p id="copywright">© libridoo 2020</p>
            <p id="asskeeper">
              Le foto presenti su libridoo sono state in larga parte prese da
              Internet e quindi valutate di pubblico dominio. Se i soggetti o
              gli autori avessero qualcosa in contrario alla pubblicazione, non
              avranno che da segnalarlo alla redazione (complaints@libridoo.it),
              che provvederà alla rimozione delle immagini utilizzate. Libridoo
              non rappresenta una testata giornalistica, in quanto viene
              aggiornato senza alcuna periodicità regolare. Non può pertanto
              considerarsi un prodotto editoriale ai sensi della legge n. 62 del
              07 marzo 2001.
              <br />
              <br />
              {this.props.history.location.pathname === "/invite"
                ? "*offerta valida solo per i primi 1000 utenti"
                : null}
            </p>
          </div>
        </div>
        <div id="footer-container-links" className="footer-container">
          <div id="footer-container-contained">
            <div id="security" className="footer-div">
              <Link to="./privacy" className="footer-link">
                Privacy Policy
              </Link>
              <Link to="./termsAndConditions" className="footer-link">
                Termini e Condizioni
              </Link>
            </div>
            <div className="footer-div">
              <Link className="footer-link" to="./feedback">
                Dicci cosa ne pensi
              </Link>
              <Link className="footer-link" to="./help">
                Help
              </Link>
            </div>
            <div id="contacts" className="footer-div">
              <div id="phone-container" className="footer-div-container">
                <span id="phone" className="contacts-div">
                  +39 3206265132
                </span>
                <i
                  id="footer-mobile"
                  className="fas fa-mobile-alt footer-ico"
                ></i>
              </div>
              <div id="email-container" className="footer-div-container">
                <a id="footer-email" href="mailto: info@libridoo.it">
                  info@libridoo.it
                </a>
                <i className="far fa-envelope footer-ico"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Footer);

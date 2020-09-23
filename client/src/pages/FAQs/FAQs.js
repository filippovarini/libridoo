import React, { Component } from "react";
import HeaderPart from "../../components/headerPart";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import "./FAQs.css";

class FAQs extends Component {
  state = {
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false,
    "6": false,
    "7": false
  };

  toggleSlide = faq => {
    this.setState({
      [faq]: !this.state[faq]
    });
  };

  handleDelete = () => {
    if (this.props.user._id) {
      // eslint-disable-next-line no-restricted-globals
      if (confirm("Confermi di voler abbandonare la nave?")) {
        fetch("/api/user/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({ _id: this.props.user._id })
        })
          .then(res => res.json())
          // .then(jsonRes => console.log(jsonRes))
          .catch(error => console.log(error));
        // anyway, even if error, jsut logout account, to hide problem
        if (sessionStorage.getItem("JWT")) {
          sessionStorage.removeItem("JWT");
        } else if (localStorage.getItem("JWT")) {
          localStorage.removeItem("JWT");
        }
        this.props.dispatch({ type: "LOGOUT" });
        this.props.history.push("/");
      }
    } else {
      alert(
        "Devi essere loggato nell'account che vuoi eliminare per poterlo fare."
      );
    }
  };

  render() {
    return (
      <div id="faqs">
        <HeaderPart
          title={"FAQs & PROBs"}
          mainClass={"faqs"}
          imageId="libridoo-logo-image"
          headerClass=""
        />
        <p id="faqs-header">Domande e Problemi frequenti</p>
        <div id="faqs-container">
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("3");
            }}
          >
            <div className="faq">
              <p id="3" className="faq-header">
                Come vengo retribuito per i libri venduti?
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("3");
                }}
                className={`fa fa-${
                  this.state["3"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["3"] ? "" : "hidden"}`}>
              All'inserimento del primo annuncio, hai la possibilità di
              scegliere come ricevere il denaro. Puoi essere pagato con PayPal
              oppure attraverso bonifico. Anche se non possiedi un account
              PayPal, ti consigliamo di sceglierlo come opzione in quanto è più
              facile, veloce ed il setup è immediato, mentre per il bonifico
              spendi circa 25 secondi.
            </p>
          </div>
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("1");
            }}
          >
            <div className="faq">
              <p id="1" className="faq-header">
                Il venditore non mi ha consegnato l'ordine. Come posso essere
                rimborsato?
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("1");
                }}
                className={`fa fa-${
                  this.state["1"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["1"] ? "" : "hidden"}`}>
              Puoi essere rimborsato solo se non hai ancora confermato l'ordine.
              In tal caso puoi riavere i soldi se il venditore conferma di non
              aver consegnato i libri oppure se sono passati 90 giorni dalla
              data d'ordine ed ancora non lo hai confermato. Per essere
              rimborsato, scrivici una email a{" "}
              <a href="mailto:complaints@libridoo.it">complaints@libridoo.it</a>
              , fornendoci l'indirizzo email del venditore, quello associato al
              tuo account, e la lista dei libri comprati. Entrerai in contatto
              con il nostro team che provvederà a farti riavere l'importo intero
              dell'ordine meno una commissione di 2€.
            </p>
          </div>
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("2");
            }}
          >
            <div className="faq">
              <p id="2" className="faq-header">
                Il compratore ha confermato l'ordine ma non ho ricevuto i soldi.
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("2");
                }}
                className={`fa fa-${
                  this.state["2"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["2"] ? "" : "hidden"}`}>
              In caso di PayOut issues, puoi contattare il nostro team
              all'indirizzo{" "}
              <a href="mailto:complaints@libridoo.it">complaints@libridoo.it</a>
              , spiegando il problema e fornendo l'indirizzo email del
              compratore, quello associato al tuo account e il titolo dei libri
              venduti. Il nostro team ti aiuterà a ricevere il pagamento dovuto.
            </p>
          </div>
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("4");
            }}
          >
            <div className="faq">
              <p id="4" className="faq-header">
                Il libro che ho ricevuto è in condizioni peggiori di quanto
                descritto dal venditore.
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("4");
                }}
                className={`fa fa-${
                  this.state["4"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["4"] ? "" : "hidden"}`}>
              Purtroppo, Libridoo non è responsabile della qualità o qualsiasi
              altro dato immesso dal venditore al momento dell'inserimento
              dell'annuncio. Puoi però fare in modo che ciò non accada ai
              prossimi compratori, rilasciando un giudizio negativo al momento
              della conferma dell'ordine.
            </p>
          </div>
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("5");
            }}
          >
            <div className="faq">
              <p id="5" className="faq-header">
                Ho trovato annunci SPAM non pertinenti con il materiale
                pubblicato sulla piattaforma.
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("5");
                }}
                className={`fa fa-${
                  this.state["5"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["5"] ? "" : "hidden"}`}>
              Noi di Libridoo vogliamo una piattaforma pulita e priva di spam.
              Per questo ti chiediamo di segnalarci i contenuti che ritieni
              inadatti al nostro sito. Puoi farlo semplicemente cliccando sui
              tre punti "..." situati in alto a destra dell'annuncio e cliccando
              su "Segnala Spam"
            </p>
          </div>
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("6");
            }}
          >
            <div className="faq">
              <p id="6" className="faq-header">
                Non voglio più far parte di questo network universitario. Come
                elimino l'account?
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("6");
                }}
                className={`fa fa-${
                  this.state["6"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["6"] ? "" : "hidden"}`}>
              Se hai deciso di abbandonare la nave e non contribuire al
              cambiamento che vogliamo portare nel mondo dei libri usati, hai la
              possibilità di eliminare il tuo account. Per farlo, clicca{" "}
              <span id="faq-delete-account" onClick={this.handleDelete}>
                qui
              </span>
              .
            </p>
          </div>
          <div
            className="faq-container"
            onClick={() => {
              this.toggleSlide("7");
            }}
          >
            <div className="faq">
              <p id="7" className="faq-header">
                Ho un altro tipo di problema/domanda.
              </p>
              <i
                onClick={() => {
                  this.toggleSlide("7");
                }}
                className={`fa fa-${
                  this.state["7"] ? "minus" : "plus"
                } faq-ico`}
              ></i>
            </div>
            <p className={`faq-answer ${this.state["7"] ? "" : "hidden"}`}>
              Puoi contattarci all'indirizzo email{" "}
              <a href="mailto:complaints@libridoo.it">complaints@libridoo.it</a>
              . Saremo felici di rispondere alle tue domande o risolvere un tuo
              problema. Inoltre, se hai voglia, puoi esprimere il tuo giudizio
              sulla performance della piattaforma votandoci{" "}
              <Link to="/feedback">qui</Link>
            </p>
          </div>
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

export default connect(mapStateToProps)(FAQs);

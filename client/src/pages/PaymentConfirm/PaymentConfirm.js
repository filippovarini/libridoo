import React, { Component } from "react";
import { connect } from "react-redux";
import HeaderPart from "../../components/headerPart";
import "./PaymentConfirm.css";

import LoadingL from "../../components/Loading/loading_l";

class PaymentConfirm extends Component {
  state = {
    loading: false,
    dealId: null
  };

  componentDidMount = () => {
    const locationArr = window.location.pathname.split("/");
    if (locationArr[2]) {
      if (locationArr[2] === "cancel") {
        // paypal cancel
        fetch("/api/payment/failure", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ dealId: locationArr[3] })
        })
          .then(res => res.json())
          .then(jsonRes => {
            // error, not a big deal
            this.props.dispatch({
              type: "E-SET",
              error: {
                frontendPlace: "paymentConfirm/delete/catch",
                noSave: true,
                message:
                  "Qualcosa è andato storto nel setup del pagamento. Non ti preoccupare, non hai perso i soldi. La prossima volta evita di ricaricare la pagina o tornare indietro"
              }
            });
            this.props.history.push("/error");
          })
          .catch(error => {
            // couldn't delete cluster, not a big deal
            console.log(error);
            this.props.dispatch({
              type: "E-SET",
              error: {
                frontendPlace: "paymentConfirm/delete",
                noSave: true,
                message:
                  "Qualcosa è andato storto nel setup del pagamento. Non ti preoccupare, non hai perso i soldi. La prossima volta evita di ricaricare la pagina o tornare indietro"
              }
            });
            this.props.history.push("/error");
          });

        this.props.history.push("/error");
      } else {
        // success
        // delete books
        this.setState({ dealId: locationArr[2], loading: true });
        fetch("/api/payment/success", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ dealId: locationArr[2] })
        })
          .then(res => res.json())
          .then(jsonRes => {
            if (jsonRes.code === 0) {
              // success
              this.setState({ loading: false });
            } else {
              // faliure
              this.props.dispatch({
                type: "E-SET",
                error: {
                  frontendPlace: "paymentConfirm/delete",
                  jsonRes,
                  message: "Libri non eliminati dopo il pagamento"
                }
              });
            }
          })
          .catch(error => {
            this.props.dispatch({
              type: "E-SET",
              error: {
                frontendPlace: "paymentConfirm/delete",
                noSave: true,
                message:
                  "Qualcosa è andato storto nella conferma del pagametno. Prova a contattarci, risolveremo il tuo problema"
              }
            });
            this.props.history.push("/error");
          });
      }
    } else {
      this.props.history.push("/");
    }
  };

  render() {
    const loading = (
      <div id="paymentConfirm-loading">
        <LoadingL />
      </div>
    );
    const loaded = (
      <div id="paymentConfirm">
        <HeaderPart
          title={"ORDINATO"}
          mainClass={"paymentConfirm"}
          imageId="libridoo-logo-image"
          headerClass="checkout-"
        />
        <div id="body-container">
          <p id="body-header">ORDINE EFFETTUATO CON SUCCESSO</p>
          <div id="body">
            <p id="firstLine" className="body-text">
              Caro{" "}
              {this.props.user.name
                ? this.props.user.name.split(" ")[0]
                : "utente"}
              , il tuo ordine è stato effettuato con successo!
            </p>
            <p id="secondLine" className="body-text">
              Ti abbiamo appena inviato una <b>email</b> all'indirizzo:{" "}
              <span style={{ color: "black" }}>{this.props.user.email}</span>{" "}
              con tutte le informazioni per ricevere i libri e contattare i
              venditori per farteli consegnare. Non ti preoccupare, già sanno
              che non devono ricevere soldi.
            </p>
            <p id="thirdLine" className="body-text">
              Il codice del tuo ordine è: {"   "}
              <span style={{ color: "black" }}>{this.state.dealId}</span>
            </p>
          </div>
        </div>
        <a href="./" id="home-link">
          HOME
        </a>
      </div>
    );
    const bodyComponent = this.state.loading ? loading : loaded;
    return <div id="paymentConfirm-container">{bodyComponent}</div>;
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    selectedBooks: state.selectedBooks
  };
};

export default connect(mapStateToProps)(PaymentConfirm);

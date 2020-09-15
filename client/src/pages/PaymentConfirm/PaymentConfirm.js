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
    if (!sessionStorage.getItem("dealId")) {
      if (sessionStorage.getItem("searchParams")) {
        this.props.history.push("/checkout");
      } else {
        this.props.history.push("/search");
      }
    } else if (!sessionStorage.getItem("SBs")) {
      alert("Nessun libro selezionato");
      sessionStorage.removeItem("dealId");
      this.props.history.push("/results");
    } else {
      // just completed
      // see if there actually exists such a payment
      fetch(`/api/payment/check/${sessionStorage.getItem("dealId")}`)
        .then(res => res.json())
        .then(jsonRes => {
          if (jsonRes.code === 0) {
            // there exists a deal
            // post cluster books
            const user = Object.assign({}, this.props.user);
            delete user.DeliveryInfo;
            delete user.bonusPoints;
            delete user._id;
            delete user.passwordLength;
            delete user.registerDate;
            delete user.rating;
            delete user.__v;
            const body = {
              dealId: jsonRes.deal._id,
              buyerId: jsonRes.deal.buyerId,
              checkoutDate: jsonRes.deal.checkoutDate,
              _ids: JSON.parse(sessionStorage.getItem("SBs")),
              buyerInfo: user,
              soldBooksClusters: this.props.selectedBooks
            };
            console.log(body);
            fetch("/api/book/checkedOut", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
              },
              body: JSON.stringify(body)
            })
              .then(res => res.json())
              .then(jsonRes => {
                if (jsonRes.code === 1) {
                  //   error
                  console.log(jsonRes);
                  // store and redirect
                  this.props.dispatch({
                    type: "E-SET",
                    error: {
                      frontendPlace: "PaymentConfirm/componentDidMount2/code1"
                    }
                  });
                  this.props.history.push("/error");
                } else if (jsonRes.code === 1.5) {
                  //   posted successfully, but books not deleted successfuly
                  console.log(
                    "code 1.5 in PaymentConfirm/componentDidMount2",
                    jsonRes
                  );
                } else {
                  // successful
                  console.log("successful");
                  // remove every variable
                  sessionStorage.removeItem("searchParams");
                  sessionStorage.removeItem("SBs");
                  sessionStorage.removeItem("index");
                  sessionStorage.removeItem("__cds_Ids");
                  sessionStorage.removeItem("dealId");
                  this.props.dispatch({ type: "GENERAL-DELETE" });
                  this.setState({ loading: false, dealId: jsonRes.paymentId });
                }
              })
              .catch(error => {
                console.log("error");
                console.log(error);
                // store and redirect
                this.props.dispatch({
                  type: "E-SET",
                  error: {
                    frontendPlace: "PaymentConfirm/componentDidMount2/catch"
                  }
                });
                this.props.history.push("/error");
              });
          } else {
            //   wrong id
            sessionStorage.removeItem("dealId");
            alert("Nessun pagamento trovato");
            if (sessionStorage.getItem("searchParams")) {
              this.props.history.push("/checkout");
            } else {
              this.props.history.push("/search");
            }
          }
        })
        .catch(error => {
          console.log(error);
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "PaymentConfirm/componentDidMount/catch" }
          });
          this.props.history.push("/error");
        });
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
              <b>{this.props.user.email}</b> con tutte le informazioni per
              ricevere i libri e contattare i venditori per farteli consegnare.
            </p>
            <p id="thirdLine" className="body-text">
              Il codice del tuo ordine è: {"   "}
              <b>{this.state.dealId}</b>
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

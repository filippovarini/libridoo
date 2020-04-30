import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import "./PaymentConfirm.css";

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
        <div className="loadingio-spinner-fidget-spinner-udtray956qm">
          <div className="ldio-sqv79tocehf">
            <div>
              <div>
                <div
                  style={{ left: "87.435px", top: "14.354999999999999px" }}
                ></div>
                <div
                  style={{
                    left: "24.794999999999998px",
                    top: "122.66999999999999px"
                  }}
                ></div>
                <div
                  style={{ left: "150.075px", top: "122.66999999999999px" }}
                ></div>
              </div>
              <div>
                <div style={{ left: "113.535px", top: "40.455px" }}></div>
                <div
                  style={{
                    left: "50.894999999999996px",
                    top: "148.76999999999998px"
                  }}
                ></div>
                <div
                  style={{
                    left: "176.17499999999998px",
                    top: "148.76999999999998px"
                  }}
                ></div>
              </div>
              <div style={{ left: "87.435px", top: "87.435px" }}></div>
              <div>
                <div
                  style={{
                    left: "97.875px",
                    top: "78.3px",
                    transform: "rotate(-20deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "150.075px",
                    top: "78.3px",
                    transform: "rotate(20deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "75.69px",
                    top: "117.44999999999999px",
                    transform: "rotate(80deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "101.78999999999999px",
                    top: "160.515px",
                    transform: "rotate(40deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "172.26px",
                    top: "117.44999999999999px",
                    transform: "rotate(100deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "146.16px",
                    top: "160.515px",
                    transform: "rotate(140deg)"
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    const loaded = (
      <div id="paymentConfirm">
        <div id="image">
          <p id="image-header">ORDINE EFFETTUATO</p>
        </div>
        <div id="body-container">
          <p id="body-header">ORDINE EFFETTUATO CON SUCCESSO</p>
          <div id="body">
            <p className="body-text">
              Caro{" "}
              {this.props.user.name
                ? this.props.user.name.split(" ")[0]
                : "utente"}
              , il tuo ordine è stato effettuato con successo!
            </p>
            <p className="body-text">
              Ti abbiamo appena inviato una <b>email</b> all'indirizzo:{" "}
              <b>{this.props.user.email}</b> con tutte le informazioni per
              ricevere i libri e contattare i venditori per farteli consegnare.
            </p>
            <p className="body-text">
              Il codice del tuo ordine è: {"   "}
              <b>{this.state.dealId}</b>
            </p>
          </div>
        </div>
        <Link to="/" id="home-link">
          HOME
        </Link>
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

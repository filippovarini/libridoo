import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import LoadingM from "../../../components/Loading/loading_m";
import "./payOutInfo.css";

class PayOutInfo extends Component {
  state = {
    loading: false,
    stripeLoading: false,
    stripeError: "",
    payPalLoadig: false
  };

  componentDidMount = () => {
    const location = this.props.history.location.pathname;
    const locationArr = location.split("/");
    console.log(locationArr);
    if (locationArr[2] === "refreshed") {
      console.log("referesi");
      // refreshed
      this.setState({
        stripeError:
          "Setup fallito. Non ricaricare la pagina o tornare indietro mentre carichi le informazioni su stripe."
      });
      setTimeout(() => this.setState({ stripeError: "" }), 6000);
    } else if (locationArr[2] === "confirmed" && locationArr[3]) {
      console.log("success");
      // success
      // userUpdate
      this.setState({ loading: true });
      const body = {
        JWT: sessionStorage.getItem("JWT") || localStorage.getItem("JWT"),
        payOut: { type: "stripe", accountId: locationArr[3] }
      };
      fetch("/api/user/connectedAccount", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(body)
      })
        .then(res => res.json())

        .then(jsonRes => {
          console.log(jsonRes);
          if (jsonRes.code === 0) {
            // success
            this.props.dispatch({ type: "SET-USER", user: jsonRes.activeUser });
            if (sessionStorage.getItem("JWT")) {
              // not rememberME
              sessionStorage.setItem("JWT", jsonRes.JWT);
            } else {
              // rememberMe, localStorage
              localStorage.setItem("JWT", jsonRes.JWT);
            }
            if (locationArr[1] === "account") window.location = "/account";
          } else {
            this.setState({
              stripeError: "Setup fallito. Ricarica la pagina e riprova."
            });
            setTimeout(() => this.setState({ stripeError: "" }), 6000);
            this.props.dispatch({
              type: "E-SET",
              error: {
                frontendPlace: "payOutInfo/componentDidMount/code1/60",
                jsonRes
              }
            });
          }
          this.setState({ loading: false });
        })
        .catch(error => {
          console.log(error);
          this.props.dispatch({
            type: "E-SET",
            error: {
              frontendPlace: "payOutInfo/componentDidMount/catch/68",
              error
            }
          });
          this.props.history.push("/error");
        });
    }
  };

  stripeSetup = () => {
    if (!this.state.payPalLoadig) {
      this.setState({ stripeLoading: true });
      fetch("/api/payment/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          pathname: this.props.history.location.pathname.split("/")[1]
        })
      })
        .then(res => res.json())
        .then(jsonRes => {
          if (jsonRes.code === 0) {
            // success
            window.location = jsonRes.url;
          } else {
            // faliure
            this.setState({
              stripeError:
                "Errore! Controlla di avere una connessione stabile, ricarica la pagina e riprova.",
              stripeLoading: false
            });
            setTimeout(() => this.setState({ stripeError: "" }), 6000);
          }
        })
        .catch(error => console.log(error));
    }
  };

  render() {
    const editing = (
      <div>
        <i id="po-header-ico" className="fas fa-coins"></i>
        <div id="po-headers">
          <p id="po-header">Come vuoi essere pagato?</p>
          <p id="po-suggestion">
            Anche se non hai un'account, ti consigliamo di usare PayPal, perchè
            il bonifico ti costa 2€ al mese, se in quel mese vendi.
          </p>
        </div>
        <div id="po-choices">
          <div id="po-paypal" className="po-choice">
            <i id="po-pp-ico" className="fab fa-paypal po-ico"></i>
            <p id="po-paypal-header" className="po-choice-header">
              <span id="po-pp-1">Pay</span>
              <span id="po-pp-2">Pal</span>
            </p>
          </div>
          <div id="po-stripe-container">
            {this.state.stripeLoading ? (
              <div id="po-stripe" className="po-choice">
                <p id="po-stripe-header-word" className="po-choice-header">
                  loading...
                </p>
              </div>
            ) : (
              <div
                id="po-stripe"
                className="po-choice"
                onClick={this.stripeSetup}
              >
                <i className="far fa-credit-card"></i>
                <p id="po-stripe-header-word" className="po-choice-header">
                  BONIFICO
                </p>
              </div>
            )}
            <div id="po-stripe-secure">
              <i id="po-lock" className="fas fa-lock"></i>
              <span>bonifici sicuri con</span>
              <i id="po-ico-stripe" className="fab fa-stripe po-ico"></i>
            </div>
          </div>
          <p
            id="po-stripe-error"
            className={this.state.stripeError ? null : "hidden"}
          >
            {this.state.stripeError}
          </p>
        </div>
      </div>
    );

    const stripeBody = (
      <div>
        {/* should I inform user of 2€ each:? already done! */}
        <i id="po-header-ico" className="fas fa-coins"></i>
        <p id="po-header">Hai scelto di essere pagato previo:</p>
        <div id="po-choices" className="selected">
          <div id="po-stripe" className="po-choice selected">
            <i className="far fa-credit-card"></i>
            <p id="po-stripe-header-word" className="po-choice-header">
              BONIFICO
            </p>
          </div>

          <div id="po-stripe-secure">
            <i id="po-lock" className="fas fa-lock"></i>
            <span>bonifici sicuri con</span>
            <i id="po-ico-stripe" className="fab fa-stripe po-ico"></i>
          </div>
        </div>
        <p
          id="po-stripe-error"
          className={this.state.stripeError ? null : "hidden"}
        >
          {this.state.stripeError}
        </p>
      </div>
    );

    const loading = (
      <div id="po-loading">
        <i id="po-header-ico" className="fas fa-coins"></i>
        <LoadingM />
      </div>
    );

    console.log(this.props.user);

    // add for paypal
    const loaded = this.props.user.payOut
      ? this.props.user.payOut.type
        ? stripeBody
        : editing
      : editing;

    let body = this.state.loading ? loading : loaded;

    if (!this.props.user._id) body = loading;

    return <div id="po-info">{body}</div>;
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps)(withRouter(PayOutInfo));

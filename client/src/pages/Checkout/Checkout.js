import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./Checkout.css";

// components
import ClusterBooks from "../../components/clusterBooks/clusterBooks";
import PlaceInfo from "../../components/Infos/placeInfo/placeInfo";
import BodyInfo from "../../components/Infos/bodyInfo/bodyInfo";
import HeaderPart from "../../components/headerPart";
import CheckoutForm from "../../components/CheckoutForm/CheckoutForm";
import LoadingL from "../../components/Loading/loading_l";
import LoadingS from "../../components/Loading/loading_s";

class Checkout extends Component {
  state = {
    loading: false,
    explainerHidden: true,
    couponSet: false,
    paying: false,
    selected: null,
    preliminaryErrorSet: false,
    stripeLoading: false
  };

  componentDidMount = () => {
    if (!sessionStorage.getItem("searchParams")) {
      this.props.history.push("/search");
    } else {
      // something searched
      if (!sessionStorage.getItem("SBs")) {
        // nothing selected
        this.props.history.push("/results");
      } else {
        // both searched and book selected
        if (!sessionStorage.getItem("JWT") && !localStorage.getItem("JWT")) {
          // not logged
          // login and then go back
          this.props.history.push("/login/buying");
        } else {
          if (!this.state.couponSet && sessionStorage.getItem("coupon")) {
            fetch(`/api/coupon/code/${sessionStorage.getItem("coupon")}`)
              .then(res => res.json())
              .then(jsonRes => {
                if (jsonRes.code === 0) {
                  // correct
                  this.setState({
                    couponSet: true
                  });
                }
              })
              .catch(error => {
                console.log(error);
              });
          }
        }
      }
    }
  };
  /* 
  DON'T NEED TO RETRIEVE ANYTHING BECAUSE: 
  1. SBs retreived in header
  2. BooksResults not retireived in checkout, but as soon as I go to Results, retreived
        JUST USER
 */

  toggleDisplay = () => {
    this.setState({
      explainerHidden: !this.state.explainerHidden
    });
  };

  show = () => {
    this.setState({
      explainerHidden: false
    });
  };

  hide = () => {
    this.setState({
      explainerHidden: true
    });
  };

  showOptions = () => {
    this.setState({ paying: !this.state.paying });
  };

  purchaseStripe = total => {
    console.log(total);
    const { dispatch } = this.props;
    this.setState({ stripeLoading: true });
    // fetch create paymentIntent
    fetch("api/payment/paymentIntent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ total })
    })
      .then(res => res.json())
      .then(jsonRes => {
        console.log(jsonRes);
        if (jsonRes.code === 0) {
          // success
          console.log("success");
          this.setState({
            selected: "stripe"
          });
          sessionStorage.setItem("client_secret", jsonRes.client_secret);
          sessionStorage.setItem("transfer_group", jsonRes.transfer_group);
        } else {
          // faliure
          this.setState({ preliminaryErrorSet: true });
          setTimeout(() => this.setState({ preliminaryErrorSet: false }), 6000);
        }
        this.setState({ stripeLoading: false });
      })
      .catch(error => {
        console.log(error);
        dispatch({
          type: "E-SET",
          error: { frontendPlace: "Checkout/purchaseStripe/catch:113" }
        });
        this.props.history.push("/error");
      });
  };

  purchasePaypal = () => {
    this.setState({ selected: "paypal" });
  };

  savePurchase = (books, delivery, discount, total) => {
    // props
    const { history, dispatch, selectedBooks } = this.props;
    // this.setState({ loading: true }); UNNECESSARY, ALREADY IN CHECKOUTFORM
    const sellerIds = [];
    selectedBooks.forEach(cluster => sellerIds.push(cluster.sellerId));
    const buyerId = this.props.user._id;
    const commission = sessionStorage.getItem("coupon")
      ? 0
      : ((Number(books) + Number(delivery)) / 100) * 3;

    // bill and body
    const bill = {
      books: Number(books),
      delivery: Number(delivery),
      discount,
      total,
      commission
    };
    const body = {
      buyerId,
      sellerIds,
      bill
    };
    fetch("/api/payment/buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(jsonRes => {
        console.log(jsonRes);
        let sucessfulOrder = false;
        if (jsonRes.code === 0) {
          // payment successful
          sessionStorage.setItem("dealId", jsonRes.deal._id);
          sucessfulOrder = true;
        } else {
          // faliure
          this.setState({ preliminaryErrorSet: true });
          setTimeout(() => this.setState({ preliminaryErrorSet: false }), 3000);
        }
        //Changed this function calling state and on completion moving to next page
        // this.setState({ loading: false }, () => {
        if (sucessfulOrder) {
          history.push("/paymentConfirm");
        }
        // });
      })
      .catch(error => {
        console.log(error);
        dispatch({
          type: "E-SET",
          error: { frontendPlace: "Checkout/savePurchase/catch/185" }
        });
        history.push("/error");
      });
  };

  // purchase = (books, delivery, discount, total) => {
  //   console.log("purchase");

  //   //destructuring books
  //   const { history, dispatch, selectedBooks } = this.props;
  //   this.setState({ loading: true });
  //   const sellerIds = [];
  //   selectedBooks.forEach(cluster => sellerIds.push(cluster.sellerId));
  //   const buyerId = this.props.user._id;
  //   const commission = this.state.couponSet
  //     ? 0
  //     : ((Number(books) + Number(delivery)) / 100) * 3;

  //   // bill and body
  //   const bill = {
  //     books: Number(books),
  //     delivery: Number(delivery),
  //     discount,
  //     total,
  //     commission
  //   };
  //   const body = {
  //     buyerId,
  //     sellerIds,
  //     bill
  //   };

  //   // fetch create paymentIntent
  //   fetch("api/payment/paymentIntent", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json"
  //     },
  //     body: JSON.stringify(body)
  //   })
  //     .then(res => res.json())
  //     .then(jsonRes => {
  //       console.log(jsonRes);
  //       this.setState({ loading: false });
  //     })
  //     .catch(error => console.log(error));
  //   fetch("/api/payment/buy", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json"
  //     },
  //     body: JSON.stringify(body)
  //   })
  //     .then(res => res.json())
  //     .then(jsonRes => {
  //       console.log(jsonRes);
  //       let sucessfulOrder = false;
  //       if (jsonRes.code === 0) {
  //         // payment successful
  //         sessionStorage.setItem("dealId", jsonRes.deal._id);
  //         sucessfulOrder = true;
  //       } else {
  //         // this.props.dispatch({
  //         //   type: "E-SET",
  //         //   error: { frontendPlace: "Checkout/purchase/code1", jsonRes }
  //         // });
  //         // this.props.history.push("/error");
  //       }
  //       //Changed this function calling state and on completion moving to next page
  //       this.setState({ loading: false }, () => {
  //         if (sucessfulOrder) {
  //           history.push("/paymentConfirm");
  //         }
  //       });
  //     })
  //     .catch(error => {
  //       console.log(error);
  //       dispatch({
  //         type: "E-SET",
  //         error: { frontendPlace: "Checkout/purchase/catch" }
  //       });
  //       this.props.history.push("/error");
  //     });
  // };

  render() {
    let totalBookPrice = 0;
    let totalDeliveryPrice = 0;
    this.props.selectedBooks.forEach(cluster => {
      if (cluster.delivery.choosen)
        totalDeliveryPrice =
          (cluster.delivery.cost * 100 + totalDeliveryPrice * 100) / 100;
      cluster.Books.forEach(book => {
        totalBookPrice = (totalBookPrice * 100 + book.price * 100) / 100;
      });
    });
    let totalPrice = (totalBookPrice * 100 + totalDeliveryPrice * 100) / 100;
    if (!this.state.couponSet) {
      totalPrice =
        Math.round((totalPrice + 0.35 + (totalPrice / 100) * 3.4) * 100) / 100;
    }
    let discountAvailable = this.props.user.bonusPoints
      ? Math.floor(this.props.user.bonusPoints / 10) * 10
      : null;
    if (discountAvailable > totalPrice) {
      discountAvailable = Math.floor(totalPrice / 10) * 10;
    }
    if (discountAvailable) totalPrice -= discountAvailable;

    // .00 at the end of totalprice
    if (String(totalPrice).indexOf(".") === -1) {
      // whole price
      totalPrice = `${totalPrice}.00`;
    } else {
      // decimal
      if (String(totalPrice).split(".")[1].length === 1)
        totalPrice = `${totalPrice}0`;
    }
    if (String(totalBookPrice).indexOf(".") === -1) {
      // whole price
      totalBookPrice = `${totalBookPrice}.00`;
    } else {
      // decimal
      if (String(totalBookPrice).split(".")[1].length === 1)
        totalBookPrice = `${totalBookPrice}0`;
    }
    if (String(totalDeliveryPrice).indexOf(".") === -1) {
      // whole price
      totalDeliveryPrice = `${totalDeliveryPrice}.00`;
    } else {
      // decimal
      if (String(totalDeliveryPrice).split(".")[1].length === 1)
        totalDeliveryPrice = `${totalDeliveryPrice}0`;
    }

    const checkoutComponent = (
      <div id="checkout">
        <HeaderPart
          title="CHECKOUT"
          mainClass={"checkout"}
          imageId="libridoo-logo-image"
          headerClass="checkout-"
        />
        <div id="selectedBooks-container">
          {this.props.selectedBooks.length !== 0
            ? this.props.selectedBooks.map(cluster => {
                return (
                  <ClusterBooks
                    books={cluster.Books}
                    index={this.props.selectedBooks.indexOf(cluster)}
                    deliveryInfo={cluster.delivery}
                    place={cluster.sellerInfo.place}
                    school={cluster.sellerInfo.school}
                    page="checkout"
                    key={cluster.sellerId}
                    userInfoId={cluster.sellerId}
                    userInfo={cluster.sellerInfo}
                  />
                );
              })
            : null}
        </div>
        <div id="info-review">
          {(this.props.user.place && !this.props.user.place.city) ||
          !this.props.user.phone ||
          !this.props.user.email ? (
            <div id="infoReview-header-container">
              <p id="infoReview-header">
                Inserisci le tue informazioni personali
              </p>
            </div>
          ) : null}
          {this.props.user.place ? (
            this.props.user.place.city ? null : (
              <PlaceInfo />
            )
          ) : null}
          {this.props.user.phone && this.props.user.email ? null : <BodyInfo />}
        </div>
        <div id="review-cart">
          <p id="rc-header">TOTALE</p>
          <div className="rc-cart-div">
            <p className="rc-cart-header">Libri</p>
            <p className="rc-cart-price">{totalBookPrice} €</p>
          </div>
          <div className="rc-cart-div">
            <p className="rc-cart-header">Spedizione</p>
            <p id="ck-delivery" className="rc-cart-price">
              {totalDeliveryPrice} €
            </p>
          </div>
          <div id="rc-commission" className="rc-cart-div">
            <p className="rc-cart-header">
              Commissioni PayPal/Carta di credito
              <i
                onClick={this.toggleDisplay}
                onMouseOver={this.show}
                onMouseLeave={this.hide}
                id="rc-info-ico"
                className="fas fa-info-circle"
              ></i>
            </p>
            <p
              id="rc-commission-explainer"
              className={this.state.explainerHidden ? "hidden" : null}
            >
              Noi di Libridoo non guadagamo sui nostri compratori! Questa
              commissione copre solo le commissioni imposte da PayPal o carte di
              credito.
            </p>
            <p
              className={
                this.state.couponSet
                  ? "noCommission rc-cart-price"
                  : "rc-cart-price"
              }
            >
              {this.state.couponSet ? "0%" : "3.40% + 0.35 €"}
            </p>
          </div>
          {discountAvailable ? (
            <div className="rc-cart-div">
              <p className="rc-cart-header">Sconto bonus:</p>
              <p id="checkout-discount" className="rc-cart-price">
                -{discountAvailable}.00 €
              </p>
            </div>
          ) : null}
          <div id="rc-subtotal" className="rc-cart-div">
            <p className="rc-cart-header">TOTALE</p>
            <p className="rc-cart-price">{totalPrice} €</p>
          </div>
          {(this.props.user.place && !this.props.user.place.city) ||
          !this.props.user.phone ||
          !this.props.user.email ? (
            <div id="rc-link-container" className="rc-cart-div unactive">
              <p id="rc-link" className="unactive">
                COMPLETA LE INFORMAZIONI PERSONALI
              </p>
            </div>
          ) : !this.state.paying ? (
            <div id="rc-link-gContainer">
              <div
                id="rc-link-container"
                onClick={this.showOptions}
                className="rc-cart-div"
              >
                <p id="rc-link">
                  PAGA
                  {/* carta di credito / paypal */}
                </p>
              </div>
            </div>
          ) : (
            <div id="ck-choices-container">
              <p id="ck-choices-header">Paga con:</p>
              <div
                id="ck-choices"
                className={this.state.paying ? null : "hidden"}
              >
                {this.state.stripeLoading ? (
                  <p
                    id="stripe-choice-loading"
                    className={`ck-choice ${
                      this.state.selected === "stripe" ? "ck-choosen" : null
                    }`}
                  >
                    <LoadingS />
                  </p>
                ) : (
                  <div
                    id="stripe-choice"
                    className={`ck-choice ${
                      this.state.selected === "stripe" ? "ck-choosen" : null
                    }`}
                    onClick={() => this.purchaseStripe(totalPrice)}
                  >
                    <div id="align-choice">
                      <i className="far fa-credit-card"></i>
                      <p id="stripe-choice-heaeder">CARTA</p>
                    </div>
                    <div
                      id="stripe-secure"
                      className={
                        this.state.preliminaryErrorSet ? "hidden" : null
                      }
                    >
                      <i id="stripe-lock" className="fas fa-lock"></i>
                      {"  "}
                      paga sicuro con
                      <i id="stripe-logo" className="fab fa-stripe"></i>
                    </div>
                  </div>
                )}

                <p
                  id="paypal-choice"
                  className={`ck-choice ${
                    this.state.selected === "paypal" ? "ck-choosen" : null
                  }`}
                  onClick={this.purchasePaypal}
                >
                  <i id="pp-ico" className="fab fa-paypal po-ico"></i>
                  PayPal
                </p>
              </div>
              <p
                id="preliminary-error"
                className={this.state.preliminaryErrorSet ? null : "hidden"}
              >
                Qualcosa è andato storto nel setup del pagamento. Non ti
                preoccupare, non hai perso soldi. Ricarica la pagina e prova di
                nuovo. Se il problema persiste, non esitare a contattarci.
              </p>
              <div
                id="ck-form-gContainer"
                className={this.state.selected ? null : "hidden"}
              >
                <div
                  id="stripe-form-container"
                  className={`ck-form-container ${
                    this.state.selected === "stripe" ? null : "hidden"
                  }`}
                >
                  <CheckoutForm
                    savePurchase={this.savePurchase}
                    totalBookPrice={totalBookPrice}
                    totalDeliveryPrice={totalBookPrice}
                    discountAvailable={discountAvailable}
                    totalPrice={totalPrice}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    const loading = (
      <div id="checkout-loading">
        <LoadingL />
      </div>
    );

    let bodyComponent =
      this.props.selectedBooks.length === 0 ? loading : checkoutComponent;

    if (this.state.loading) bodyComponent = loading;

    return bodyComponent;
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    selectedBooks: state.selectedBooks,
    booksResult: state.booksResult
  };
};

export default connect(mapStateToProps)(withRouter(Checkout));

import React, { Component } from "react";
import { connect } from "react-redux";
import "./Checkout.css";

// components
import ClusterBooks from "../../components/clusterBooks/clusterBooks";
import PlaceInfo from "../../components/Infos/placeInfo/placeInfo";
import BodyInfo from "../../components/Infos/bodyInfo/bodyInfo";

class Checkout extends Component {
  state = {
    loading: false
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

  purchase = (books, delivery, count) => {
    // this.setState({ loading: true });
    const sellerIds = [];
    this.props.selectedBooks.forEach(cluster =>
      sellerIds.push(cluster.sellerId)
    );
    const buyerId = this.props.user._id;
    const bill = {
      books,
      delivery,
      count
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
        if (jsonRes.code === 0) {
          // payment successful
          sessionStorage.setItem("dealId", jsonRes.deal._id);
          this.props.history.push("/paymentConfirm");
        }
      })
      .catch(error => {
        console.log(error);
        this.props.dispatch({
          type: "E-SET",
          error: { frontendPlace: "Checkout/purchase/catch" }
        });
        this.props.history.push("/error");
      });
  };

  render() {
    let totalBookPrice = 0;
    let totalDeliveryPrice = 0;
    let totalBooksNumber = 0;
    this.props.selectedBooks.forEach(cluster => {
      if (cluster.delivery.choosen) totalDeliveryPrice += cluster.delivery.cost;
      cluster.Books.forEach(book => {
        totalBookPrice += book.price;
        totalBooksNumber += 1;
      });
    });
    const checkoutComponent = (
      <div id="checkout">
        <div id="checkout-header-container">
          <p id="checkout-header">REVISIONE ORDINE</p>
        </div>
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
        <div id="bill-gContainer">
          <p id="bill-header">Listino</p>
          <div id="bill-container">
            <div className="bill-info-container">
              <p className="bill-info bill-left">Libri:</p>
              <p className="bill-info bill-right">{totalBookPrice}</p>
            </div>
            <div className="bill-info-container">
              <p className="bill-info bill-left">Spedizioni:</p>
              <p className="bill-info bill-right">{totalDeliveryPrice}</p>
            </div>
            <div className="bill-info-container">
              <p className="bill-info bill-left">Commissioni:</p>
              <p className="bill-info bill-right">1.5/cad</p>
            </div>
            <div id="bill-total" className="bill-info-container">
              <p className="bill-info bill-left">Totale:</p>
              <p className="bill-info bill-right">
                € {totalDeliveryPrice + totalBookPrice + 1.5 * totalBooksNumber}
              </p>
            </div>
          </div>
        </div>
        <div
          id="checkout-confirm"
          className={
            (this.props.user.place && !this.props.user.place.city) ||
            !this.props.user.phone ||
            !this.props.user.email
              ? "hidden"
              : null
          }
        >
          <div id="submit-container">
            <p
              id="submit"
              onClick={() => {
                this.purchase(
                  totalBookPrice,
                  totalDeliveryPrice,
                  totalBooksNumber
                );
              }}
            >
              COMPLETA L'ACQUISTO
            </p>
          </div>
        </div>
      </div>
    );

    const loading = <h1>loading...</h1>;

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

export default connect(mapStateToProps)(Checkout);

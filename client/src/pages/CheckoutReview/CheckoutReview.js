import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import "./CheckoutReview.css";

import HeaderPart from "../../components/headerPart";
import ReviewBook from "../../components/reviewBook/reviewBook";
import ReviewBookShort from "../../components/reviewBook/reviewBookShort";
import PlaceInfo from "../../components/Infos/placeInfo/placeInfo";
import BodyInfo from "../../components/Infos/bodyInfo/bodyInfo";

class CheckoutReview extends Component {
  state = {
    uniCode: "",
    explainerHidden: true,
    erorrHidden: true,
    couponSet: false,
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
          // login and then go back actually do it here
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

  // componentDidMount = () => {
  //   if (!sessionStorage.getItem("searchParams")) {
  //     this.props.history.push("/search");
  //   } else {
  //     // something searched
  //     if (!sessionStorage.getItem("SBs")) {
  //       // nothing selected
  //       this.props.history.push("/results");
  //     } else {
  //       if (!this.state.couponSet && sessionStorage.getItem("coupon")) {
  //         fetch(`/api/coupon/code/${sessionStorage.getItem("coupon")}`)
  //           .then(res => res.json())
  //           .then(jsonRes => {
  //             if (jsonRes.code === 0) {
  //               // correct
  //               this.setState({
  //                 couponSet: true
  //               });
  //             }
  //           })
  //           .catch(error => {
  //             console.log(error);
  //           });
  //       }
  //     }
  //   }
  // };

  handleChange = e => {
    this.setState({
      uniCode: e.target.value
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    if (this.state.uniCode) {
      this.setState({ loading: true });
      let total = 0;
      if (this.props.selectedBooks) {
        this.props.selectedBooks.forEach(cluster => {
          cluster.Books.forEach(book => {
            total += book.price;
          });
        });
      }
      const body = {
        code: this.state.uniCode,
        total,
        userId: this.props.user._id
      };
      fetch("/api/coupon/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/josn"
        },
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then(jsonRes => {
          console.log(jsonRes);
          this.setState({ loading: false });
          if (jsonRes.code === 0) {
            // correct
            this.setState({
              couponSet: true
            });
            sessionStorage.setItem("coupon", jsonRes.coupon.code);
          } else {
            // incorrect

            this.setState({ erorrHidden: false });
            setTimeout(() => {
              this.setState({ erorrHidden: true });
            }, 2000);
          }
        })
        .catch(error => {
          console.log(error);
          this.setState({ loading: false });

          this.setState({ erorrHidden: false });
          setTimeout(() => {
            this.setState({ erorrHidden: true });
          }, 2000);
        });
    }
  };

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

  render() {
    let totalPrice = 0;
    const bookList = [];
    if (this.props.selectedBooks) {
      this.props.selectedBooks.forEach(cluster => {
        const books = [];
        cluster.Books.forEach(book => {
          totalPrice += book.price;
          books.push({
            imageURL: book.imageURL,
            title: book.title,
            quality: book.quality,
            place: cluster.sellerInfo.place.city,
            uni: cluster.sellerInfo.school,
            id: book._id,
            price: book.price
          });
        });
        books.forEach(book => bookList.push(book));
      });
    }

    const wideScreen = (
      <div id="widescreen" className="checkout-review-container">
        <div id="cr-header">
          <p id="cr-image" className="cr-titles"></p>
          <p id="cr-title" className="cr-titles">
            TITOLO
          </p>
          <p id="cr-place" className="cr-titles">
            LUOGO
          </p>
          <p id="cr-quality" className="cr-titles">
            QUALITÀ
          </p>
          <p id="cr-subtotal" className="cr-titles">
            PREZZO
          </p>
        </div>
        {bookList.map(book => (
          <ReviewBook book={book} key={book.id} />
        ))}
      </div>
    );

    const strictScreen = (
      <div id="widescreen" className="checkout-review-container">
        <div id="cr-header">
          <p id="cr-image" className="cr-titles"></p>
          <p id="cr-title" className="cr-titles">
            ITEM
          </p>
          <p id="cr-subtotal" className="cr-titles">
            PREZZO
          </p>
        </div>
        {bookList.map(book => (
          <ReviewBookShort book={book} key={book.id} />
        ))}
      </div>
    );

    const body = window.screen.width < 600 ? strictScreen : wideScreen;

    return (
      <div id="checkoutReview">
        <HeaderPart
          title="REVISIONE"
          mainClass={"checkout"}
          imageId="libridoo-logo-image"
          headerClass="checkout-"
        />
        {body}
        <div id="uniCode">
          <p id="uniCode-header">
            {this.state.couponSet
              ? "Commissioni azzerate"
              : "Vuoi azzerare le commissioni?"}
          </p>
          <i
            id="rc-coupon-ico"
            className={`fas fa-check ${this.state.couponSet ? null : "hidden"}`}
          ></i>
          <form
            id="rc-coupon-form"
            onSubmit={this.handleSubmit}
            className={this.state.couponSet ? "hidden" : null}
          >
            <input
              type="text"
              id="uniCode-input"
              placeholder="inserisci un coupon"
              onChange={this.handleChange}
              value={this.state.loading ? "loading..." : this.state.uniCode}
            />
            <label
              htmlFor="uniCode-input"
              id="rc-error"
              className={this.state.erorrHidden ? "hidden" : null}
            >
              codice errato, scaduto o già utilizzato
            </label>
            <input className="hidden" type="submit" />
          </form>
          <p
            id="uniCode-submit"
            className={this.state.couponSet ? "hidden" : null}
            onClick={this.handleSubmit}
          >
            SALVA
          </p>
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
          <p id="rc-header">SUBTOTALE</p>
          <div className="rc-cart-div">
            <p className="rc-cart-header">Libri</p>
            <p className="rc-cart-price">
              {totalPrice ? `${totalPrice} €` : "loading..."}
            </p>
          </div>
          <div className="rc-cart-div">
            <p className="rc-cart-header">Spedizione</p>
            <p id="rc-delivery" className="rc-cart-price">
              Slezionala nella prossima pagina!
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
          <div id="rc-subtotal" className="rc-cart-div">
            <p className="rc-cart-header">SUBTOTALE</p>
            <p className="rc-cart-price">
              {totalPrice
                ? this.state.couponSet
                  ? `${totalPrice} €`
                  : `${Math.round(
                      (totalPrice + 0.35 + (totalPrice * 3.4) / 100) * 100
                    ) / 100} €`
                : "loading..."}
            </p>
          </div>
          {(this.props.user.place && !this.props.user.place.city) ||
          !this.props.user.phone ||
          !this.props.user.email ? (
            <div id="rc-link-container" className="rc-cart-div infoNeeded">
              <p id="rc-link" className="infoNeeded">
                COMPLETA LE INFORMAZIONI E SALVA PRIMA
              </p>
            </div>
          ) : (
            <div
              id="rc-link-container"
              onClick={() => this.props.history.push("/checkout")}
              className="rc-cart-div"
            >
              <Link id="rc-link" to="/checkout">
                PROCEDI
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    selectedBooks: state.selectedBooks,
    booksResult: state.booksResult
  };
};

export default connect(mapStateToProps)(CheckoutReview);

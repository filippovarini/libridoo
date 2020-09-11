import React, { Component } from "react";
import { connect } from "react-redux";
import "./Deals.css";

// components
import Book from "../../components/book/book";
import ClusterBooks from "../../components/clusterBooks/clusterBooks";
import BookInfo from "../../components/BookInfo/BookInfo";
import HeaderPart from "../../components/headerPart";
import LoadingL from "../../components/Loading/loading_l";

class Deals extends Component {
  state = {
    navigator: "selling",
    sellingBooks: [],
    soldBooksClusters: [],
    ready: false,
    updated: false,
    loading: true,
    noBooksSelling: false,
    noBooksSold: false,
    bookInfoHidden: true,
    bookInfoBookEditing: false,
    BookInfoId: null
  };

  //   !!! UPDATES AUTOMATICALLY ?!?!?! WHY
  componentDidMount = () => {
    if (!sessionStorage.getItem("JWT") && !localStorage.getItem("JWT")) {
      this.props.history.push("/login");
    } else {
      this.setState({ ready: false });
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      this.state.ready &&
      (!this.state.updated || prevState.navigator !== this.state.navigator)
    ) {
      // can send request because either just rendered, or updated nav
      if (this.state.navigator === "selling") {
        if (!this.state.loading) this.setState({ loading: true });
        fetch(`/api/book/fetch/selling/${this.props.user._id}`)
          .then(res => res.json())
          .then(jsonRes => {
            if (jsonRes.code === 2) {
              this.setState({
                noBooksSelling: true,
                loading: false,
                updated: true
              });
            } else if (jsonRes.code === 0) {
              // success
              this.setState({
                sellingBooks: jsonRes.books.reverse(),
                updated: true,
                loading: false,
                noBooksSelling: false
              });
            } else {
              // error
              this.props.dispatch({
                type: "E-SET",
                error: {
                  frontendPlace: "Deals/componentDidUpdate/code1",
                  jsonRes
                }
              });
              this.props.history.push("/error");
            }
          })
          .catch(error => {
            console.log(error);
            this.props.dispatch({
              type: "E-SET",
              error: { frontendPlace: "Deals/componentDidUpdate/catch" }
            });
            this.props.history.push("/error");
          });
      } else if (this.state.navigator === "sold") {
        if (!this.state.loading) this.setState({ loading: true });
        fetch(`/api/book/fetch/sold/${this.props.user._id}`)
          .then(res => res.json())
          .then(jsonRes => {
            if (jsonRes.code === 2) {
              this.setState({
                loading: false,
                updated: true,
                noBooksSold: true
              });
            } else if (jsonRes.code === 0) {
              //   success
              this.setState({
                loading: false,
                updated: true,
                soldBooksClusters: jsonRes.clusters.reverse(),
                noBooksSold: false
              });
            } else {
              //   error
              this.props.dispatch({
                type: "E-SET",
                error: {
                  frontendPlace: "Deals/componentDidUpdate/code1",
                  jsonRes
                }
              });
              this.props.history.push("/error");
            }
          })
          .catch(error => {
            console.log(error);
            this.props.dispatch({
              type: "E-SET",
              error: { frontendPlace: "Deals/componentDidUpdate/catch" }
            });
            this.props.history.push("/error");
          });
      }
    } else if (!this.state.ready) {
      this.setState({ ready: true });
    }
  };

  handleNavChange = e => {
    this.setState({
      navigator: e.target.id
    });
  };

  toggleBookInfo = (editing, book) => {
    if (this.state.bookInfoHidden) {
      // logic
      if (editing) {
        sessionStorage.setItem(
          "BookInfoParams",
          JSON.stringify({
            title: book.title,
            imageURL: book.imageURL,
            price: book.price,
            quality: book.quality
          })
        );
        this.setState({ bookInfoBookEditing: true, BookInfoId: book._id });
      }
      this.setState({ bookInfoHidden: false });
    } else {
      this.setState({
        bookInfoHidden: true,
        bookInfoBookEditing: false,
        BookInfoId: null
      });
      sessionStorage.removeItem("BookInfoParams");
      window.location = "/deals";
    }
  };

  render() {
    const loading = (
      <div id="deals-body" className="deals-loading">
        <LoadingL />
      </div>
    );

    const sellingBody = this.state.noBooksSelling ? (
      <div id="deals-empty-container" className="selling">
        <p id="deals-empty-header">Non hai venduto nessun libro, ancora...</p>
        <p
          id="deals-empty-link"
          onClick={() => {
            this.toggleBookInfo(false);
          }}
        >
          VENDI
        </p>
      </div>
    ) : (
      <div id="deals-body">
        {this.state.sellingBooks.map(book => {
          const date = new Date(book.insertionDate);
          let month = null;
          switch (date.getMonth()) {
            case 0:
              month = "gennaio";
              break;
            case 1:
              month = "febbraio";
              break;
            case 2:
              month = "marzo";
              break;
            case 3:
              month = "aprile";
              break;
            case 4:
              month = "maggio";
              break;
            case 5:
              month = "giugno";
              break;
            case 6:
              month = "luglio";
              break;
            case 7:
              month = "agosto";
              break;
            case 8:
              month = "settembre";
              break;
            case 9:
              month = "ottobre";
              break;
            case 10:
              month = "novembre";
              break;
            case 11:
              month = "dicembre";
              break;
            default:
              break;
          }
          const stringDate = `${date.getDate()} ${month} ${date.getUTCFullYear()}`;
          return (
            <Book
              key={book._id}
              book={{
                ...book,
                sellerUser: {
                  ...this.props.user,
                  deliveryInfo: this.props.user.DeliveryInfo
                }
              }}
              page="deals"
              date={stringDate}
              toggleBookInfo={this.toggleBookInfo}
            />
          );
        })}
      </div>
    );

    const soldBody = this.state.noBooksSold ? (
      <div id="deals-empty-container">
        <p id="deals-empty-header" className="deals-noBooksSold">
          Nessun utente ha comprato,{" "}
          <span id="deals-empty-hope">ancora...</span>
        </p>
      </div>
    ) : (
      <div id="deals-body">
        {this.state.soldBooksClusters.map(cluster => {
          return (
            <ClusterBooks
              books={cluster.Books}
              index={this.state.soldBooksClusters.indexOf(cluster)}
              deliveryInfo={cluster.delivery}
              place={cluster.buyerInfo.place}
              school={cluster.buyerInfo.school}
              page="deals"
              key={cluster._id}
              clusterId={cluster._id}
              userInfoId={cluster.buyerId}
              userInfo={cluster.buyerInfo}
              confirmed={cluster.confirmed}
              date={cluster.checkoutDate}
            />
          );
        })}
      </div>
    );

    const bodyComponent = this.state.loading
      ? loading
      : this.state.navigator === "selling"
      ? sellingBody
      : soldBody;

    return (
      <div id="deals">
        <BookInfo
          display={this.state.bookInfoHidden ? "hidden" : null}
          toggleDisplay={this.toggleBookInfo}
          editing={this.state.bookInfoBookEditing}
          id={this.state.BookInfoId}
        />
        <HeaderPart
          title="AFFARI"
          mainClass={"deals"}
          imageId="libridoo-logo-image"
          headerClass=""
        />
        <div id="deals-choices">
          <p
            id="selling"
            onClick={this.handleNavChange}
            className={`deals-choice deals-choiches-component ${
              this.state.navigator === "selling" ? "active" : null
            }`}
          >
            IN VENDITA
          </p>
          <p className="deals-choiches-component">|</p>
          <p
            id="sold"
            onClick={this.handleNavChange}
            className={`deals-choice deals-choiches-component ${
              this.state.navigator === "sold" ? "active" : null
            }`}
          >
            VENDUTI
          </p>
        </div>
        {bodyComponent}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps)(Deals);

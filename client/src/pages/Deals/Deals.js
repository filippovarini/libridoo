import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import "./Deals.css";

// components
import Book from "../../components/book/book";
import ClusterBooks from "../../components/clusterBooks/clusterBooks";
import HeaderPart from "../../components/headerPart";
import LoadingM from "../../components/Loading/loading_m";

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
    BookInfoId: null,
    display: "hidden"
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
    console.log(this.props.display, this.state.display);
    if (this.state.display !== this.props.display) {
      console.log("inside");
      if (this.props.display === "hidden") {
        // from null to hidden
        console.log("refresh");
        window.location = "/deals";
        this.setState({ display: "hidden" });
      } else this.setState({ display: null });
    }
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
        this.setState({ bookInfoBookEditing: true, BookInfoId: book._id });
        this.props.toggleBookInfo({
          title: book.title,
          imageURL: book.imageURL,
          price: book.price,
          quality: book.quality,
          id: book._id
        });
      }
      this.setState({ bookInfoHidden: false });
    } else {
      this.setState({
        bookInfoHidden: true,
        bookInfoBookEditing: false,
        BookInfoId: null
      });

      window.location = "/deals";
    }
  };

  render() {
    const loading = (
      <div id="deals-body" className="deals-loading">
        <LoadingM />
      </div>
    );

    const sellingBody = this.state.noBooksSelling ? (
      <div id="deals-empty-container" className="selling">
        <p id="deals-empty-header">Non hai venduto nessun libro, ancora...</p>
        <p className="de-subheader">
          Vendendo i tuoi libri ci aiuti a fornire a studenti come te i libri
          scolastici risparmiandogli la fatica nel comprarli e venderli...
          Aiutaci a farlo!
        </p>
        <p className="de-prompt" onClick={this.props.toggleBookInfo}>
          VENDI
        </p>
      </div>
    ) : (
      <div id="deals-body">
        {this.state.sellingBooks.map(book => {
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
              toggleBookInfo={this.toggleBookInfo}
            />
          );
        })}
      </div>
    );

    const soldBody = this.state.noBooksSold ? (
      <div id="deals-empty-container">
        <p id="deals-empty-header" className="deals-noBooksSold">
          Nessun utente ha comprato, ancora...
        </p>
        <p className="de-subheader">
          Ti consigliamo di vendere al 50% per essere competitivo ed attrarre
          clienti
        </p>
        <p className="de-prompt" onClick={this.props.toggleBookInfo}>
          VENDI
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

    let bodyComponent = this.state.loading
      ? loading
      : this.state.navigator === "selling"
      ? sellingBody
      : soldBody;

    if (!this.props.user._id) bodyComponent = loading;

    return (
      <div id="deals">
        <HeaderPart title="AFFARI" />
        <div id="deals-problem-container">
          <Link id="deals-problem-link" to="/FAQs">
            Problemi con un{" "}
            {this.state.navigator === "selling" ? "annuncio" : "ordine"}?
          </Link>
        </div>
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
          <p id="ds" className="deals-choiches-component">
            |
          </p>
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

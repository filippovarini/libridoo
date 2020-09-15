import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import HeaderPart from "../../components/headerPart";
import "./Orders.css";

// components
import ClusterBooks from "../../components/clusterBooks/clusterBooks";
import RatingPopUp from "../../components/ratingPopUp/ratingPopUp";
import LoadingM from "../../components/Loading/loading_m";

class Orders extends Component {
  state = {
    clusters: [],
    ready: false,
    notBought: false,
    loading: true,
    ratingPopUpHidden: true,
    userRated: null,
    smallLoading: false
  };

  toggleDisplay = () => {
    this.setState({
      ratingPopUpHidden: !this.state.ratingPopUpHidden
    });
  };

  componentDidMount = () => {
    this.setState({ ready: false });
  };

  componentDidUpdate = () => {
    if (this.state.ready) {
      if (!sessionStorage.getItem("JWT") && !localStorage.getItem("JWT")) {
        this.props.history.push("/login");
      } else if (this.state.clusters.length === 0 && !this.state.notBought) {
        if (this.props.user.place) {
          // only if logged
          fetch(`api/book/fetch/bought/${this.props.user._id}`)
            .then(res => res.json())
            .then(jsonRes => {
              if (jsonRes.code === 1) {
                // error
                this.props.dispatch({
                  type: "E-SET",
                  error: {
                    frontendPlace: "Orders/componentDidUpdate/code1",
                    jsonRes
                  }
                });
                this.props.history.push("/error");
              } else if (jsonRes.code === 2) {
                // no books sold
                this.setState({ notBought: true, loading: false });
              } else if (jsonRes.code === 0) {
                this.setState({
                  clusters: jsonRes.clusters.reverse(),
                  notBought: false,
                  loading: false
                });
              }
            })
            .catch(error => {
              console.log(error);
              this.props.dispatch({
                type: "E-SET",
                error: { frontendPlace: "Orders/componentDidMount/catch" }
              });
              this.props.history.push("/error");
            });
        }
      }
    } else if (!this.state.ready) {
      this.setState({ ready: true });
    }
  };

  sendTransfer = clusterId => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Confermi di aver ricevuto i libri dal venditore?")) {
      this.setState({ smallLoading: true });
      let cluster = this.state.clusters.filter(cluster => {
        return cluster._id === clusterId;
      });
      cluster = cluster[0];
      let total = cluster.delivery.choosen ? cluster.delivery.cost : 0;
      cluster.Books.forEach(book => (total += book.price));
      if (cluster.sellerInfo.payOut.type === "stripe") {
        // separate route between stripe and paypal
        const body = {
          accountId: cluster.sellerInfo.payOut.accountId,
          clusterId,
          total
        };
        console.log(cluster);
        console.log(body);
        fetch("/api/payment/transfer", {
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
            if (jsonRes.code === 0) {
              // success
              this.confirmOrder(clusterId);
            } else if (jsonRes.code === 1) {
              if (jsonRes.insufficient) {
                // insufficient balance
                this.confirmOrder(clusterId);
              } else {
                // general error
                this.props.dispatch({
                  type: "E-SET",
                  error: {
                    frontendPlace: "Orders/sendTransfer/code1/genera/118",
                    jsonRes
                  }
                });
                this.props.history.push("/error");
              }
            }
          })
          .catch(error => {
            this.props.dispatch({
              type: "E-SET",
              error: {
                frontendPlace: "Orders/sendTransfer/catch/130",
                jsonRes: {
                  message:
                    "Qualcosa è andato storto nel pagamento del venditore. Controlla di avere una connessione stabile e riprova più tardi. Se il problema persiste, non esitare a conttatarci.",
                  error
                }
              }
            });
            this.props.history.push("/error");
          });
      }
    }
  };

  confirmOrder = clusterId => {
    //   store user in state
    fetch("/api/book/confirm", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ clusterID: clusterId })
    })
      .then(res => res.json())
      .then(jsonRes => {
        if (jsonRes.code === 0) {
          //   correct
          //   update, new request
          //   rating pop-up
          this.setState({
            ready: false,
            smallLoading: false,
            clusters: [],
            ratingPopUpHidden: false,
            userRated: {
              name: jsonRes.cluster.sellerInfo.name,
              _id: jsonRes.cluster.sellerId
            }
          });
        } else {
          // error
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "Orders/confirmOrder/code1", jsonRes }
          });
          this.props.history.push("/error");
        }
      })
      .catch(error => {
        console.log(error);
        this.props.dispatch({
          type: "E-SET",
          error: { frontendPlace: "Orders/confirmOrder/catch" }
        });
        this.props.history.push("/error");
      });
  };

  render() {
    const loading = (
      <div id="orders-loading">
        <LoadingM />
      </div>
    );
    const empty = (
      <div id="orders-empty-container">
        <p id="orders-empty-header">Non hai comprato nessun libro, ancora...</p>
        <p id="empty-subHeader">
          Su libridoo i libri vengono solitamente venduti al 50%. Sfrutta la
          nostra polici ed{" "}
          <span id="orders-offer">
            inizia subito a risparmiare, per te il 10% di sconto sul primo
            ordine!
          </span>
        </p>
        <Link id="orders-empty-link" to="/search">
          COMPRA SUBITO
        </Link>
      </div>
    );
    const loaded = (
      <div id="orders-body-container">
        <p id="orders-header-suggester">
          Conferma l'ordine <span id="oc-highlight">solo dopo</span> averlo
          ricevuto
        </p>
        {this.state.clusters.map(cluster => {
          return (
            <ClusterBooks
              books={cluster.Books}
              index={this.state.clusters.indexOf(cluster)}
              deliveryInfo={cluster.delivery}
              place={cluster.sellerInfo.place}
              school={cluster.sellerInfo.school}
              page="orders"
              key={cluster._id}
              clusterId={cluster._id}
              userInfoId={cluster.sellerId}
              userInfo={cluster.sellerInfo}
              confirmed={cluster.confirmed}
              confirmOrder={this.sendTransfer}
              smallLoading={this.state.smallLoading}
            />
          );
        })}
      </div>
    );

    const bodyComponent = this.state.loading
      ? loading
      : this.state.notBought
      ? empty
      : loaded;
    return (
      <div id="orders">
        <RatingPopUp
          user={this.state.userRated}
          toggleDisplay={this.toggleDisplay}
          display={this.state.ratingPopUpHidden ? "hidden" : null}
        />
        <HeaderPart
          title={"ORDINI"}
          mainClass={"orders"}
          imageId="libridoo-logo-image"
          headerClass=""
        />
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

export default connect(mapStateToProps)(Orders);

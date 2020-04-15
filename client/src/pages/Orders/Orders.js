import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import "./Orders.css";

// components
import ClusterBooks from "../../components/clusterBooks/clusterBooks";
import RatingPopUp from "../../components/ratingPopUp/ratingPopUp";

class Orders extends Component {
  state = {
    clusters: [],
    ready: false,
    notBought: false,
    loading: true,
    ratingPopUpHidden: true,
    userRated: null
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

  confirmOrder = clusterId => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Confermi di aver ricevuto i libri dal venditore?")) {
      //   store user in state
      this.setState({ loading: true });
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
    }
  };

  render() {
    const loading = <h1>loading...</h1>;
    const empty = (
      <div id="empty-container">
        <p id="empty-header">Non hai comprato nessun libro, ancora...</p>
        <Link id="empty-link" to="/search">
          COMPRA SUBITO
        </Link>
      </div>
    );
    const loaded = (
      <div id="orders-body-container">
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
              confirmOrder={this.confirmOrder}
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
        <div id="orders-image-container">
          <p id="fake-header">ORDINI</p>
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

export default connect(mapStateToProps)(Orders);

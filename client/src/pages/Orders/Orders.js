import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import HeaderPart from "../../components/headerPart";
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
    const loading = (
      <div id="orders-loading">
        <div id="alfa" className="loadingio-spinner-fidget-spinner-rpnwi4xirv">
          <div className="ldio-xj4o7xwbsdb">
            <div>
              <div>
                <div style={{ left: "33.835px", top: "5.555px" }}></div>
                <div style={{ left: "9.595px", top: "47.47px" }}></div>
                <div style={{ left: "58.075px", top: "47.47px" }}></div>
              </div>
              <div>
                <div style={{ left: "43.935px", top: "15.655px" }}></div>
                <div style={{ left: "19.695px", top: "57.57px" }}></div>
                <div style={{ left: "68.175px", top: "57.57px" }}></div>
              </div>
              <div style={{ left: "33.835px", top: "33.835px" }}></div>
              <div>
                <div
                  style={{
                    left: "37.875px",
                    top: "30.3px",
                    transform: "rotate(-20deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "58.075px",
                    top: "30.3px",
                    transform: "rotate(20deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "29.29px",
                    top: "45.45px",
                    transform: "rotate(80deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "39.39px",
                    top: "62.115px",
                    transform: "rotate(40deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "66.66px",
                    top: "45.45px",
                    transform: "rotate(100deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "56.56px",
                    top: "62.115px",
                    transform: "rotate(140deg)"
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
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
        <p id="orders-header-suggester">Conferma</p>
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

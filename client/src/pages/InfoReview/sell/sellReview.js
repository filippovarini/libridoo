import React, { Component } from "react";
import { connect } from "react-redux";
import "./sellReview.css";

// components
import PlaceInfo from "../../../components/Infos/placeInfo/placeInfo";
import SellerInfo from "../../../components/Infos/bodyInfo/bodyInfo";
import DeliveryInfo from "../../../components/Infos/deliveryInfo/deliveryInfo";

class sellReview extends Component {
  state = {
    placeEmpty: null,
    sellerInfoEmpty: null,
    deliveryEmpty: null,
    updated: false,
    emptyClass: null,
    emptyClassHeader: "hidden",
    loading: false,
    successful: false,
    submitted: false,
    set: false,
    done: false
  };

  componentDidMount = () => {
    if (
      !sessionStorage.getItem("BookInfoParams") ||
      (!sessionStorage.getItem("JWT") && !localStorage.getItem("JWT"))
    ) {
      this.props.history.push("/");
    } else if (this.props.user.DeliveryInfo) {
      const user = this.props.user;
      if (!user.phone) {
        this.setState({ sellerInfoEmpty: true });
      }
      if (!user.DeliveryInfo.timeToMeet) {
        this.setState({ deliveryEmpty: true });
      }
      if (!user.place.city) {
        this.setState({ placeEmpty: true });
      }
      this.setState({ set: true });
    }
  };

  componentDidUpdate = () => {
    if (this.state.updated) {
      // ready
      if (!this.props.user.DeliveryInfo) {
        //   restriction
        this.props.history.push("/");
      } else if (!this.state.set) {
        const user = this.props.user;
        if (!user.phone) {
          this.setState({ sellerInfoEmpty: true });
        }
        if (!user.DeliveryInfo.timeToMeet) {
          this.setState({ deliveryEmpty: true });
        }
        if (!user.place.city) {
          this.setState({ placeEmpty: true });
        }
        this.setState({ set: true });
      }
    } else {
      this.setState({ updated: true });
    }
    if (
      this.props.user.place &&
      this.props.user.place.city &&
      this.props.user.phone &&
      this.props.user.DeliveryInfo &&
      this.props.user.DeliveryInfo.timeToMeet &&
      !this.state.done
    ) {
      this.setState({ done: true });
      this.handleSubmit();
    }
  };

  handleSubmit = () => {
    const user = this.props.user;
    if (!user.phone || !user.DeliveryInfo.timeToMeet || !user.place.city) {
      this.setState({ emptyClass: "invalid", emptyClassHeader: null });
    } else {
      // post book
      const initialBody = JSON.parse(sessionStorage.getItem("BookInfoParams"));
      const body = { ...initialBody, place: user.place };
      this.setState({ submitted: true, loading: true });
      fetch("/api/book/insert", {
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
            // error
            this.props.dispatch({
              type: "E-SET",
              error: {
                frontendPlace: "InfoReview-sell/handleSubmit/code1",
                jsonRes
              }
            });
            this.props.history.push("/error");
          } else {
            // perfect
            // show for a bit "successful", then hide it
            sessionStorage.removeItem("BookInfoParams");
            this.setState({ loading: false, successful: true });
            setTimeout(() => {
              this.props.history.push("/");
            }, 1000);
          }
        })
        .catch(error => {
          // store and redirect
          this.props.dispatch({
            type: "E-SET",
            error: {
              frontendPlace: "InfoReview-sell/handleSubmit/catch",
              error
            }
          });
          this.props.history.push("/error");
        });
    }
  };

  render() {
    const placeInfo = this.state.placeEmpty ? <PlaceInfo /> : null;
    const bodyInfo = this.state.sellerInfoEmpty ? <SellerInfo /> : null;
    const deliveryInfo = this.state.deliveryEmpty ? <DeliveryInfo /> : null;

    const loading = <h1 className="inside">loading...</h1>;
    const successful = (
      <h1 className="successful inside">Libro inserito con successo</h1>
    );

    let bodyComponent = this.state.loading ? (
      loading
    ) : (
      <div>
        <p id="empty-header" className={this.state.emptyClassHeader}>
          COMPILA TUTTI I CAMPI!
        </p>
        {placeInfo}
        {bodyInfo}
        {deliveryInfo}
      </div>
    );

    if (this.state.successful) bodyComponent = successful;

    // const submit = !this.state.submitted ? (
    //   <p id="submit" onClick={this.handleSubmit}>
    //     VENDI
    //   </p>
    // ) : null;

    return (
      <div id="infoReview">
        <p id="header-review">Compila per vendere</p>
        <div id="info-container" className={this.state.emptyClass}>
          {bodyComponent}
        </div>
        {/* {submit} */}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { user: state.user };
};

export default connect(mapStateToProps)(sellReview);

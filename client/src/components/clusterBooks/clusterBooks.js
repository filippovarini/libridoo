import React, { Component } from "react";
import { connect } from "react-redux";
import "./clusterBooks.css";

// component
import InfoComponent from "./infoComponent/infoComponent";
import UserInfo from "../../components/userInfo/userInfo";

// books / deliveryInfo / place / school / page / userInfoId / userInfo / confirmed? / clusterId? / confirmOrder? / date (type date)
class ClusterBooks extends Component {
  state = {
    deliveryHover: false,
    choosen: false,
    justClicked: false,
    ready: false,
    updated: false,
    userInfoHidden: true
  };

  componentDidMount = () => {
    this.setState({ choosen: false });
  };

  componentDidUpdate = () => {
    if (this.state.ready && !this.state.updated) {
      this.setState({
        choosen: this.props.deliveryInfo.choosen,
        updated: true
      });
    } else if (!this.state.ready) {
      this.setState({ ready: true });
    }
  };

  deliveryHover = () => {
    this.setState({ deliveryHover: true });
  };

  deliveryLeave = () => {
    this.setState({ deliveryHover: false, justClicked: false });
  };

  deliveryClicked = () => {
    const deliveryArr = sessionStorage.getItem("__cds_Ids")
      ? JSON.parse(sessionStorage.getItem("__cds_Ids"))
      : [];
    if (this.state.choosen) {
      // removing
      if (deliveryArr.length === 1) {
        sessionStorage.removeItem("__cds_Ids");
      } else {
        const index = deliveryArr.indexOf(this.props.userInfoId);
        deliveryArr.splice(index, 1);
        sessionStorage.setItem("__cds_Ids", JSON.stringify(deliveryArr));
      }
    } else {
      // add
      deliveryArr.push(this.props.userInfoId);
      sessionStorage.setItem("__cds_Ids", JSON.stringify(deliveryArr));
    }
    // toggle state and reducer
    this.props.dispatch({
      type: "TOGGLE-DELIVERY",
      clusterIndex: this.props.index,
      id: this.props.userInfoId
    });
    this.setState({ choosen: !this.state.choosen, justClicked: true });
  };

  toggleDisplay = () => {
    this.setState({
      userInfoHidden: !this.state.userInfoHidden
    });
  };

  render() {
    let delivery = false;
    let text = null;
    let clickable = false;
    if (this.props.user.place && this.props.user.place.city) {
      let delivers = false;
      // logged
      switch (this.props.deliveryInfo.range) {
        case "NO":
          break;
        case "country":
          if (this.props.place.country === this.props.user.place.country) {
            delivers = true;
          }
          break;

        case "region":
          if (this.props.place.region === this.props.user.place.region) {
            delivers = true;
          }
          break;

        case "city":
          if (this.props.place.city === this.props.user.place.city) {
            delivers = true;
          }
          break;
        default:
          break;
      }
      if (delivers) {
        text = `SPEDIZIONE per € ${this.props.deliveryInfo.cost}`;
        clickable = true;
        delivery = true;
      }
    } else {
      // not logged
      switch (this.props.deliveryInfo.range) {
        case "NO":
          break;
        case "country":
          text = `Spedisce in ${this.props.place.country}`;
          delivery = true;
          break;

        case "region":
          text = `Spedisce in zona ${this.props.place.region}`;
          delivery = true;
          break;

        case "city":
          text = `Spedisce in zona ${this.props.place.city}`;
          delivery = true;
          break;
        default:
          break;
      }
    }

    let activeText = text;
    if (this.state.deliveryHover) {
      if (!this.state.choosen) {
        activeText = <i className="fas fa-check delivery-icon"></i>;
      } else {
        // hover delete
        activeText = <i className="fas fa-backspace delivery-icon"></i>;
      }
    } else {
      if (this.state.choosen) {
        activeText = <i className="fas fa-check delivery-icon"></i>;
      }
    }

    if (this.state.justClicked) {
      if (this.state.choosen) {
        activeText = <i className="fas fa-check delivery-icon"></i>;
      } else {
        activeText = <i className="fas fa-backspace delivery-icon"></i>;
      }
    }

    const unactivePrompt = this.state.deliveryHover ? (
      <p className="delivery-header long">
        Completa le informazioni personali prima
      </p>
    ) : (
      <p className="delivery-header">{text}</p>
    );

    const checkoutDelivery = delivery ? (
      clickable ? (
        <div
          id="checkout-delivery"
          className="delivery clickable"
          onMouseOver={this.deliveryHover}
          onTouchStart={this.deliveryHover}
          onMouseLeave={this.deliveryLeave}
          onTouchEnd={this.deliveryLeave}
          onClick={this.deliveryClicked}
        >
          <p className="delivery-header">{activeText}</p>
        </div>
      ) : (
        <div
          id="checkout-delivery"
          className="delivery"
          onMouseOver={this.deliveryHover}
          onTouchStart={this.deliveryHover}
          onMouseLeave={this.deliveryLeave}
          onTouchEnd={this.deliveryLeave}
        >
          {unactivePrompt}
        </div>
      )
    ) : null;

    let checkoutTotalPrice = 0;
    this.props.books.forEach(book => (checkoutTotalPrice += book.price));

    const checkout = {
      delivery: checkoutDelivery,
      upperIcon: (
        <div
          id="result-upperIcon"
          className="upperIcon-container icon-container"
          onClick={this.toggleDisplay}
        >
          <UserInfo
            userId={this.props.userInfoId}
            user={this.props.userInfo}
            hidden={true}
            place={this.props.place}
            toggleDisplay={this.toggleDisplay}
            display={this.state.userInfoHidden ? "hidden" : null}
          />
          <i className="fas fa-address-card fa-1x upperIcon book-icon"></i>
        </div>
      ),
      lowerIcon: (
        <div
          id="checkout-lower-icon"
          className="lowerIcon-container icon-container"
        >
          <span id="price-icon" className="book-icon lower-icon span-icon">
            € {checkoutTotalPrice}
          </span>
        </div>
      ),
      subHeaders: (
        <div id="subHeader-container">
          <div id="place-subHeader" className="sub-header">
            <i className="fas fa-home fa-1x sub-header-ico"></i>
            <p id="place-sub-header-text" className="sub-header-text">
              {this.props.place.city}, {this.props.school}
            </p>
          </div>
          <div id="timeToMeet-subHeader" className="sub-header">
            <i
              id="handshake"
              className="fas fa-handshake sub-header-ico fa-1x"
            ></i>
            <p id="timeToMeet" className="sub-header-text">
              Consegno in città entro {this.props.deliveryInfo.timeToMeet}{" "}
              giorni
            </p>
          </div>
        </div>
      )
    };

    const ordersDelivery = this.props.deliveryInfo.choosen ? (
      <div id="orders-delivery" className="delivery">
        <p className="delivery-header">SPEDIZIONE SELEZIONATA</p>
      </div>
    ) : null;

    const orders = {
      delivery: ordersDelivery,
      upperIcon: (
        <div
          id="orders-upperIcon"
          className="upperIcon-container icon-container"
          onClick={this.toggleDisplay}
        >
          <UserInfo
            userId={this.props.userInfoId}
            user={this.props.userInfo}
            hidden={false}
            place={this.props.place}
            toggleDisplay={this.toggleDisplay}
            display={this.state.userInfoHidden ? "hidden" : null}
          />
          <i className="fas fa-address-card fa-1x upperIcon book-icon"></i>
        </div>
      ),
      lowerIcon: !this.props.confirmed ? (
        <div
          id="orders-lower-icon"
          className="lowerIcon-container notConfirmed icon-container notConfirmed orders-icon"
          onClick={() => {
            this.props.confirmOrder(this.props.clusterId);
          }}
        >
          <span id="confirm-icon" className="book-icon lower-icon span-icon">
            CONFERMA
          </span>
        </div>
      ) : (
        <div
          id="order-confirmed-lower-icon"
          className={`lowerIcon-container icon-container orders-icon ${
            this.props.confirmed ? "confirmed" : null
          }`}
        >
          <i className="fas fa-check book-icon lower-icon"></i>
        </div>
      ),
      subHeaders: (
        <div id="subHeader-container">
          <div id="place-subHeader" className="sub-header">
            <i className="fas fa-home fa-1x sub-header-ico"></i>
            <p id="place-sub-header-text" className="sub-header-text">
              {this.props.place.city}, {this.props.school}
            </p>
          </div>
          <div id="timeToMeet-subHeader" className="sub-header">
            <i
              id="handshake"
              className="fas fa-handshake sub-header-ico fa-1x"
            ></i>
            <p id="timeToMeet" className="sub-header-text">
              Consegno in città entro {this.props.deliveryInfo.timeToMeet}{" "}
              giorni
            </p>
          </div>
        </div>
      )
    };

    const dealsDelivery = this.props.deliveryInfo.choosen ? (
      <div id="deals-delivery" className="delivery">
        <p className="delivery-header">DA SPEDIRE</p>
      </div>
    ) : null;

    let totalPrice = this.props.deliveryInfo.choosen
      ? this.props.deliveryInfo.cost
      : 0;
    this.props.books.forEach(book => {
      totalPrice += book.price;
    });

    const difference = this.props.deliveryInfo.choosen
      ? null
      : this.props.date
      ? Math.round((new Date() - new Date(this.props.date)) / 86400000)
      : 0;
    const deadline = this.props.deliveryInfo.choosen
      ? null
      : this.props.deliveryInfo.timeToMeet - difference;

    const deals = {
      delivery: dealsDelivery,
      upperIcon: (
        <div
          id="deals-upperIcon"
          className="upperIcon-container icon-container"
          onClick={this.toggleDisplay}
        >
          <UserInfo
            userId={this.props.userInfoId}
            user={this.props.userInfo}
            hidden={false}
            place={this.props.place}
            toggleDisplay={this.toggleDisplay}
            display={this.state.userInfoHidden ? "hidden" : null}
          />
          <i className="fas fa-address-card fa-1x upperIcon book-icon"></i>
        </div>
      ),
      lowerIcon: (
        <div
          id="deals-lower-icon"
          className={`lowerIcon-container icon-container orders-icon ${
            this.props.confirmed ? "confirmed" : "notConfirmed"
          }`}
          onClick={() => {
            this.props.confirmOrder(this.props.clusterId);
          }}
        >
          <span id="price-icon" className="book-icon lower-icon span-icon">
            {totalPrice}
          </span>
        </div>
      ),
      subHeaders: (
        <div id="subHeader-container">
          <div id="place-subHeader" className="sub-header">
            <i className="fas fa-home fa-1x sub-header-ico"></i>
            <p id="place-sub-header-text" className="sub-header-text">
              {this.props.place.city}, {this.props.school}
            </p>
          </div>
          {this.props.deliveryInfo.choosen ? (
            <div id="deliveryHeader-subHeader" className="sub-header">
              <i className="fas fa-truck sub-header-ico fa-1x"></i>
              <p className="sub-header-text">
                Consegna già pagata, €{this.props.deliveryInfo.cost}
              </p>
            </div>
          ) : (
            <div id="timeToMeet-subHeader" className="sub-header">
              <i
                id="handshake"
                className="fas fa-handshake sub-header-ico fa-1x"
              ></i>
              <p id="timeToMeet" className="sub-header-text">
                {deadline
                  ? deadline > 1
                    ? `Da consegnare in entro ${deadline} giorni`
                    : deadline > 0
                    ? "Da consegnare in entro 1 giorno"
                    : "Dovresti averlo già consegnato"
                  : `Da consegnare in entro ${this.props.deliveryInfo.timeToMeet} giorni dalla data`}
              </p>
            </div>
          )}
        </div>
      )
    };

    let page = null;
    switch (this.props.page) {
      case "checkout":
        page = checkout;
        break;
      case "orders":
        page = orders;
        break;
      case "deals":
        page = deals;
        break;
      default:
        break;
    }

    return (
      <div id="book-cluster-container">
        <div id="book-cluster">
          {page.upperIcon}
          {page.lowerIcon}
          {this.props.books.map(book => {
            return (
              <InfoComponent
                book={book}
                page={this.props.page}
                key={book._id}
                clusterIndex={this.props.index}
                index={this.props.books.indexOf(book)}
                delivery={this.props.deliveryInfo}
              />
            );
          })}
          {page.subHeaders}
          {page.delivery}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    selectedBooks: state.selectedBooks
  };
};

export default connect(mapStateToProps)(ClusterBooks);
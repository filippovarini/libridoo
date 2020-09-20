import React, { Component } from "react";
import { connect } from "react-redux";
import "./clusterBooks.css";

// components
import LoadingS from "../Loading/loading_s";
import Stars from "../stars/stars";

// component
import InfoComponent from "./infoComponent/infoComponent";

// books / deliveryInfo / place / school / page / userInfoId / userInfo / confirmed? / clusterId? / confirmOrder? / date (type date)
class ClusterBooks extends Component {
  state = {
    choosen: false,
    justClicked: false,
    ready: false,
    updated: false
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

  render() {
    //   deliveryString
    let text = null;
    if (this.props.user.place && this.props.user.place.city) {
      // not logged
      switch (this.props.deliveryInfo.range) {
        case "NO":
          break;
        case "country":
          text = `Spedisco in ${this.props.place.country}`;
          break;

        case "region":
          text = `Spedisco in zona ${this.props.place.region}`;
          break;

        case "city":
          text = `Spediro in zona ${this.props.place.city}`;
          break;
        default:
          break;
      }
    }

    // priceString
    const priceString = price => {
      if (String(price).indexOf(".") === -1) {
        // whole price
        return `${price}.00`;
      } else {
        // decimal
        if (String(price).split(".")[1].length === 1) return `${price}0`;
        else return price;
      }
    };

    let booksPrice = 0;
    this.props.books.forEach(
      book => (booksPrice = (book.price * 100 + booksPrice * 100) / 100)
    );

    const totalPrice = this.props.deliveryInfo.choosen
      ? (booksPrice * 100 + this.props.deliveryInfo.cost * 100) / 100
      : booksPrice;

    const difference = this.props.deliveryInfo.choosen
      ? null
      : this.props.date
      ? Math.round((new Date() - new Date(this.props.date)) / 86400000)
      : 0;
    const deadline = this.props.deliveryInfo.choosen
      ? null
      : this.props.deliveryInfo.timeToMeet - difference;

    const checkout =
      this.props.books.length > 1 ? (
        // totalLeft
        <div id="cb" className="totalLeft">
          <div id="left-info">
            <div id="contained">
              <div id="user-box" className="box-container">
                <div className="box box-big">
                  <i className="fas fa-user-graduate"></i>
                  <p id="user-header" className="box-text">
                    {this.props.userInfo.name
                      ? this.props.userInfo.name.split(" ")[0]
                      : "INFO VENDITORE"}
                  </p>
                </div>
                <div>
                  <div className="box box-small">
                    <p className="rating-header box-text">
                      {/* SINCERITÀ SULLA QUALITÀ{" "} */}
                      AFFIDABILITÀ
                    </p>
                    <div className="rating">
                      <Stars
                        rating={
                          this.props.userInfo.rating
                            ? Math.round(
                                this.props.userInfo.rating.qualityAverage
                              )
                            : 2.5
                        }
                      />
                      <p className="mean box-text">
                        {this.props.userInfo.rating
                          ? Math.round(
                              this.props.userInfo.rating.qualityAverage * 10
                            ) / 10
                          : 2.5}
                      </p>
                    </div>
                  </div>
                  <div className="box box-small">
                    <p className="rating-header box-text">CONSEGNA</p>
                    <div className="rating">
                      <Stars
                        rating={
                          this.props.userInfo.rating
                            ? Math.round(
                                this.props.userInfo.rating.deliveryAverage
                              )
                            : 2.5
                        }
                      />
                      <p className="box-text mean">
                        {this.props.userInfo.rating
                          ? Math.round(
                              this.props.userInfo.rating.deliveryAverage * 10
                            ) / 10
                          : 2.5}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p id="price-box">{priceString(totalPrice)} €</p>
              <div id="delivery-boxes" className="box-container">
                <p id="place" className="box-text delivery">
                  {this.props.place.city}, {this.props.userInfo.school}
                </p>

                <div className="box delivery-box">
                  <i className="fas fa-handshake box-ico"></i>
                  <p className="box-text delivery">
                    Consegno in città entro {this.props.deliveryInfo.timeToMeet}{" "}
                    giorni
                  </p>
                </div>

                <div className="box delivery-box">
                  <i className="fas fa-truck delivery-ico"></i>
                  <p className="box-text delivery">
                    {text || "Non effettuo spedizioni"}
                    <i
                      style={{
                        marginLeft: "5px",
                        color: "rgb(32, 165, 32)"
                      }}
                      className={`fas fa-check ${
                        this.state.choosen ? null : "hidden"
                      }`}
                    ></i>
                  </p>
                </div>

                {text ? (
                  <p className="box click-box" onClick={this.deliveryClicked}>
                    {this.state.choosen
                      ? `CANCELLA (-${this.props.deliveryInfo.cost} €)`
                      : `SPEDISCIMELO (+${this.props.deliveryInfo.cost} €)`}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <div id="infoBooks">
            {this.props.books.map(book => {
              return (
                <InfoComponent
                  book={book}
                  page={this.props.page}
                  key={book._id}
                  clusterIndex={this.props.index}
                  index={this.props.books.indexOf(book)}
                  maxLength={this.props.books.length}
                  delivery={this.props.deliveryInfo}
                />
              );
            })}
          </div>
        </div>
      ) : (
        // totalLeft
        <div id="cb" className="totalLeft">
          <div id="left-info" className="single">
            <div id="contained">
              <div id="user-box" className="box-container single">
                <div className="box box-big">
                  <i className="fas fa-user-graduate"></i>
                  <p id="user-header" className="box-text">
                    {this.props.user.name
                      ? this.props.userInfo.name.split(" ")[0]
                      : "INFO VENDITORE"}
                  </p>
                </div>
                <div>
                  <div className="box box-small">
                    <p className="rating-header box-text">
                      {/* SINCERITÀ SULLA QUALITÀ{" "} */}
                      AFFIDABILITÀ
                    </p>
                    <div className="rating">
                      <Stars
                        rating={
                          this.props.userInfo.rating
                            ? Math.round(
                                this.props.userInfo.rating.qualityAverage
                              )
                            : 2.5
                        }
                      />
                      <p className="mean box-text">
                        {this.props.userInfo.rating
                          ? Math.round(
                              (this.props.userInfo.rating.qualityAverage * 10) /
                                10
                            )
                          : 2.5}
                      </p>
                    </div>
                  </div>
                  <div className="box box-small">
                    <p className="rating-header box-text">CONSEGNA</p>
                    <div className="rating">
                      <Stars
                        rating={
                          this.props.userInfo.rating
                            ? Math.round(
                                this.props.userInfo.rating.deliveryAverage
                              )
                            : 2.5
                        }
                      />
                      <p className="box-text mean">
                        {this.props.userInfo.rating
                          ? Math.round(
                              (this.props.userInfo.rating.deliveryAverage *
                                10) /
                                10
                            )
                          : 2.5}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p id="price-box" className="single">
                {priceString(totalPrice)} €
              </p>
              {text ? (
                <div id="click-box-container">
                  <p
                    className="box click-box single"
                    onClick={this.deliveryClicked}
                  >
                    {this.state.choosen
                      ? `CANCELLA (-${this.props.deliveryInfo.cost} €)`
                      : `SPEDISCIMELO (+${this.props.deliveryInfo.cost} €)`}
                  </p>
                </div>
              ) : (
                <div id="click-box-container">
                  <p className="box click-box single no-delivery">
                    NON SPEDISCE
                  </p>
                </div>
              )}
            </div>
          </div>
          <div id="infoBooks-delivery">
            <div id="infoBooks" className="single">
              {this.props.books.map(book => {
                return (
                  <InfoComponent
                    book={book}
                    page={this.props.page}
                    key={book._id}
                    clusterIndex={this.props.index}
                    index={this.props.books.indexOf(book)}
                    maxLength={this.props.books.length}
                    delivery={this.props.deliveryInfo}
                  />
                );
              })}
            </div>
            <div id="delivery-boxes" className="box-container single">
              <div id="deliveries-contained" className="single">
                <div className="box ">
                  <p id="singlePlace" className="box-text delivery single">
                    {this.props.place.city}, {this.props.userInfo.school}
                  </p>
                </div>
                <div id="deliveries">
                  <div className="box delivery-box single">
                    <i className="fas fa-handshake box-ico"></i>
                    <p className="box-text delivery single">
                      Consegno in città entro{" "}
                      {this.props.deliveryInfo.timeToMeet} giorni
                    </p>
                  </div>
                  <div className="box delivery-box single">
                    <i className="fas fa-truck delivery-ico"></i>
                    <p className="box-text delivery single">
                      {text || "Non effettuo spedizioni"}
                      <i
                        style={{
                          marginLeft: "5px",
                          color: "rgb(32, 165, 32)"
                        }}
                        className={`fas fa-check ${
                          this.state.choosen ? null : "hidden"
                        }`}
                      ></i>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    const deals =
      this.props.books.length > 1 ? (
        // totalLeft
        <div id="cb" className="totalLeft">
          <div id="left-info" className="userImportant">
            <div id="contained">
              <div id="contacts" className="box-container single">
                <p id="user-header" className="box-text contacts-info">
                  <i className="fa fa-user info-ico"></i>{" "}
                  {this.props.userInfo.name || "INFO VENDITORE"}
                </p>
                <p id="place-contact" className=" contacts-info">
                  {this.props.place.city}, {this.props.userInfo.school}
                </p>
                <div id="email-contact" className="box contacts-info">
                  <i className="fas fa-envelope info-ico"></i>
                  <p className="box-text contacts">
                    {this.props.userInfo.email}
                  </p>
                </div>
                <div className="box contacts-info">
                  <i className="fas fa-mobile-alt info-ico"></i>
                  <p className="box-text contacts">
                    {this.props.userInfo.phone}
                  </p>
                </div>
              </div>
              {this.props.deliveryInfo.choosen ? (
                <div id="price-box-container" className="resized">
                  <p id="price-contacts" className="resized">
                    {priceString(totalPrice)} €
                  </p>
                  <p id="delivery-puntualizer">
                    spedizione già pagata ({this.props.deliveryInfo.cost}€)
                  </p>
                </div>
              ) : (
                <div id="price-box-container">
                  <p id="price-contacts">{priceString(totalPrice)} €</p>
                </div>
              )}
              {this.props.deliveryInfo.choosen ? (
                <div id="delivery-div" className="sub-contacts">
                  <p
                    id="delivery-suggester"
                    className={`suggester ${
                      this.props.confirmed ? "confirmed" : null
                    }`}
                  >
                    {this.props.confirmed ? "SPEDITO" : "DA SPEDIRE"}
                  </p>
                </div>
              ) : (
                <div id="timeToMeet-div" className="sub-contacts">
                  <p
                    id="timeToMeet-suggester"
                    className={`suggester ${
                      this.props.confirmed ? "confirmed" : null
                    }`}
                  >
                    {this.props.confirmed
                      ? "CONSEGNATO"
                      : deadline
                      ? deadline > 1
                        ? `Da consegnare entro ${deadline} giorni`
                        : deadline > 0
                        ? "Da consegnare entro 1 giorno"
                        : "Dovresti averlo consegnato"
                      : `Da consegnare in ${this.props.deliveryInfo.timeToMeet}`}
                  </p>
                </div>
              )}

              <div id="confirmed-subHeader" className="confirmation-lateral">
                <i
                  style={
                    this.props.confirmed ? { color: "rgb(32,165,32)" } : null
                  }
                  className={`fas fa-${
                    this.props.confirmed ? "check" : "spinner"
                  } fa-1x sub-header-ico`}
                ></i>
                <p id="place-sub-header-text" className="lateral">
                  {this.props.confirmed
                    ? "Ordine confermato, riceverai i soldi in meno di 10 giorni"
                    : "Il cliente deve ancora confermare"}
                </p>
              </div>
            </div>
          </div>
          <div id="infoBooks">
            {this.props.books.map(book => {
              return (
                <InfoComponent
                  book={book}
                  page={this.props.page}
                  key={book._id}
                  clusterIndex={this.props.index}
                  index={this.props.books.indexOf(book)}
                  maxLength={this.props.books.length}
                  delivery={this.props.deliveryInfo}
                />
              );
            })}
          </div>
        </div>
      ) : (
        // totalLeft
        <div id="cb" className="totalLeft">
          <div id="left-info" className="single userImportant">
            <div id="contained">
              <div id="contacts" className="box-container single">
                <p id="user-header" className="box-text contacts-info">
                  <i className="fa fa-user info-ico"></i>{" "}
                  {this.props.userInfo.name || "INFO VENDITORE"}
                </p>
                <p id="place-contact" className=" contacts-info">
                  {this.props.place.city}, {this.props.userInfo.school}
                </p>
                <div id="email-contact" className="box contacts-info">
                  <i className="fas fa-envelope info-ico"></i>
                  <p className="box-text contacts">
                    {this.props.userInfo.email}
                  </p>
                </div>
                <div className="box contacts-info">
                  <i className="fas fa-mobile-alt info-ico"></i>
                  <p className="box-text contacts">
                    {this.props.userInfo.phone}
                  </p>
                </div>
              </div>
              {this.props.deliveryInfo.choosen ? (
                <div id="delivery-div" className="sub-contacts">
                  <p
                    id="delivery-suggester"
                    className={`suggester ${
                      this.props.confirmed ? "confirmed" : null
                    }`}
                  >
                    {this.props.confirmed ? "SPEDITO" : "DA SPEDIRE"}
                  </p>
                </div>
              ) : (
                <div id="timeToMeet-div" className="sub-contacts">
                  <p
                    id="timeToMeet-suggester"
                    className={`suggester ${
                      this.props.confirmed ? "confirmed" : null
                    }`}
                  >
                    {this.props.confirmed
                      ? "CONSEGNATO"
                      : deadline
                      ? deadline > 1
                        ? `Da consegnare entro ${deadline} giorni`
                        : deadline > 0
                        ? "Da consegnare entro 1 giorno"
                        : "Dovresti averlo consegnato"
                      : `Da consegnare in ${this.props.deliveryInfo.timeToMeet}`}
                  </p>
                </div>
              )}
              {this.props.deliveryInfo.choosen ? (
                <div
                  id="price-box-container"
                  className={`resized ${
                    this.props.confirmed ? "confirmed" : null
                  }`}
                >
                  <p id="price-contacts" className="resized">
                    {priceString(totalPrice)} €
                  </p>
                  <p id="delivery-puntualizer">
                    spedizione già pagata ({this.props.deliveryInfo.cost}€)
                  </p>
                </div>
              ) : (
                <div
                  id="price-box-container"
                  className={this.props.confirmed ? "confirmed" : null}
                >
                  <p id="price-contacts">{priceString(totalPrice)} €</p>
                </div>
              )}
            </div>
          </div>
          <div id="infoBooks-delivery">
            <div id="infoBooks" className="single">
              {this.props.books.map(book => {
                return (
                  <InfoComponent
                    book={book}
                    page={this.props.page}
                    key={book._id}
                    clusterIndex={this.props.index}
                    index={this.props.books.indexOf(book)}
                    maxLength={this.props.books.length}
                    delivery={this.props.deliveryInfo}
                  />
                );
              })}
            </div>
            <div id="delivery-boxes" className="box-container single">
              <div id="deliveries-contained">
                <div
                  id="confirmed-subHeader"
                  className="sub-header confirmation"
                >
                  <i
                    style={
                      this.props.confirmed ? { color: "rgb(32,165,32)" } : null
                    }
                    className={`fas fa-${
                      this.props.confirmed ? "check" : "spinner"
                    } fa-1x sub-header-ico`}
                  ></i>
                  <p id="place-sub-header-text" className="sub-header-text">
                    {this.props.confirmed
                      ? "Ordine confermato, riceverai i soldi in meno di 10 giorni"
                      : "Il cliente deve ancora confermare"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    const orders =
      this.props.books.length > 1 ? (
        // totalLeft
        <div id="cb" className="totalLeft">
          <div id="left-info" className="userImportant">
            <div id="contained">
              <div id="contacts" className="box-container single">
                <p id="user-header" className="box-text contacts-info">
                  <i className="fa fa-user info-ico"></i>{" "}
                  {this.props.userInfo.name || "INFO VENDITORE"}
                </p>
                <p id="place-contact" className=" contacts-info">
                  {this.props.place.city}, {this.props.userInfo.school}
                </p>
                <div id="email-contact" className="box contacts-info">
                  <i className="fas fa-envelope info-ico"></i>
                  <p className="box-text contacts">
                    {this.props.userInfo.email}
                  </p>
                </div>
                <div className="box contacts-info">
                  <i className="fas fa-mobile-alt info-ico"></i>
                  <p className="box-text contacts">
                    {this.props.userInfo.phone}
                  </p>
                </div>
              </div>
              {this.props.deliveryInfo.choosen ? (
                <div
                  id="price-box-container"
                  className={`resized confirmed ${
                    this.props.confirmed ? "confirmed" : null
                  }`}
                >
                  <p id="price-contacts" className="resized">
                    {priceString(totalPrice)} €
                  </p>
                  <p id="delivery-puntualizer">
                    spedizione già pagata ({this.props.deliveryInfo.cost}€)
                  </p>
                </div>
              ) : (
                <div
                  id="price-box-container"
                  className={this.props.confirmed ? "confirmed" : null}
                >
                  <p id="price-contacts">{priceString(totalPrice)} €</p>
                </div>
              )}
              {this.props.deliveryInfo.choosen ? (
                <div id="delivery-div" className="sub-contacts">
                  <p
                    id="delivery-suggester"
                    className={`suggester ${
                      this.props.confirmed ? "confirmed" : null
                    }`}
                  >
                    {this.props.confirmed ? "RICEVUTO" : "CON SPEDIZIONE"}
                  </p>
                </div>
              ) : (
                <div id="timeToMeet-div" className="sub-contacts">
                  <p
                    id="timeToMeet-suggester"
                    className={`suggester ${
                      this.props.confirmed ? "confirmed" : null
                    }`}
                  >
                    {this.props.confirmed
                      ? "RICEVUTO"
                      : deadline
                      ? deadline > 1
                        ? `Consegnerà entro ${deadline} giorni`
                        : deadline > 0
                        ? "Consegnerà entro 1 giorno"
                        : "Dovrebbe averlo consegnato"
                      : `Da consegnare in ${this.props.deliveryInfo.timeToMeet}`}
                  </p>
                </div>
              )}

              {this.props.confirmed ? (
                <div
                  id="confirmed-subHeader"
                  className="sub-header confirmation"
                >
                  <i
                    style={{ color: "rgb(32,165,32)" }}
                    className="fas fa-check fa-1x sub-header-ico"
                  ></i>
                  <p id="place-sub-header-text" className="sub-header-text">
                    Hai confermato l'ordine
                  </p>
                </div>
              ) : (
                <div id="confirm-div" className="long">
                  <p id="confirm-suggester" className="orders-confirm">
                    ORDINE RICEVUTO?
                  </p>
                  {this.props.smallLoading ? (
                    <div id="confirm" className="loading">
                      <LoadingS />
                    </div>
                  ) : (
                    <p
                      id="confirm"
                      className="short"
                      onClick={() =>
                        this.props.confirmOrder(this.props.clusterId)
                      }
                    >
                      CONFERMA
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div id="infoBooks">
            {this.props.books.map(book => {
              return (
                <InfoComponent
                  book={book}
                  page={this.props.page}
                  key={book._id}
                  clusterIndex={this.props.index}
                  index={this.props.books.indexOf(book)}
                  maxLength={this.props.books.length}
                  delivery={this.props.deliveryInfo}
                />
              );
            })}
          </div>
        </div>
      ) : (
        // totalLeft
        <div id="cb" className="totalLeft">
          <div id="left-info" className="single userImportant">
            <div id="contained">
              <div id="contacts" className="box-container single">
                <p id="user-header" className="box-text contacts-info">
                  <i className="fa fa-user info-ico"></i>{" "}
                  {this.props.userInfo.name || "INFO VENDITORE"}
                </p>
                <p id="place-contact" className=" contacts-info">
                  {this.props.place.city}, {this.props.userInfo.school}
                </p>
                <div id="email-contact" className="box contacts-info">
                  <i className="fas fa-envelope info-ico"></i>
                  <p className="box-text contacts">
                    {this.props.userInfo.email}
                  </p>
                </div>
                <div className="box contacts-info">
                  <i className="fas fa-mobile-alt info-ico"></i>
                  <p className="box-text contacts">
                    {this.props.userInfo.phone}
                  </p>
                </div>
              </div>
              {this.props.deliveryInfo.choosen ? (
                <div id="delivery-div" className="sub-contacts">
                  <p
                    id="delivery-suggester"
                    className={`suggester ${
                      this.props.confirmed ? "confirmed" : null
                    }`}
                  >
                    {this.props.confirmed ? "RICEVUTO" : "CON SPEDIZIONE"}
                  </p>
                </div>
              ) : (
                <div id="timeToMeet-div" className="sub-contacts">
                  <p
                    id="timeToMeet-suggester"
                    className={`suggester ${
                      this.props.confirmed ? "confirmed" : null
                    }`}
                  >
                    {this.props.confirmed
                      ? "RICEVUTO"
                      : deadline
                      ? deadline > 1
                        ? `Consegnerà entro ${deadline} giorni`
                        : deadline > 0
                        ? "Consegnerà entro 1 giorno"
                        : "Dovrebbe averlo consegnato"
                      : `Da consegnare in ${this.props.deliveryInfo.timeToMeet}`}
                  </p>
                </div>
              )}
              {this.props.deliveryInfo.choosen ? (
                <div
                  id="price-box-container"
                  className={`resized ${
                    this.props.confirmed ? "confirmed" : null
                  }`}
                >
                  <p id="price-contacts" className="resized">
                    {priceString(totalPrice)} €
                  </p>
                  <p id="delivery-puntualizer">
                    spedizione già pagata ({this.props.deliveryInfo.cost}€)
                  </p>
                </div>
              ) : (
                <div
                  id="price-box-container"
                  className={this.props.confirmed ? "confirmed" : null}
                >
                  <p id="price-contacts">{priceString(totalPrice)} €</p>
                </div>
              )}
            </div>
          </div>
          <div id="infoBooks-delivery">
            <div id="infoBooks" className="single">
              {this.props.books.map(book => {
                return (
                  <InfoComponent
                    book={book}
                    page={this.props.page}
                    key={book._id}
                    clusterIndex={this.props.index}
                    index={this.props.books.indexOf(book)}
                    maxLength={this.props.books.length}
                    delivery={this.props.deliveryInfo}
                  />
                );
              })}
            </div>
            <div id="delivery-boxes" className="box-container single">
              {this.props.confirmed ? (
                <div
                  id="confirmed-subHeader"
                  className="sub-header confirmation"
                >
                  <i
                    style={{ color: "rgb(32,165,32)" }}
                    className="fas fa-check fa-1x sub-header-ico"
                  ></i>
                  <p id="place-sub-header-text" className="sub-header-text">
                    Hai confermato l'ordine
                  </p>
                </div>
              ) : (
                <div id="confirm-div" className="long">
                  <p id="confirm-suggester" className="orders-confirm">
                    ORDINE RICEVUTO?
                  </p>
                  {this.props.smallLoading ? (
                    <div id="confirm" className="loading">
                      <LoadingS />
                    </div>
                  ) : (
                    <p
                      id="confirm"
                      className="orders-confirm"
                      onClick={() =>
                        this.props.confirmOrder(this.props.clusterId)
                      }
                    >
                      CONFERMA
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );

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

    return page;
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    selectedBooks: state.selectedBooks
  };
};

export default connect(mapStateToProps)(ClusterBooks);

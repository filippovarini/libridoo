import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import LoadingM from "../Loading/loading_m";
import LoadingL from "../Loading/loading_l";
import "./BookInfo.css";

const initialState = {
  imgUrl: "",
  title: null,
  quality: "title",
  price: null,
  decimal: "00",
  actualPrice: 0,
  submitting: true,
  generalLoading: false,
  imageClass: "normal",
  selectHeaderClass: "hiddenVisibility",
  successful: false,
  errorMessage: null,
  imageDone: false,
  editSet: false
};

class BookInfo extends Component {
  state = {
    imgUrl: "",
    title: null,
    quality: "title",
    price: null,
    decimal: "00",
    actualPrice: 0,
    imageClass: "normal",
    submitting: true,
    selectHeaderClass: "hiddenVisibility",
    generalLoading: false,
    successful: false,
    errorMessage: null,
    imageDone: false,
    editSet: false
  };

  componentDidUpdate = () => {
    if (this.props.book && !this.state.editSet) {
      console.log(Object.keys(this.props.book).length > 10);
      const book = this.props.book;
      this.setState({
        imgUrl: book.imageURL,
        title: book.title,
        quality: book.quality,
        price: Number(String(book.price).split(".")[0]),
        // decimal: String(book.price).split(".")[1],
        submitting: false,
        imageDone: true,
        editSet: true
      });
    }
  };

  // sets total Price
  setActualPrice = (price, decimal) => {
    console.log(price, decimal);
    const decimalPrice = decimal
      ? decimal.length === 1
        ? Number(decimal) / 10
        : Number(decimal) / 100
      : this.state.decimal
      ? this.state.decimal.length === 1
        ? Number(this.state.decimal) / 10
        : Number(this.state.decimal) / 100
      : 0;
    const subPrice = price
      ? price
      : this.state.price
      ? Number(this.state.price)
      : 0;
    console.log(subPrice, decimalPrice);
    this.setState({ actualPrice: Number(subPrice) + Number(decimalPrice) });
  };

  handleInputChange = e => {
    if (e.target.id === "bookInfo-decimal") {
      this.setState({
        decimal: e.target.value
      });
      this.setActualPrice(null, e.target.value);
    } else this.setState({ [e.target.id]: e.target.value });
    if (e.target.id === "price") this.setActualPrice(e.target.value, null);
    if (this.state.errorMessage) this.setState({ errorMessage: null });
  };

  handleImageDelete = () => {
    console.log("deliting");
    this.setState({ imgUrl: "", submitting: true, imageDone: false });
  };

  handleImageChange = e => {
    // show image
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function(event) {
        this.setState({
          imgUrl: event.target.result,
          submitting: false,
          loading: false
        });
      }.bind(this);
      reader.readAsDataURL(e.target.files[0]);
    }
    // post and save
    const formData = new FormData();
    this.setState({ loading: true });
    formData.append("image", e.target.files[0]);
    fetch("/api/book/image", {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: formData
    })
      .then(res => res.json())
      .then(jsonRes => {
        if (jsonRes.code === 1) {
          // error
          this.props.toggleDisplay();
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "BookInfo/handleChange/code1", jsonRes }
          });
          this.props.history.push("/error");
        } else {
          // perfect
          this.setState({
            imgUrl: jsonRes.imageURL,
            imageDone: true
          });
        }
      })
      .catch(error => {
        // error
        this.props.dispatch({
          type: "E-SET",
          error: { frontendPlace: "BookInfo/handleChange/catch", error }
        });
        this.props.history.push("/error");
      });
  };

  handleSelectFocus = () => {
    this.setState({ selectHeaderClass: null });
  };

  handleBlur = e => {
    if (e.target.id === "quality") {
      this.setState({ selectHeaderClass: "hiddenVisibility" });
    }
    if (e.target.id === "bookInfo-decimal" && e.target.value) {
      this.setState({
        actualPrice:
          Number(this.state.actualPrice) + Number(e.target.value) / 100
      });
    }
  };

  handleToggle = () => {
    this.setState(initialState);
    this.props.toggleDisplay();
  };

  handleSubmit = e => {
    e.preventDefault();
    if (!this.state.title || !this.state.quality || !this.state.price) {
      this.setState({ errorMessage: "Compila tutti i campi" });
    } else if (
      this.state.price <= 0 ||
      this.state.decimal.length > 2 ||
      Number(this.state.decimal < 0)
    ) {
      this.setState({ errorMessage: "Inserisci un importo valido" });
    } else {
      // everything inputted
      const user = this.props.user;
      const body = {
        imageURL:
          this.state.imgUrl ||
          "https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1599842783484",
        title: this.state.title,
        quality: this.state.quality,
        price: this.state.decimal
          ? this.state.decimal.length === 1
            ? Number(this.state.price) + Number(this.state.decimal) / 10
            : Number(this.state.price) + Number(this.state.decimal) / 100
          : this.state.price,
        sellerId: user._id
        // missing place
      };
      if (
        user.DeliveryInfo.timeToMeet &&
        user.phone &&
        user.school &&
        user.place.city &&
        user.payOut.type
      ) {
        // already inputted info
        // post request
        this.setState({ generalLoading: true });
        fetch("/api/book/insert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({ ...body, place: user.place })
        })
          .then(res => res.json())
          .then(jsonRes => {
            console.log(jsonRes);
            if (jsonRes.code === 1) {
              // error
              this.props.dispatch({
                type: "E-SET",
                error: { frontendPlace: "BookInfo/handleSubmit/code1", jsonRes }
              });
              this.props.history.push("/error");
            } else {
              // perfect
              // show for a bit "successful", then hide it
              sessionStorage.removeItem("selling");
              this.setState({ generalLoading: false, successful: true });
              setTimeout(() => {
                this.setState(initialState);
                this.props.toggleDisplay();
              }, 1000);
            }
          })
          .catch(error => {
            // store and redirect
            this.props.dispatch({
              type: "E-SET",
              error: { frontendPlace: "BookInfo/handleSubmit/catch", error }
            });
            this.props.history.push("/error");
          });
      } else {
        // something not inputted yet
        sessionStorage.removeItem("selling");
        sessionStorage.setItem("BookInfoParams", JSON.stringify(body));
        this.setState({
          imgUrl: "",
          emptyImageClass: null,
          headerClass: null,
          imageClass: "normal",
          submitting: true,
          loading: false,
          selectHeaderClass: "hidden",
          titleClass: null,
          priceClass: null,
          title: null,
          quality: "intatto",
          price: null,
          generalLoading: false,
          successful: false,
          updated: false
        });
        this.props.toggleDisplay();
        this.props.history.push("/infoReviewSell");
      }
    }
  };

  handleEdit = e => {
    e.preventDefault();

    if (
      (this.state.price && this.state.price <= 0) ||
      this.state.decimal.length > 2 ||
      Number(this.state.decimal < 0)
    ) {
      this.setState({ errorMessage: "Inserisci un importo valido" });
    } else {
      // everything inputted
      const body = {
        _id: this.props.book.id,
        newInfo: {
          imageURL:
            this.state.imgUrl ||
            "https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1599842783484",
          title: this.state.title,
          quality: this.state.quality,
          price: this.state.decimal
            ? this.state.decimal.length === 1
              ? Number(this.state.price) + Number(this.state.decimal) / 10
              : Number(this.state.price) + Number(this.state.decimal) / 100
            : this.state.price
        }
      };
      // post request
      this.setState({ generalLoading: true });
      fetch("/api/book/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then(jsonRes => {
          if (jsonRes.code === 1 || jsonRes.code === 1.5) {
            // error
            this.props.dispatch({
              type: "E-SET",
              error: { frontendPlace: "BookInfo/handleEdit/code1", jsonRes }
            });
            this.props.history.push("/error");
          } else {
            // perfect
            // show for a bit "successful", then hide it
            this.setState({ generalLoading: false, successful: true });
            setTimeout(() => {
              this.setState(initialState);
              this.props.toggleDisplay();
            }, 1000);
          }
        })
        .catch(error => {
          // store and redirect
          this.props.dispatch({
            type: "E-SET",
            error: { frontendPlace: "BookInfo/handleEdit/catch", error }
          });
          this.props.history.push("/error");
        });
    }
  };

  render() {
    const notSubmitted = (
      <div className="ig-container">
        <div
          id="notSubmitted"
          className={`image-container ${this.state.emptyImageClass}`}
        >
          <label id="label" htmlFor="image-input">
            <i id="label-icon" className="fas fa-camera fa-4x"></i>
          </label>
          <input
            type="file"
            accept="image/*"
            id="image-input"
            name="image"
            onChange={this.handleImageChange}
            className="hidden"
          />
        </div>
        <p id="image-header" className={this.state.headerClass}>
          Una foto chiara della vera copertina vende 7 volte di più.
        </p>
      </div>
    );

    const submitted = (
      <div className="ig-container">
        <div id="submitted" className="image-container">
          <img
            // onMouseOver={this.handleMouseOver}
            // onMouseLeave={this.handleMouseLeave}
            id="image"
            src={this.state.imgUrl}
            alt="copertina"
            className={this.state.imageClass}
          />
          <i
            id="delete"
            onClick={this.handleImageDelete}
            className="fas fa-times"
          ></i>
        </div>
        <p id="image-header" className={this.state.headerClass}>
          Una foto chiara della vera copertina vende 7 volte di più.
        </p>
      </div>
    );

    const loading = (
      <div className="image-container">
        <LoadingM />
      </div>
    );

    let imageContainer = this.state.submitting ? notSubmitted : submitted;
    if (this.state.loading) imageContainer = loading;
    const loaded = (
      <div>
        {imageContainer}
        <form
          id="bookInfo-form"
          onSubmit={this.props.book ? this.handleEdit : this.handleSubmit}
        >
          <div id="form-container">
            <p id="error-message">{this.state.errorMessage}</p>

            <input
              autoComplete="off"
              id="title"
              type="text"
              onChange={this.handleInputChange}
              className="input info"
              placeholder="titolo, come appare sulla copertina"
              defaultValue={this.props.book ? this.props.book.title : null}
            />
            <div id="quality-container" className="info">
              <p id="quality-warning" className={this.state.selectHeaderClass}>
                sii sincero per quadagnare stelle
              </p>
              <select
                id="quality"
                className="input"
                onFocus={this.handleSelectFocus}
                onChange={this.handleInputChange}
                onBlur={this.handleBlur}
                value={
                  this.props.book ? this.props.book.quality : this.state.quality
                }
              >
                <option disabled={true} value="title">
                  qualità
                </option>
                <option value="intatto">intatto</option>
                <option value="buono, senza scritte">
                  buono, senza scritte
                </option>
                <option value="buono, sottolineato">buono, sottolineato</option>
                <option value="buono, evidenziato">buono, evidenziato</option>
                <option value="normale, senza scritte">
                  normale, senza scritte
                </option>
                <option value="normale, sottolineato">
                  normale, sottolineato
                </option>
                <option value="normale, evidenziato">
                  normale, evidenziato
                </option>
                <option value="rovinato, senza scritte">
                  rovinato, senza scritte
                </option>
                <option value="rovinato, sottolineato">
                  rovinato, sottolineato
                </option>
                <option value="rovinato, evidenziato">
                  rovinato, evidenziato
                </option>
                <option value="molto rovinato">molto rovinato</option>
                <option value="fotocopiato">fotocopiato</option>
              </select>
            </div>
            <div id="bookInfo-priceInput-container">
              <span id="priceInfo-euro">€</span>
              <input
                autoComplete="off"
                id="price"
                type="number"
                onChange={this.handleInputChange}
                onBlur={this.handleBlur}
                className="input info price-input"
                placeholder="prezzo"
                defaultValue={
                  this.props.book
                    ? String(this.props.book.price).split(".")[0]
                    : null
                }
              />
              ,
              <input
                type="number"
                className="price-input"
                id="bookInfo-decimal"
                placeholder="00"
                value={
                  this.props.book
                    ? String(this.props.book.price).split(".")[1]
                      ? String(this.props.book.price).split(".")[1]
                      : this.state.decimal
                    : this.state.decimal
                }
                onChange={this.handleInputChange}
                onBlur={this.handleBlur}
              />
            </div>
          </div>
          <input type="submit" className="hidden" />
          {this.state.actualPrice ? (
            <p id="bookInfo-price-suggestion" className="actualPrice">
              Per poter crescere, Libridoo chiede il 10%. Incasserai{" "}
              {Math.round(
                (this.state.actualPrice - this.state.actualPrice / 10) * 100
              ) / 100}{" "}
              €
            </p>
          ) : (
            <p id="bookInfo-price-suggestion">
              Vendi a metà del prezzo originale per competere con gli altri
              venditori
            </p>
          )}
          <p
            id="submit"
            className={`info ${
              !this.state.imageDone && this.state.imgUrl ? "disabled" : ""
            }`}
            onClick={
              !this.state.imageDone && this.state.imgUrl
                ? null
                : this.props.book
                ? this.handleEdit
                : this.handleSubmit
            }
          >
            {!this.state.imageDone && this.state.imgUrl
              ? "CARICANDO L'IMMAGINE..."
              : this.props.book
              ? "SALVA"
              : "VENDI"}
          </p>
        </form>
      </div>
    );

    const generalLoading = (
      <div id="bookInfo-generalLoading">
        <LoadingL />
      </div>
    );
    const successful = (
      <div id="successful-container">
        <i className="fas fa-check"></i>
        <h1 className="successful">
          {this.props.book
            ? "Libro modificato con successo"
            : "Libro inserito con successo"}
        </h1>
      </div>
    );

    let bodyComponent = this.state.generalLoading ? generalLoading : loaded;
    if (this.state.successful) bodyComponent = successful;

    const deleteIcon =
      !this.state.generalLoading && !this.state.successful ? (
        <i
          id="general-delete"
          onClick={
            this.props.book
              ? this.handleToggle
              : () => {
                  this.handleImageDelete();
                  this.handleToggle();
                }
          }
          className="fas fa-times"
        ></i>
      ) : null;

    return (
      <div id="bookInfo-gContainer" className={this.props.display}>
        <div
          id="bookInfo"
          className={this.state.generalLoading ? "heigh-set" : ""}
        >
          {bodyComponent}
          {deleteIcon}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { user: state.user };
};

export default connect(mapStateToProps)(withRouter(BookInfo));

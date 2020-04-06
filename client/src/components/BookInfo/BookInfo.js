import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./BookInfo.css";

class BookInfo extends Component {
  state = {
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
  };

  componentDidMount = () => {
    this.setState({ successful: false });
  };

  componentDidUpdate = () => {
    if (!this.state.updated && sessionStorage.getItem("BookInfoParams")) {
      const BookInfo = JSON.parse(sessionStorage.getItem("BookInfoParams"));
      this.setState({
        updated: true,
        imgUrl: BookInfo.imageURL,
        title: BookInfo.title,
        price: BookInfo.price,
        quality: BookInfo.quality,
        submitting: false
      });
    }
  };

  handleMouseOver = () => {
    this.setState({ imageClass: "bigger" });
  };

  handleMouseLeave = () => {
    this.setState({
      imageClass: "normal"
    });
  };

  handleImageDelete = () => {
    this.setState({ imgUrl: "", submitting: true });
  };

  handleImageChange = e => {
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
            submitting: false,
            loading: false
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

  handleInputChange = e => {
    if (e.target.id !== "quality") {
      if (!e.target.value) {
        this.setState({
          [`${e.target.id}Class`]: "invalid-input"
        });
      }
    }
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  handleSelectFocus = () => {
    this.setState({ selectHeaderClass: null });
  };

  handleBlur = e => {
    if (e.target.id === "quality") {
      this.setState({ selectHeaderClass: "hidden" });
    } else if (!e.target.value) {
      this.setState({
        [`${e.target.id}Class`]: "invalid-input"
      });
    } else {
      this.setState({
        [`${e.target.id}Class`]: "correct-input"
      });
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    if (
      !this.state.imgUrl ||
      !this.state.title ||
      !this.state.quality ||
      !this.state.price
    ) {
      alert("Compila tutti i campi obbligatori");
      if (!this.state.imgUrl) {
        this.setState({
          emptyImageClass: "empty",
          headerClass: "empty-header"
        });
      }
      if (!this.state.title) {
        this.setState({ titleClass: "invalid-input" });
      }
      if (!this.state.price) {
        this.setState({ priceClass: "invalid-input" });
      }
    } else {
      // everything inputted
      const user = this.props.user;
      const body = {
        imageURL: this.state.imgUrl,
        title: this.state.title,
        quality: this.state.quality,
        price: this.state.price,
        sellerId: user._id
        // missing place
      };
      if (
        user.DeliveryInfo.timeToMeet &&
        user.phone &&
        user.school &&
        user.place.city
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
              setTimeout(this.props.toggleDisplay, 1000);
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
        this.props.toggleDisplay();
        this.props.history.push("/infoReview/sell");
      }
    }
  };

  render() {
    const notSubmitted = (
      <div id="notSubmitted-container">
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
          I clienti vogliono un'immagine chiara della copertina
        </p>
      </div>
    );

    const submitted = (
      <div id="submitted" className="image-container">
        <img
          onTouchStart={this.handleMouseOver}
          onMouseOver={this.handleMouseOver}
          onTouchEnd={this.handleMouseLeave}
          onMouseLeave={this.handleMouseLeave}
          id="image"
          src={this.state.imgUrl}
          alt="copertina"
          className={this.state.imageClass}
        />
        <p id="delete" onClick={this.handleImageDelete}>
          -
        </p>
      </div>
    );

    const loading = (
      <div className="image-container">
        <h1>loading</h1>
      </div>
    );

    let imageContainer = this.state.submitting ? notSubmitted : submitted;
    if (this.state.loading) imageContainer = loading;

    const loaded = (
      <div>
        <p id="header">
          Compila con chiarezza per vendere con maggior successo
        </p>
        {imageContainer}
        <form onSubmit={this.handleSubmit}>
          <div id="form-container">
            <input
              autoComplete="off"
              id="title"
              type="text"
              onChange={this.handleInputChange}
              onBlur={this.handleBlur}
              className={`input info ${this.state.titleClass}`}
              placeholder="titolo"
              defaultValue={this.state.title}
            />
            <div id="quality-container" className="info">
              <p id="select-header">qualità:</p>
              <select
                id="quality"
                className="input"
                onFocus={this.handleSelectFocus}
                onChange={this.handleInputChange}
                onBlur={this.handleBlur}
                defaultValue={this.state.quality}
              >
                <option value="intatto">intatto</option>
                <option value="ottimo, sottolineato a matita">
                  ottimo, sottolineato a matita
                </option>
                <option value="ottimo, sottolineato a penna/evidenziatore">
                  ottimo, sottolineato a penna
                </option>
                <option value="normale, sottolineato a matita">
                  normale, sottolineato a matita
                </option>
                <option value="ottimo, sottolineato a penna/evidenziatore">
                  normale, sottolineato a penna/evidenziatore
                </option>
                <option value="ottimo, sottolineato a penna/evidenziatore">
                  rovinato, sottolineato a matita
                </option>
                <option value="ottimo, sottolineato a penna/evidenziatore">
                  rovinato, sottolineato a penna/evidenziatore
                </option>
                <option value="distrutto">distrutto</option>
                <option value="fotocopiato">fotocopiato</option>
              </select>
              <p className={this.state.selectHeaderClass}>
                Evita dispute con il cliente, sii sincero!
              </p>
            </div>
            <input
              autoComplete="off"
              id="price"
              type="number"
              onChange={this.handleInputChange}
              onBlur={this.handleBlur}
              className={`input ${this.state.priceClass} info`}
              placeholder="prezzo"
              defaultValue={this.state.price}
            />
          </div>
          <input id="submit" type="submit" value="VENDI" className="info" />
        </form>
      </div>
    );

    const generalLoading = <h1>loading...</h1>;
    const successful = (
      <h1 className="successful">Libro inserito con successo</h1>
      // link to help
    );

    let bodyComponent = this.state.generalLoading ? generalLoading : loaded;
    if (this.state.successful) bodyComponent = successful;

    const deleteIcon =
      !this.state.generalLoading && !this.state.successful ? (
        <span id="general-delete" onClick={this.props.toggleDisplay}>
          -
        </span>
      ) : null;

    return (
      <div id="bookInfo-gContainer" className={this.props.display}>
        <div id="bookInfo">
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

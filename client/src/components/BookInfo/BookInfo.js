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
    updated: false,
    imageDone: false,
    timeOut: null,
    imageDoneSet: false,
    pricePlaceholder: "prezzo",
    titlePlaceholder: "titolo",
    priceLabelHidden: true,
    decimal: "00"
  };

  componentDidMount = () => {
    this.setState({ successful: false });
  };

  componentDidUpdate = () => {
    if (!this.state.price && sessionStorage.getItem("BookInfoParams")) {
      const BookInfo = JSON.parse(sessionStorage.getItem("BookInfoParams"));
      this.setState({
        imgUrl: BookInfo.imageURL,
        title: BookInfo.title,
        price: Number(String(BookInfo.price).split(".")[0]),
        quality: BookInfo.quality,
        submitting: false,
        decimal: String(BookInfo.price).split(".")[1] || "00"
      });
    }
    if (this.props.editing && !this.state.imageDoneSet) {
      // just updated
      this.setState({ imageDoneSet: true, imageDone: true });
    }
  };

  handleDecimalChange = e => {
    this.setState({
      decimal: e.target.value
    });
    if (e.target.value.length <= 2 && !this.state.priceLabelHidden) {
      this.setState({ priceLabelHidden: true });
    }
  };

  handleMouseOver = () => {
    this.setState({
      timeout: setInterval(() => {
        this.setState({ imageClass: "bigger" });
      }, 1500)
    });
  };

  handleMouseLeave = () => {
    clearTimeout(this.state.timeout);
    this.setState({ imageClass: "normal" });
  };

  handleImageDelete = () => {
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

  handleInputChange = e => {
    if (e.target.id !== "quality") {
      if (!e.target.value) {
        this.setState({
          [`${e.target.id}Class`]: "invalid-input",
          [`${e.target.id}Placeholder`]:
            e.target.id === "title" ? "*titolo*" : "*prezzo*"
        });
      }
    }
    if (e.target.value) {
      this.setState({ [`${e.target.id}Class`]: null });
    }
    if (e.target.id === "price" && e.target.value <= 0) {
      this.setState({ [`${e.target.id}Class`]: "invalid-input" });
    }
    this.setState({
      [e.target.id]: e.target.value
    });
    if (
      e.target.id === "price" &&
      e.target.value > 0 &&
      !this.state.priceLabelHidden
    ) {
      this.setState({ priceLabelHidden: true });
    }
  };

  handleSelectFocus = () => {
    this.setState({ selectHeaderClass: null });
  };

  handleBlur = e => {
    if (e.target.id === "quality") {
      this.setState({ selectHeaderClass: "hidden" });
    } else if (!e.target.value) {
      this.setState({
        [`${e.target.id}Class`]: "invalid-input",
        [e.target.id]: null,
        [`${e.target.id}Placeholder`]:
          e.target.id === "title" ? "*titolo*" : "*prezzo*"
      });
    } else {
      this.setState({
        [`${e.target.id}Class`]: "correct-input"
      });
    }
    if (e.target.id === "price" && e.target.value && e.target.value <= 0) {
      this.setState({ priceClass: "invalid-input" });
    }
  };

  handleToggle = () => {
    this.setState({
      imgUrl: "",
      title: null,
      price: null,
      quality: "intatto"
    });
    this.props.toggleDisplay();
  };

  handleSubmit = e => {
    e.preventDefault();
    if (
      !this.state.imgUrl ||
      !this.state.title ||
      !this.state.quality ||
      !this.state.price
    ) {
      if (!this.state.imgUrl) {
        this.setState({
          emptyImageClass: "empty",
          headerClass: "empty-header"
        });
      }
      if (!this.state.title) {
        this.setState({
          titleClass: "invalid-input",
          titlePlaceholder: "*titolo*"
        });
      }
      if (!this.state.price) {
        this.setState({
          priceClass: "invalid-input",
          pricePlaceholder: "*prezzo*"
        });
      }
    } else if (this.state.price <= 0) {
      this.setState({ priceClass: "invalid-input", priceLabelHidden: false });
    } else if (this.state.decimal.length > 2) {
      this.setState({ priceLabelHidden: false });
    } else {
      // everything inputted
      const user = this.props.user;
      const body = {
        imageURL: this.state.imgUrl,
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
              setTimeout(() => {
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
        this.props.history.push("/infoReview/sell");
      }
    }
  };

  handleEdit = e => {
    e.preventDefault();
    if (
      !this.state.imgUrl ||
      !this.state.title ||
      !this.state.quality ||
      !this.state.price
    ) {
      if (!this.state.imgUrl) {
        this.setState({
          emptyImageClass: "empty",
          headerClass: "empty-header"
        });
      }
      if (!this.state.title) {
        this.setState({
          titleClass: "invalid-input",
          titlePlaceholder: "*titolo*"
        });
      }
      if (!this.state.price) {
        this.setState({
          priceClass: "invalid-input",
          pricePlaceholder: "*prezzo*"
        });
      }
    } else if (this.state.price <= 0) {
      this.setState({ priceClass: "invalid-input", priceLabelHidden: false });
    } else if (this.state.decimal.length > 2) {
      this.setState({ priceLabelHidden: false });
    } else {
      // everything inputted
      const body = {
        _id: this.props.id,
        newInfo: {
          imageURL: this.state.imgUrl,
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

    let imageContainer = this.state.submitting ? notSubmitted : submitted;
    if (this.state.loading) imageContainer = loading;

    const loaded = (
      <div>
        {/* <p id="header">
          Compila con chiarezza per vendere con maggior successo
        </p> */}
        {imageContainer}
        <form
          onSubmit={this.props.editing ? this.handleEdit : this.handleSubmit}
        >
          <div id="form-container">
            <input
              autoComplete="off"
              id="title"
              type="text"
              onChange={this.handleInputChange}
              onBlur={this.handleBlur}
              className={`input info ${this.state.titleClass}`}
              placeholder={this.state.titlePlaceholder}
              defaultValue={this.props.editing ? this.state.title : null}
            />
            <div id="quality-container" className="info">
              <p id="select-header">qualità:</p>
              <select
                id="quality"
                className="input"
                onFocus={this.handleSelectFocus}
                onChange={this.handleInputChange}
                onBlur={this.handleBlur}
                defaultValue={
                  this.props.editing ? this.state.quality : "intatto"
                }
              >
                <option value="intatto">intatto</option>
                <option value="buono, non sottolineato">
                  buono, non sottolineato
                </option>
                <option value="buono, sottolineato a matita">
                  buono, sottolineato a matita
                </option>
                <option value="buono, sottolineato a penna">
                  buono, sottolineato a penna
                </option>
                <option value="usato, non sottolineato">
                  usato, non sottolineato
                </option>
                <option value="usato, sottolineato a matita">
                  usato, sottolineato a matita
                </option>
                <option value="usato, sottolineato a penna">
                  usato, sottolineato a penna
                </option>
                <option value="distrutto">distrutto</option>
                <option value="fotocopiato">fotocopiato</option>
              </select>
              <p className={this.state.selectHeaderClass}>
                Evita dispute con il cliente, sii sincero!
              </p>
            </div>
            <div id="bookInfo-priceInput-container">
              €
              <input
                autoComplete="off"
                id="price"
                type="number"
                onChange={this.handleInputChange}
                onBlur={this.handleBlur}
                className={`input ${this.state.priceClass} info price-input`}
                placeholder={this.state.pricePlaceholder}
                defaultValue={this.props.editing ? this.state.price : null}
              />
              ,
              <input
                type="number"
                className="price-input"
                id="bookInfo-decimal"
                value={this.state.decimal}
                placeholder="00"
                onChange={this.handleDecimalChange}
              />
            </div>
            <label
              id="bookInfo-price-label"
              htmlFor="price"
              className={this.state.priceLabelHidden ? "hidden" : ""}
            >
              Inserisci un importo valido
            </label>
          </div>
          <input
            type="submit"
            className="hidden"
            value={
              !this.state.imageDone && this.state.imgUrl
                ? "CARICANDO L'IMMAGINE..."
                : this.props.editing
                ? "SALVA"
                : "VENDI"
            }
            disabled={!this.state.imageDone && this.state.imgUrl ? true : false}
          />
          <p id="bookInfo-price-suggestion">
            Vendi a metà del prezzo originale per competere con gli altri
            venditori
          </p>
          <p
            id="submit"
            className={`info ${
              !this.state.imageDone && this.state.imgUrl ? "disabled" : ""
            }`}
            onClick={
              !this.state.imageDone && this.state.imgUrl
                ? null
                : this.props.editing
                ? this.handleEdit
                : this.handleSubmit
            }
          >
            {!this.state.imageDone && this.state.imgUrl
              ? "CARICANDO L'IMMAGINE..."
              : this.props.editing
              ? "SALVA"
              : "VENDI"}
          </p>
        </form>
      </div>
    );

    const generalLoading = (
      <div id="bookInfo-generalLoading">
        <div className="loadingio-spinner-fidget-spinner-udtray956qm">
          <div className="ldio-sqv79tocehf">
            <div>
              <div>
                <div
                  style={{ left: "87.435px", top: "14.354999999999999px" }}
                ></div>
                <div
                  style={{
                    left: "24.794999999999998px",
                    top: "122.66999999999999px"
                  }}
                ></div>
                <div
                  style={{ left: "150.075px", top: "122.66999999999999px" }}
                ></div>
              </div>
              <div>
                <div style={{ left: "113.535px", top: "40.455px" }}></div>
                <div
                  style={{
                    left: "50.894999999999996px",
                    top: "148.76999999999998px"
                  }}
                ></div>
                <div
                  style={{
                    left: "176.17499999999998px",
                    top: "148.76999999999998px"
                  }}
                ></div>
              </div>
              <div style={{ left: "87.435px", top: "87.435px" }}></div>
              <div>
                <div
                  style={{
                    left: "97.875px",
                    top: "78.3px",
                    transform: "rotate(-20deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "150.075px",
                    top: "78.3px",
                    transform: "rotate(20deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "75.69px",
                    top: "117.44999999999999px",
                    transform: "rotate(80deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "101.78999999999999px",
                    top: "160.515px",
                    transform: "rotate(40deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "172.26px",
                    top: "117.44999999999999px",
                    transform: "rotate(100deg)"
                  }}
                ></div>
                <div
                  style={{
                    left: "146.16px",
                    top: "160.515px",
                    transform: "rotate(140deg)"
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    const successful = (
      <h1 className="successful">
        {this.props.editing
          ? "Libro modificato con successo"
          : "Libro inserito con successo"}
      </h1>
      // link to help
    );

    let bodyComponent = this.state.generalLoading ? generalLoading : loaded;
    if (this.state.successful) bodyComponent = successful;

    const deleteIcon =
      !this.state.generalLoading && !this.state.successful ? (
        <span
          id="general-delete"
          onClick={
            this.props.editing
              ? this.handleToggle
              : () => {
                  this.handleImageDelete();
                  this.props.toggleDisplay();
                }
          }
        >
          -
        </span>
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

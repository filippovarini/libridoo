import React, { Component } from "react";
import { connect } from "react-redux";
import "./Results.css";

// components
import Book from "../../components/book/book";
import LoadingM from "../../components/Loading/loading_m";

// modules
import AL1 from "./AL1";

class Results extends Component {
  state = {
    loading: false,
    index: 0,
    ready: false,
    updated: false,
    city: this.props.user.place
      ? this.props.user.place.city || "__disabled"
      : "__disabled",
    school: this.props.user.school
      ? this.props.user.school === "Non frequento un'università"
        ? "__disabled"
        : ""
      : "__disabled",
    quality: "__disabled",
    order: "1",
    filterHidden: true,
    indexFilterUpdated: null
  };

  toggleFilter = () => {
    this.setState({
      filterHidden: !this.state.filterHidden
    });
  };

  componentDidMount = () => {
    // sort them and set in state
    if (!sessionStorage.getItem("searchParams")) {
      this.props.history.push("/search");
    }
    // const sellerUser = this.props.selectedBooks.map(
    //   cluster => cluster.sellerId
    // );
    // console.log(sellerUser);
    // USELESS BASED ON BOUGHT BECAUSE DON't HAVE SELLER USER ON MOUNTING
    const sortedResult = AL1(this.props.booksResult);
    this.props.dispatch({ type: "R-SET", results: sortedResult });
    this.setState({
      loading: false
    });
  };

  componentDidUpdate = () => {
    if (this.state.ready && !this.state.updated) {
      if (this.props.booksResult.length === 0) {
        // no books stored
        if (
          sessionStorage.getItem("searchParams") &&
          JSON.parse(sessionStorage.getItem("searchParams")).length !== 0
        ) {
          // something searched, but lost because of refresh
          const body = {
            searchParams: JSON.parse(sessionStorage.getItem("searchParams"))
          };
          this.setState({ loading: true });
          fetch("/api/book/generalFetch/UI", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify(body)
          })
            .then(res => res.json())
            .then(jsonRes => {
              if (jsonRes.code === 0) {
                const index = sessionStorage.getItem("index")
                  ? Number(sessionStorage.getItem("index"))
                  : 0;
                // includes results with 2.5, but at least correct
                jsonRes.results.forEach(result => {
                  delete result.index;
                });
                const sortedResult = AL1(jsonRes.results);
                this.props.dispatch({ type: "R-SET", results: sortedResult });
                this.setState({
                  loading: false,
                  index,
                  city:
                    JSON.parse(sessionStorage.getItem("searchParams"))[index]
                      .city || "__disabled",
                  school: JSON.parse(sessionStorage.getItem("searchParams"))[
                    index
                  ].school
                    ? JSON.parse(sessionStorage.getItem("searchParams"))[index]
                        .school === "Non frequento un'università"
                      ? "__disabled"
                      : JSON.parse(sessionStorage.getItem("searchParams"))[
                          index
                        ].school
                    : "__disabled",
                  quality:
                    JSON.parse(sessionStorage.getItem("searchParams"))[index]
                      .quality || "__disabled"
                });
              } else {
                // code 1, code 1.5 ...
                this.props.dispatch({
                  type: "E-SET",
                  error: {
                    frontendPlace: "Results/componentDidUpdate/code1",
                    jsonRes
                  }
                });
                sessionStorage.removeItem("searchParams");
                this.props.history.push("/error");
              }
            })
            .catch(() => {
              this.props.dispatch({
                type: "E-SET",
                error: { frontendPlace: "Results/componentDidUpdate/catch" }
              });
              sessionStorage.removeItem("searchParams");
              this.props.history.push("/error");
            });
        }
      }
      this.setState({ updated: true });
    } else if (!this.state.ready) {
      this.setState({ ready: true });
    }
  };

  handleReviewSearch = () => {
    // !!! check result index gets authomatically deleted
    // remove results, search params
    sessionStorage.removeItem("searchParams");
    this.props.dispatch({ type: "R-DELETE-ALL" });
    this.props.history.push("/search");
  };

  increaseIndex = action => {
    sessionStorage.setItem("index", this.state.index + 1);
    // reset original configuration
    this.setState({
      index: this.state.index + 1,
      city: this.props.user.place
        ? this.props.user.place.city || "__disabled"
        : "__disabled",
      school: this.props.user.school
        ? this.props.user.school === "Non frequento un'università"
          ? "__disabled"
          : ""
        : "__disabled",
      quality: "__disabled"
    });
    // }
    if (this.state.index + 1 === this.props.booksResult.length) {
      this.props.history.push("/checkoutReview");
    }
    if (action === "bought") {
      const sellerUser = this.props.selectedBooks.map(
        cluster => cluster.sellerId
      );
      const sortedResult = AL1(this.props.booksResult, sellerUser);
      this.props.dispatch({ type: "R-SET", results: sortedResult });
    }
  };

  decreaseIndex = () => {
    sessionStorage.setItem("index", this.state.index - 1);
    this.setState({
      index: this.state.index - 1,
      city: this.props.user.place
        ? this.props.user.place.city || "__disabled"
        : "__disabled",
      school: this.props.user.school
        ? this.props.user.school === "Non frequento un'università"
          ? "__disabled"
          : ""
        : "__disabled",
      quality: "__disabled"
    });
  };

  handleFilterChange = e => {
    if (e.target.id === "filter-quality") {
      this.setState({
        quality: e.target.value
      });
    } else {
      this.setState({
        [e.target.id]: e.target.value
      });
    }
  };

  handleFilterEdit = filter => {
    this.setState({
      [filter]: ""
    });
  };

  handleFilterDisable = filter => {
    this.setState({
      [filter]: "__disabled"
    });
  };

  handleFilterSubmit = e => {
    e.preventDefault();
    // !!!CHECK IF RIGHT
    const searchParams = JSON.parse(sessionStorage.getItem("searchParams"))[
      this.state.index
    ];
    // good even if state empty
    searchParams.city = this.state.city || searchParams.city;
    searchParams.school = this.state.school || searchParams.school;
    searchParams.quality = this.state.quality || searchParams.quality;
    if (this.state.city === "__disabled") searchParams.city = null;
    if (this.state.school === "__disabled") searchParams.school = null;
    if (this.state.quality === "__disabled") searchParams.quality = null;
    // body
    const body = { searchParams };
    this.setState({ loading: true });
    fetch("/api/book/fetch/buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(jsonRes => {
        if (jsonRes.code === 0 || jsonRes.code === 2.5) {
          // correct
          // update searchParams
          let paramsArray =
            JSON.parse(sessionStorage.getItem("searchParams")) || [];
          paramsArray[this.state.index] = searchParams;
          sessionStorage.setItem("searchParams", JSON.stringify(paramsArray));
          // update resultReducer
          let resultsArray = this.props.booksResult;
          resultsArray[this.state.index] = {
            searchParams,
            filterResult: jsonRes.results.filterResult || [],
            wrongCode: jsonRes.code === 2.5 ? 2.5 : null,
            message: jsonRes.code === 2.5 ? jsonRes.message : null
          };
          // sort them
          const sortedResult = AL1(resultsArray);
          // store sorted in redux
          this.props.dispatch({ type: "R-SET", results: sortedResult });
          this.setState({
            loading: false,
            city: jsonRes.results.searchParams.city || "__disabled",
            school: jsonRes.results.searchParams.school
              ? jsonRes.results.searchParams.school ===
                "Non frequento un'università"
                ? "__disabled"
                : jsonRes.results.searchParams.school
              : "__disabled",
            quality: jsonRes.results.searchParams.quality || "__disabled",
            filterHidden: true
          });
        } else {
          // error:
          // 2 (shouldn't be a 2 ui already stored in session)
          // 1.5, 1
          sessionStorage.removeItem("searchParams");
          this.props.dispatch({
            type: "E-SET",
            error: {
              frontendPlace: "Results/handleFilterSubmit/code1",
              jsonRes
            }
          });
          this.props.history.push("/error");
        }
      })
      .catch(error => {
        // store and redirect
        console.log(error);
        sessionStorage.removeItem("searchParams");
        this.props.dispatch({
          type: "E-SET",
          error: { frontendPlace: "Results/handleFilterSubmit/catch" }
        });
        this.props.history.push("/error");
      });
  };

  handleOrderChange = e => {
    let booksResult = this.props.booksResult;
    if (e.target.value === "1") {
      // store sorted in redux
      booksResult.forEach(resultObj => {
        //   !!! DOES MAP AFFECT IT?
        resultObj.filterResult.sort((a, b) =>
          // a.userSellsCount < b.userSellsCount ? 1 : -1
          a.userSellsCount < b.userSellsCount
            ? 1
            : a.userSellsCount === b.userSellsCount
            ? Number(a.price) <= Number(b.price)
              ? -1
              : 1
            : -1
        );
      });
    } else if (e.target.value === "2") {
      booksResult.forEach(resultObj => {
        //   !!! DOES MAP AFFECT IT?
        resultObj.filterResult.sort((a, b) =>
          // a.userSellsCount < b.userSellsCount ? 1 : -1
          a.price < b.price ? 1 : -1
        );
      });
    } else if (e.target.value === "3") {
      booksResult.forEach(resultObj => {
        //   !!! DOES MAP AFFECT IT?
        resultObj.filterResult.sort((a, b) =>
          // a.userSellsCount < b.userSellsCount ? 1 : -1
          a.price < b.price ? -1 : 1
        );
      });
    }
    this.props.dispatch({ type: "R-SET", results: booksResult });
    this.setState({
      index: this.state.index,
      order: e.target.value
    });
  };

  render() {
    const uiList = sessionStorage.getItem("searchParams")
      ? JSON.parse(sessionStorage.getItem("searchParams")).map(
          param => param.ui
        )
      : [];

    let booksComponent,
      wrongFilters,
      resultsBody,
      loading,
      bodyComponent,
      filterSubmitClass,
      filters = null,
      maxUserSellsCount,
      set = false;

    if (this.props.booksResult[this.state.index]) {
      if (this.props.booksResult[this.state.index].wrongCode === 2.5) {
        maxUserSellsCount = null;

        set = true;
      }
    }

    if (!set) {
      maxUserSellsCount = this.props.booksResult[this.state.index]
        ? this.props.booksResult[this.state.index].filterResult[0]
            .userSellsCount
        : null;
    }

    if (this.state.index !== uiList.length) {
      booksComponent =
        this.props.booksResult.length !== 0
          ? this.props.booksResult[this.state.index].filterResult.map(book => {
              return (
                <Book
                  book={book}
                  key={book._id}
                  indexIncrease={this.increaseIndex}
                  page="results"
                  maxUserSellsCount={maxUserSellsCount}
                />
              );
            })
          : null;

      wrongFilters =
        this.props.booksResult.length !== 0 ? (
          <div id="wrongFilters">
            <p id="header">
              {this.props.booksResult[this.state.index].message}, cambia i
              filtri per trovare i libri
            </p>
          </div>
        ) : null;
      resultsBody = booksComponent;
      if (this.props.booksResult.length !== 0) {
        if (this.props.booksResult[this.state.index].wrongCode)
          resultsBody = wrongFilters;
      }
      loading = (
        <div id="results-loading">
          <LoadingM />
        </div>
      );

      bodyComponent = this.state.loading ? loading : resultsBody;

      filterSubmitClass =
        !this.state.city && !this.state.school && !this.state.quality
          ? "hidden"
          : null;

      filters =
        this.props.booksResult.length !== 0 ? (
          <div id="filter-general-container">
            <form id="filters" onSubmit={this.handleFilterSubmit}>
              {/* <p id="header">FILTRI</p> */}
              <div className="input-container" id="inputs-container">
                <div className="input-container text">
                  {this.state.city === "__disabled" ? (
                    <i
                      id="cityAdd"
                      onClick={() => {
                        this.handleFilterEdit("city");
                      }}
                      className="input-filter-icon edit filter-fa fas fa-plus-circle"
                    ></i>
                  ) : (
                    <i
                      id="cityDelete"
                      className="input-filter-icon delete fas filter-fa fa-minus-circle"
                      onClick={() => {
                        this.handleFilterDisable("city");
                      }}
                    ></i>
                  )}
                  <input
                    autoComplete="off"
                    type="text"
                    className={`filter input ${
                      this.state.city !== "__disabled" ? "active" : null
                    }`}
                    id="city"
                    placeholder={
                      this.props.booksResult[this.state.index]
                        ? this.props.booksResult[this.state.index].searchParams
                            .city || "città"
                        : "città"
                    }
                    disabled={this.state.city === "__disabled" ? true : false}
                    onChange={this.handleFilterChange}
                    value={
                      this.state.city === "__disabled"
                        ? "città"
                        : this.state.city
                    }
                  />
                </div>
                <div className="input-container text">
                  {this.state.school === "__disabled" ? (
                    <i
                      id="schoolDelete"
                      onClick={() => {
                        this.handleFilterEdit("school");
                      }}
                      className="input-filter-icon edit filter-fa fas fa-plus-circle"
                    ></i>
                  ) : (
                    <i
                      id="schoolDelete"
                      className="input-filter-icon delete fas filter-fa fa-minus-circle"
                      onClick={() => {
                        this.handleFilterDisable("school");
                      }}
                    ></i>
                  )}
                  <input
                    disabled={this.state.school === "__disabled" ? true : false}
                    autoComplete="off"
                    // type="text"
                    className={`filter input ${
                      this.state.school !== "__disabled" ? "active" : null
                    }`}
                    id="school"
                    onChange={this.handleFilterChange}
                    placeholder={
                      this.props.booksResult[this.state.index]
                        ? this.props.booksResult[this.state.index].searchParams
                            .school
                        : "università"
                    }
                    list="universities"
                    value={
                      this.state.school === "__disabled"
                        ? "scuola/università"
                        : this.state.school
                    }
                  />
                  <datalist id="universities">
                    <option value="Università degli Studi di Verona" />
                    <option value="Università degli Studi di Padova" />
                    <option value="Università Ca Foscari di Venezia" />
                    <option value="Università Iuav di Venezia" />
                    <option value="Università della Valle d'Aosta" />
                    <option value="Università per Stranieri di Perugia" />
                    <option value="Università degli Studi di Perugia" />
                    <option value="Università degli Studi di Trento" />
                    <option value="Libera Università di Bolzano" />
                    <option value="Università per Stranieri di Siena" />
                    <option value="Università degli Studi di Siena" />
                    <option value="Università degli Studi di Pisa" />
                    <option value="Università degli Studi di Firenze" />
                    <option value="Scuola Superiore di Studi Sant'Anna - Pisa" />
                    <option value="Scuola Normale Superiore - Pisa" />
                    <option value="Università degli Studi di Palermo" />
                    <option value="Università degli Studi di Messina" />
                    <option value="Università degli Studi di Catania" />
                    <option value="Università degli Studi di Sassari" />
                    <option value="Università degli Studi di Cagliari" />
                    <option value="Università degli Studi del Salento" />
                    <option value="Università degli Studi di Foggia" />
                    <option value="Università degli Studi di Bari" />
                    <option value="Politecnico di Bari" />
                    <option value="LUM - Libera Università Mediterranea Jean Monnet" />
                    <option value="Università di Scienze Gastronomiche" />
                    <option value="Università degli Studi di Torino" />
                    <option value="Università degli Studi del Piemonte Orientale" />
                    <option value="Politecnico di Torino" />
                    <option value="Università degli Studi del Molise" />
                    <option value="Università degli Studi di Urbino Carlo Bo" />
                    <option value="Università degli Studi di Macerata" />
                    <option value="Università degli Studi di Camerino" />
                    <option value="Università Politecnica delle Marche" />
                    <option value="Università Vita-Salute San Raffaele" />
                    <option value="Università degli Studi di Pavia" />
                    <option value="Università degli Studi di Milano-Bicocca" />
                    <option value="Università degli Studi di Milano" />
                    <option value="Università degli Studi di Brescia" />
                    <option value="Università degli Studi di Bergamo" />
                    <option value="Università degli Studi dell'Insubria Varese-Como" />
                    <option value="Università Commerciale Luigi Bocconi" />
                    <option value="Università Cattolica del Sacro Cuore" />
                    <option value="Università Carlo Cattaneo - LIUC" />
                    <option value="Politecnico di Milano" />
                    <option value="IULM - Libera Università di Lingue e Comunicazione" />
                    <option value="Università degli Studi di Genova" />
                    <option value="Università degli Studi Roma Tre" />
                    <option value="Università degli Studi Europea di Roma" />
                    <option value="Università degli Studi di Roma Tor Vergata" />
                    <option value="Università degli Studi di Roma La Sapienza" />
                    <option value="Università degli Studi di Cassino" />
                    <option value="Università degli Studi della Tuscia" />
                    <option value="Università Campus Bio-Medico di Roma" />
                    <option value="LUMSA - Libera Università Maria Ss. Assunta" />
                    <option value="LUISS - Guido Carli" />
                    <option value="Libera Università degli Studi San Pio V" />
                    <option value="IUSM - Università degli Studi di Roma Foro Italico" />
                    <option value="Università degli Studi di Udine" />
                    <option value="Università degli Studi di Trieste" />
                    <option value="SISSA - Scuola Internazionale Superiore di Studi Avanzati" />
                    <option value="Università degli Studi di Parma" />
                    <option value="Università degli Studi di Modena e Reggio Emilia" />
                    <option value="Università degli Studi di Ferrara" />
                    <option value="Università degli Studi di Bologna" />
                    <option value="Università degli Studi di Salerno" />
                    <option value="Università degli Studi di Napoli Partenophe" />
                    <option value="Università degli Studi di Napoli L'Orientale" />
                    <option value="Università degli Studi di Napoli Federico II" />
                    <option value="Università degli Studi del Sannio" />
                    <option value="Seconda Università degli Studi di Napoli" />
                    <option value="Istituto Universitario Suor Orsola Benincasa" />
                    <option value="Università della Calabria" />
                    <option value="Università degli Studi Mediterranea di Reggio Calabria" />
                    <option value="Università degli Studi Magna Graecia di Catanzaro" />
                    <option value="Università degli Studi della Basilicata" />
                    <option value="Università degli Studi di Teramo" />
                    <option value="Università degli Studi di L'Aquila" />
                    <option value="Università degli Studi Gabriele D'Annunzio" />
                  </datalist>
                </div>
                <div id="qualityDelete" className="input-container select">
                  {this.state.quality === "__disabled" ? (
                    <i
                      id="qualityAdd"
                      onClick={() => {
                        this.handleFilterEdit("quality");
                      }}
                      className="input-filter-icon edit filter-fa fas fa-plus-circle"
                    ></i>
                  ) : (
                    <i
                      id="qualityDelete"
                      className="input-filter-icon delete fas filter-fa fa-minus-circle"
                      onClick={() => {
                        this.handleFilterDisable("quality");
                      }}
                    ></i>
                  )}
                  <select
                    id="filter-quality"
                    className="filter input"
                    disabled={
                      this.state.quality === "__disabled" ? true : false
                    }
                    onChange={this.handleFilterChange}
                    value={
                      this.state.quality === "__disabled"
                        ? "quality"
                        : this.state.quality ||
                          this.props.booksResult[this.state.index].searchParams
                            .quality ||
                          "quality"
                    }
                  >
                    <option value="quality" defaultChecked hidden>
                      qualità
                    </option>
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
                    <option value="normale, non sottolineato">
                      normale, non sottolineato
                    </option>
                    <option value=" normale, sottolineato a matita">
                      normale, sottolineato a matita
                    </option>
                    <option value="normale, sottolineato a penna">
                      normale, sottolineato a penna
                    </option>
                    <option value="rovinato, non sottolineato">
                      rovinato, non sottolineato
                    </option>
                    <option value="rovinato, sottolineato a matita">
                      rovinato, sottolineato a matita
                    </option>
                    <option value="rovinato, sottolineato a penna">
                      rovinato, sottolineato a penna
                    </option>
                    <option value="distrutto">distrutto</option>
                    <option value="fotocopiato">fotocopiato</option>
                  </select>
                </div>
              </div>
              <div
                className={`input-container ${filterSubmitClass}`}
                id="submit-container"
              >
                <input
                  autoComplete="off"
                  type="submit"
                  className="hidden"
                  value="FILTRA"
                />
                <p id="filter-submit" onClick={this.handleFilterSubmit}>
                  FILTRA
                </p>
              </div>
            </form>
            <div id="filter-suggester" onClick={this.toggleFilter}>
              <p id="filter-suggester-text">HIDE</p>
              <i id="filter-suggester-ico" className="fas fa-chevron-up"></i>
            </div>
          </div>
        ) : null;
    }

    const filterSuggestion = (
      <div id="filter-suggester" onClick={this.toggleFilter}>
        <p id="filter-suggester-text">FILTRA</p>
        <i id="filter-suggester-ico" className="fas fa-chevron-down"></i>
      </div>
    );

    const reverse = bodyComponent === wrongFilters ? true : false;

    const bodyContainer =
      this.props.booksResult.length !== 0 ? (
        <div>
          {reverse
            ? !this.state.filterHidden
              ? filterSuggestion
              : filters
            : this.state.filterHidden
            ? filterSuggestion
            : filters}
          <div id="checkout-order-container">
            <p id="checkout-order-header">Ordina per:</p>
            <select
              id="checkout-order"
              value={this.state.order}
              onChange={this.handleOrderChange}
            >
              <option value="1">riduzione incontri</option>
              <option value="2">Prezzo discendente</option>
              <option value="3">Prezzo ascendente</option>
            </select>
          </div>
          <div id="results-nav-top" className="normal-footer">
            <i
              onClick={this.decreaseIndex}
              className={`fas fa-angle-left nav ${
                this.state.index === 0 ? "hidden" : null
              }`}
            ></i>
            <p id="nav-ui">{uiList[this.state.index] || "REVIEW"}</p>
            <i
              onClick={() => this.increaseIndex()}
              className={`fas fa-angle-right nav ${
                uiList.length === this.state.index + 1 ? "hidden" : null
              }`}
            ></i>
          </div>
          <div id="bodyComponent-container">{bodyComponent}</div>
        </div>
      ) : (
        // )
        <div id="results-loading" className="r-refreshed">
          <LoadingM />
          <p id="rlr">Stiamo ricaricando tutti i libri, ci vorra un po'</p>
        </div>
      );

    return (
      <div id="results">
        <div id="ui-container">
          <p id="ui-header">Risultati per:</p>
          <div id="list-container">
            {uiList.map(ui => {
              return (
                <p
                  className={`ui-list ${
                    uiList.indexOf(ui) === this.state.index ? "bold" : null
                  }`}
                  key={ui}
                >
                  {ui}
                </p>
              );
            })}
          </div>
        </div>
        {bodyContainer}
        <div id="results-footer">
          <i
            onClick={this.decreaseIndex}
            className={`fas fa-angle-left nav ${
              this.state.index === 0 ? "hidden" : null
            }`}
          ></i>
          <p id="nav-ui">{uiList[this.state.index] || "REVIEW"}</p>
          <i
            onClick={() => this.increaseIndex()}
            className={`fas fa-angle-right nav ${
              // this.state.index
              uiList.length === this.state.index + 1 ? "hidden" : null
              // : "hidden"
            }`}
          ></i>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    booksResult: state.booksResult,
    selectedBooks: state.selectedBooks
  };
};

export default connect(mapStateToProps)(Results);

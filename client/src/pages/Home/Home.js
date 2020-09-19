import React, { Component } from "react";
import { connect } from "react-redux";
import "./Home.css";

// image
import imageSrc from "../../images/home-image.jpg";
import HomeExplainer from "../../components/homeComponents/home-explainer/home-explainer";
import HomeHeader from "../../components/homeComponents/home-header/home-header";
import BooksRandom from "../../components/homeComponents/booksRandom/booksRandom";

class Home extends Component {
  state = {
    imageDisplay: "hiddenVisibility",
    BookInfoDisplay: "hidden"
  };

  // toggle BookInfo
  toggleDisplay = () => {
    if (!this.props.user.DeliveryInfo) {
      // not logged
      this.props.history.push("/login");
    } else {
      if (this.state.BookInfoDisplay === "hidden") {
        sessionStorage.setItem("selling", true);
        this.setState({ BookInfoDisplay: null });
      } else {
        sessionStorage.removeItem("selling");
        this.setState({ BookInfoDisplay: "hidden" });
      }
    }
  };

  render() {
    return (
      <div id="home">
        <HomeHeader
          bookInfoDisplay={this.state.BookInfoDisplay}
          toggleBookInfoDisplay={this.toggleDisplay}
          hiderSlidebar={this.props.hideHomeSlidebar}
        />
        <div id="home-image-container">
          <img
            id="home-image"
            className={this.state.imageDisplay}
            src={imageSrc}
            onLoad={() => this.setState({ imageDisplay: null })}
            alt="Libri di testo vari"
          />
        </div>
        <HomeExplainer
          bookInfoDisplay={this.state.BookInfoDisplay}
          toggleBookInfoDisplay={this.toggleDisplay}
        />
        <BooksRandom />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps)(Home);

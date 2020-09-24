import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./Home.css";

// image
import imageSrc from "../../images/home-image.jpg";
import HomeExplainer from "../../components/homeComponents/home-explainer/home-explainer";
import HomeHeader from "../../components/homeComponents/home-header/home-header";
import BooksRandom from "../../components/homeComponents/booksRandom/booksRandom";

class Home extends Component {
  state = {
    imageDisplay: "hiddenVisibility"
  };

  render() {
    return (
      <div id="home">
        <HomeHeader
          bookInfoDisplay={this.state.BookInfoDisplay}
          toggleBookInfoDisplay={this.props.toggleBookInfo}
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
          toggleBookInfoDisplay={this.props.toggleBookInfo}
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

export default connect(mapStateToProps)(withRouter(Home));

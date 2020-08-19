import React, { Component } from "react";
import { connect } from "react-redux";
import "./Feedback.css";

class Feedback extends Component {
  state = {
    "1Star": "r",
    "2Star": "r",
    "3Star": "r",
    "4Star": "r",
    "5Star": "r",
    comment: "",
    contactHover: false
  };

  In = () => {
    this.setState({ contactHover: true });
  };

  Out = () => {
    this.setState({ contactHover: false });
  };

  handleCommentChange = e => {
    this.setState({
      comment: e.target.value
    });
  };

  handleStarLeave = () => {
    this.setState({
      "1Star": "r",
      "2Star": "r",
      "3Star": "r",
      "4Star": "r",
      "5Star": "r"
    });
  };

  handleStarOver = e => {
    for (let i = Number(e.target.id); i--; i > 0) {
      this.setState({
        [`${i + 1}Star`]: "s"
      });
    }
  };

  handleRatingConfirm = rate => {
    fetch("/api/feedback/rating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ _id: this.props.user._id, rating: rate })
    })
      .then(res => res.json())
      .then(jsonRes => {
        if (jsonRes.code !== 0) {
          // error
          this.props.dispatch({
            type: "E-SET",
            error: {
              frontendPlace: "Feedback/handleRatingConfirm/code1",
              jsonRes
            }
          });
          this.props.history.push("/error");
        } else {
          window.location = "/feedback";
        }
      })
      .catch(error => {
        console.log(error);
        this.props.dispatch({
          type: "E-SET",
          error: { frontendPlace: "Feedback/handleRatingConfirm/catch" }
        });
        this.props.history.push("/error");
      });
  };

  handleSubmit = e => {
    e.preventDefault();
    fetch("/api/feedback/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        _id: this.props.user._id,
        comment: this.state.comment
      })
    })
      .then(res => res.json())
      .then(jsonRes => {
        if (jsonRes.code !== 0) {
          // error
          this.props.dispatch({
            type: "E-SET",
            error: {
              frontendPlace: "Feedback/handleSubmit/code1",
              jsonRes
            }
          });
          this.props.history.push("/error");
        } else {
          window.location = "/feedback";
        }
      })
      .catch(error => {
        console.log(error);
        this.props.dispatch({
          type: "E-SET",
          error: { frontendPlace: "Feedback/handleSubmit/catch" }
        });
        this.props.history.push("/error");
      });
  };

  render() {
    const notVoted = (
      <div id="feedback-rating">
        <p id="feedback-rating-header">Dacci un voto</p>
        <div id="feedback-stars">
          <i
            onMouseOver={this.handleStarOver}
            onTouchStart={this.handleStarOver}
            onMouseLeave={this.handleStarLeave}
            onTouchEnd={this.handleStarLeave}
            onClick={() => {
              this.handleRatingConfirm(1);
            }}
            id="1"
            className={`fa${this.state["1Star"]} fa-star feedback-star `}
          ></i>
          <i
            onMouseOver={this.handleStarOver}
            onTouchStart={this.handleStarOver}
            onMouseLeave={this.handleStarLeave}
            onTouchEnd={this.handleStarLeave}
            onClick={() => {
              this.handleRatingConfirm(2);
            }}
            id="2"
            className={`fa${this.state["2Star"]} fa-star feedback-star`}
          ></i>
          <i
            onMouseOver={this.handleStarOver}
            onTouchStart={this.handleStarOver}
            onMouseLeave={this.handleStarLeave}
            onTouchEnd={this.handleStarLeave}
            onClick={() => {
              this.handleRatingConfirm(3);
            }}
            id="3"
            className={`fa${this.state["3Star"]} fa-star feedback-star`}
          ></i>
          <i
            onMouseOver={this.handleStarOver}
            onTouchStart={this.handleStarOver}
            onMouseLeave={this.handleStarLeave}
            onTouchEnd={this.handleStarLeave}
            onClick={() => {
              this.handleRatingConfirm(4);
            }}
            id="4"
            className={`fa${this.state["4Star"]} fa-star feedback-star`}
          ></i>
          <i
            onMouseOver={this.handleStarOver}
            onTouchStart={this.handleStarOver}
            onMouseLeave={this.handleStarLeave}
            onTouchEnd={this.handleStarLeave}
            onClick={() => {
              this.handleRatingConfirm(5);
            }}
            id="5"
            className={`fa${this.state["5Star"]} fa-star feedback-star`}
          ></i>
        </div>
      </div>
    );

    const voted = this.props.user.vote ? (
      <div id="feedback-rating">
        {/* <p id="feedback-rating-header">Dacci un voto</p> */}
        <div id="feedback-stars">
          <i id="1" className={`fas fa-star feedback-star `}></i>
          <i
            id="2"
            className={`fa${
              this.props.user.vote >= 2 ? "s" : "r"
            } fa-star feedback-star`}
          ></i>
          <i
            id="3"
            className={`fa${
              this.props.user.vote >= 3 ? "s" : "r"
            } fa-star feedback-star`}
          ></i>
          <i
            id="4"
            className={`fa${
              this.props.user.vote >= 4 ? "s" : "r"
            } fa-star feedback-star`}
          ></i>
          <i
            id="5"
            className={`fa${
              this.props.user.vote >= 5 ? "s" : "r"
            } fa-star feedback-star`}
          ></i>
        </div>
      </div>
    ) : null;

    const notJudged = (
      <div id="feedback-comment">
        <textarea
          id="feedback-comment-input"
          placeholder="Lascia un giudizio"
          onChange={this.handleCommentChange}
        ></textarea>
        <p
          id="feedback-comment-submit"
          onClick={this.handleSubmit}
          className={this.state.comment.length > 5 ? "" : "hidden"}
        >
          SALVA
        </p>
      </div>
    );

    const judged = (
      <div id="feedback-comment">
        <p id="feedback-comment-done">Hai già commentato</p>
      </div>
    );

    const rating = this.props.user.vote ? voted : notVoted;
    const comment = this.props.user.hasJudged ? judged : notJudged;

    const loadedBody = (
      <div>
        {rating}
        {comment}
      </div>
    );

    const loadingBody = <h1 id="feedback-loading">loading...</h1>;

    // const body = this.props.user._id ? loadedBody : null;
    // loading seems useless
    const body = loadedBody;

    const contactNotHover = (
      <p id="fpp" className="feedback-problem">
        Contattaci
      </p>
    );

    const contactHover = (
      <div className="feedback-problem" id="feedback-contact">
        <div className="feedback-contact">
          <i className="fas fa-at"></i>
          <a
            className="feedback-contact-info"
            id="feedback-email"
            href="mailto:libridoo.contacts@gmail.com"
            target="_top"
          >
            libridoo.contacts@gmail.com
          </a>
        </div>
        <div className="feedback-contact">
          <i className="fas fa-mobile-alt"></i>
          <span className="feedback-contact-info">3206265132</span>
        </div>
      </div>
    );

    const contact = this.state.contactHover ? contactHover : contactNotHover;

    return (
      <div id="feedback">
        <div id="feedback-image-container">
          <p id="feedback-fake-header">FEEDBACK</p>
        </div>
        {body}
        <div id="feedback-problems-container">
          <p id="feedback-problems-header">PROBLEMI TECNICI?</p>
          <div id="feedback-problems">
            <div
              className="feedback-problem-container"
              onClick={() => {
                this.props.history.push("/FAQs");
              }}
            >
              <p id="fpl" className="feedback-problem">
                Dai un occhio alle nostre FAQs
              </p>
            </div>
            <div
              id="feedback-contact-container"
              className="feedback-problem-container"
              onMouseOver={this.In}
              onTouchStart={this.In}
              onMouseLeave={this.Out}
              onTouchEnd={this.Out}
            >
              {contact}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps)(Feedback);

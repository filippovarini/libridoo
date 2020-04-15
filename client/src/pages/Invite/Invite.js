import React, { Component } from "react";
import { connect } from "react-redux";
import "./Invite.css";

class Invite extends Component {
  state = {
    linkCopied: false
  };

  copyText(element) {
    var range, selection;

    if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(element);
      range.select();
    } else if (window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    try {
      document.execCommand("copy");
      return 0;
    } catch (err) {
      console.log(err);
      return 1;
    }
  }

  copy = () => {
    const result = this.copyText(document.getElementById("invite-link-real"));
    if (result === 0) {
      this.setState({ linkCopied: true });
      setTimeout(() => {
        this.setState({ linkCopied: false });
      }, 1000);
    } else {
      // error
      alert(
        "Impossibile copiare sul tuo dispositivo, prova a trascriverlo a mano"
      );
    }
  };

  render() {
    const emptyBody = (
      <div id="empty-body" className="invite-body">
        <div className="invite-list-container">
          <p className="invite-list">
            1. Manda questo link agli amici e falli registrare
          </p>
          <div className="invite-link-container">
            <p id="invite-link" className="invite-link">
              EFFETTUA PRIMA IL LOGIN
            </p>
            <i
              id="invite-redirection"
              onClick={() => {
                this.props.history.push("/login");
              }}
              className="fas fa-directions invite-ico"
            ></i>
          </div>
        </div>
        <div className="invite-list-container">
          <p className="invite-list">
            2. Ottieni 5 punti bonus per amico registrato
          </p>
        </div>
        <div className="invite-list-container">
          <p className="invite-list">
            3. Usa i punti bonus per avere sconti sui libri
          </p>
        </div>
      </div>
    );

    const notEmptyBody = (
      <div id="notEmpty-body" className="invite-body">
        <div className="invite-list-container">
          <p className="invite-list">
            1. Manda questo link agli amici e falli registrare
          </p>
          <p
            id="invite-link-copied"
            className={this.state.linkCopied ? "" : "hidden"}
          >
            link copiato
          </p>
          <div className="invite-link-container">
            <p id="invite-link-real" className="invite-link">
              http://localhost:3000/register/{this.props.user._id}
            </p>
            <i
              id="invite-copy"
              onClick={this.copy}
              className="fas fa-copy invite-ico"
            ></i>
          </div>
        </div>
        <div className="invite-list-container">
          <p className="invite-list">
            2. Ottieni 5 punti bonus per amico registrato
          </p>
          <div className="invite-count-container">
            <p className="invite-count">BONUS ACCUMULATO:</p>
            <p className="invite-count-points">
              {this.props.user.bonusPoints} pt
              {this.props.user.bonusPoints
                ? this.props.user.bonusPoints > 1
                  ? "s"
                  : ""
                : null}
            </p>
          </div>
        </div>
        <div className="invite-list-container">
          <p className="invite-list">
            3. Usa i punti bonus per avere sconti sui libri
          </p>
        </div>
      </div>
    );
    const body = !this.props.user._id ? emptyBody : notEmptyBody;
    return (
      <div id="invite">
        <div id="invite-image-container">
          <p id="invite-fake-header">INVITA AMICI E GUADAGNA</p>
        </div>
        {body}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps)(Invite);

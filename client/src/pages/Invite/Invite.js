import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import "./Invite.css";
import HeaderPart from "../../components/headerPart";
import adOne from "../../images/ad-1.jpg";
import adTwo from "../../images/ad-2.jpg";
import adThree from "../../images/ad-3.jpg";

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
      alert("link copiato");
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

  imageBigger = number => {
    this.setState({ imageBigger: number });
  };

  imageSmaller = () => {
    this.setState({ imageBigger: null });
  };

  render() {
    const emptyBody = (
      <div id="empty-body" className="invite-body">
        <p id="earn-login-header">Effettua il login prima di continuare</p>
        <Link id="earn-login-link" to="./login">
          LOGIN <i className="fas fa-sign-in-alt"></i>
        </Link>
      </div>
    );

    const notEmptyBody = (
      <div id="notEmptyBody-container" className="earn-container">
        <p className="invite-count-points">
          Punti :{" "}
          <span id="earn-count">{this.props.user.bonusPoints || 0}</span>
        </p>
        <div id="firstEarn" className="earn-tool">
          <i className="fas earn-ico fa-users"></i>
          <p className="earn-title">Invita gli Amici</p>
          <p className="earn-description">
            <span className="earn-highlight">1 punto</span> per ogni amico
            registrato con il tuo{" "}
            <span id="link-copy" onClick={this.copy}>
              link
            </span>
            .
          </p>
          <p id="invite-link-real" className="invite-link">
            http://localhost:3000/register/{this.props.user._id}
          </p>
          <a
            id="earn-whatsapp-link"
            href={`whatsapp://send?text=https://www.libridoo.it/register/${this.props.user._id}`}
            data-action="share/whatsapp/share"
            data-text="Take a look at this awesome website:"
          >
            <i className="fab fa-whatsapp-square"></i>
          </a>
        </div>
        <div className="earn-tool">
          <i className="fas earn-ico fa-user-plus"></i>
          <p className="earn-title">Seguici su Insta</p>
          <p className="earn-description">
            <span className="earn-highlight"> 1 punto</span>: seguici e scrivici
            in direct l'email associata con libridoo.
          </p>
          <p id="earn-insta-warning">punto eliminato se unfollowi</p>
          <a
            id="earn-instagram-link"
            href="https://www.instagram.com/libridoo_uni/"
          >
            <i className="fab fa-instagram-square"></i>
          </a>
        </div>
        <div className="earn-tool">
          <i className="fab earn-ico fa-instagram"></i>
          <p className="earn-title">Insta Story</p>
          <p className="earn-description">
            <span className="earn-highlight">1 punto</span> se posti sulla
            storia per <b>24 ore</b>* una di queste tre foto, taggando
            @libridoo_uni:
          </p>
          <p id="invite-link-real" className="invite-link">
            http://localhost:3000/register/{this.props.user._id}
          </p>
          <div id="ad-container">
            <img
              src={adOne}
              alt="advertising"
              className={`ad-earn ${
                this.state.imageBigger === 1 ? "bigger" : null
              }`}
              onClick={() => this.props.history.push("./adImageOne")}
            />
            <img
              src={adTwo}
              alt="advertising"
              className={`ad-earn ${
                this.state.imageBigger === 2 ? "bigger" : null
              }`}
              onClick={() => this.props.history.push("./adImageTwo")}
            />

            <img
              src={adThree}
              alt="advertising"
              className={`ad-earn ${
                this.state.imageBigger === 3 ? "bigger" : null
              }`}
              onClick={() => this.props.history.push("./adImageThree")}
            />
          </div>
        </div>
      </div>
    );
    const body = !this.props.user._id ? emptyBody : notEmptyBody;
    return (
      <div id="invite">
        <HeaderPart
          title={"GUADAGNA"}
          mainClass={"deals"}
          imageId={"libridoo-logo-image"}
          headerClass="checkout-"
        />
        <p id="earn-explainer">Ottieni sconti guadagnando punti</p>
        <p id="earn-subExplainer">
          <span id="subExp1">10 punti</span>
          <span id="subExp2"> = </span>
          <span id="subExp3">10 euro</span>
        </p>

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

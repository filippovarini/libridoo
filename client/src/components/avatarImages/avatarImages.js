import React, { Component } from "react";
import "./avatarImages.css";

class AvatarImages extends Component {
  setAvatarImg = e => {
    this.props.setAvatarImg(e.target.src, e.target.name);
  };

  render() {
    return (
      <div id="register-avatarImgs">
        <span id="agatarImg-prompt">Scegli un avatar</span>
        <div id="images-container">
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              name={this.props.male ? "Il professore" : "La professoressa"}
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981692298"
              alt="schifomadò"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.props.male ? "Il professore" : "La professoressa"}
            </p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              name="L'assente"
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981699850"
              alt="morgan e bugo"
              className="register-avatarImage"
            />
            <p className="image-register-header">L'assente</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              name="Il 17"
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981735139"
              alt="disappointed"
              className="register-avatarImage"
            />
            <p className="image-register-header">Il 17</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              name="Pausa caffè"
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981716946"
              alt="baby yoda"
              className="register-avatarImage"
            />
            <p className="image-register-header">Pausa caffè</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              name={this.props.male ? "Il copione" : "La copiona"}
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981730904"
              alt="donna-giraffa"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.props.male ? "Il copione" : "La copiona"}
            </p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              name={this.props.male ? "Il businessman" : "La businesswoman"}
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981720614"
              alt="stonks"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.props.male ? "Il businessman" : "La businesswoman"}
            </p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              name="L'ingegnere"
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598765298832"
              alt="matematica"
              className="register-avatarImage"
            />
            <p className="image-register-header">L'ingegnere</p>
          </div>

          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              name={this.props.male ? "Il legale" : "La legale"}
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598780677065"
              alt="the wolf of wall street leonardo di caprio"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.props.male ? "Il legale" : "La legale"}
            </p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              name="Il medico"
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598780236639"
              alt="de luca il medico"
              className="register-avatarImage"
            />
            <p className="image-register-header">Il medico</p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              name={this.props.male ? "L'agronomo" : "L'agronoma"}
              src="https://libridoo-avatar-images.s3.eu-west-3.amazonaws.com/1587981712262"
              alt="lavoro onesto"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.props.male ? "L'agronomo" : "L'agronoma"}
            </p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              name={this.props.male ? "Lo storico" : "La storica"}
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598781381406"
              alt="alberto angela"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.props.male ? "Lo storico" : "La storica"}
            </p>
          </div>
          <div className="image-register-container">
            <img
              onClick={this.setAvatarImg}
              name={this.props.male ? "Lo psicologo" : "La psicologa"}
              src="https://s3.eu-west-3.amazonaws.com/book-cover-images.libridoo/1598780483720"
              alt="ragazzo che si sforza"
              className="register-avatarImage"
            />
            <p className="image-register-header">
              {this.props.male ? "Lo psicologo" : "La psicologa"}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default AvatarImages;

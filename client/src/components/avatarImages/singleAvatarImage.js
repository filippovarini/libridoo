import React, { Component } from "react";
import "./avatarImages.css";

class SingleAvatarImage extends Component {
  setAvatarImg = e => {
    this.state.setAvatarImg(e.target.src, e.target.name);
  };

  render() {
    return (
      <div id="ai-general-container">
        <div id="avatar-image-container">
          <i
            id="image-delete"
            onClick={this.props.deleteImage}
            className="fas fa-times"
          ></i>
          <img
            src={this.props.avatarImgURL}
            id="register-avatar-image"
            alt="avatar"
          />
        </div>
        <p id="ai-description">{this.props.description}</p>
      </div>
    );
  }
}

export default SingleAvatarImage;

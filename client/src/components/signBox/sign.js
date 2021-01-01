import React, { Component } from "react";
import "./sign.css";

// components
import LoadingM from "../Loading/loading_m";

class Sign extends Component {
  render() {
    const textInputs = this.props.textInputs.map(field => {
      return (
        <div className="text" key={field.id}>
          <input
            id={field.id}
            maxLength="320"
            placeholder={field.placeholder}
            type={field.type}
            onChange={this.props.handleInputChange}
            className="sign-input input-text"
          />
        </div>
      );
    });

    const checkboxInputs = this.props.checkboxInputs.map(field => {
      return (
        <div
          className={`sign-input ${
            field.small ? "sign-small" : "sign-checkbox"
          }`}
          key={field.id}
        >
          <input
            type="checkbox"
            id={field.id}
            onChange={this.props.toggleCheckbox}
            defaultChecked={field.defaultChecked}
            className="sign-input"
          />
          <label
            htmlFor={field.id}
            id="checbox-label"
            className="sign-checkBox"
          >
            {field.text}
          </label>
        </div>
      );
    });

    const body = this.props.loading ? (
      <div id="sign-loading">
        <LoadingM />
      </div>
    ) : (
      <div>
        <form id="sign-form" onSubmit={this.props.handleSubmit}>
          <span id="sign-prompt">{this.props.prompt}</span>
          <p
            id="sign-generalLabel"
            className={`incorrect-input-label ${
              this.props.errorMessage ? "" : "hidden"
            }`}
          >
            {this.props.errorMessage}
          </p>
          {textInputs}
          {checkboxInputs}

          <input type="submit" value={this.props.confirm} className="hidden" />
          <p id="sign-submit-btn" onClick={this.props.handleSubmit}>
            {this.props.confirm}
          </p>
        </form>
      </div>
    );

    return body;
  }
}

export default Sign;

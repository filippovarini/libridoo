import React, { Component } from "react";

class SexChange extends Component {
  render() {
    return (
      <div id="rg-sex">
        <p id="rg-sex-header">Sono {this.props.male ? "un" : "una"}</p>
        <div className="onoffswitch">
          <input
            type="checkbox"
            name="onoffswitch"
            className="onoffswitch-checkbox"
            id="myonoffswitch"
            tabIndex="0"
            defaultChecked
            onChange={this.props.handleSexChange}
          />
          <label className="onoffswitch-label" htmlFor="myonoffswitch">
            <span className="onoffswitch-inner"></span>
            <span className="onoffswitch-switch"></span>
          </label>
        </div>
      </div>
    );
  }
}

export default SexChange;

import React, { Component } from "react";
import "./Home.css";

class Home extends Component {
  state = {
    shit: Math.random()
  };

  shit = () => {
    this.props.history.push("/checkout");
  };

  render() {
    return <h1 onClick={this.shit}>hello</h1>;
  }
}

export default Home;

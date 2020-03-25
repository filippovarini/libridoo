import React from "react";

class App extends React.Component {
  state = {
    shit: "ciao"
  };
  submit = () => {
    this.setState({
      shit: "hola"
    });
  };
  componentDidMount = s => {
    this.componentDidUpdate();
    console.log("mounted");
    console.log(s);
  };
  componentDidUpdate = s => {
    console.log("updated");
    console.log(s);
  };
  render() {
    return (
      <div className="App">
        <h1 onClick={this.submit}>{this.state.shit}</h1>
      </div>
    );
  }
}

export default App;

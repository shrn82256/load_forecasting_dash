import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Device from "./Device";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Switch>
            <Route exact path="/device/:device_id" component={Device} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;

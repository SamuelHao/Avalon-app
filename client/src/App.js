import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Join from "./components/Join/Join";
import Avalon from "./components/Avalon/Avalon";

const App = () => (
  <Router>
    <Route path="/" exact component={Join} />
    <Route path="/Avalon" component={Avalon} />
  </Router>
);

export default App;

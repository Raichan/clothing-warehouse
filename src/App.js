import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Navbar from "./Navbar.js";
import Products from "./Products.js";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route exact path="/">
          <p>Welcome! Choose a product category.</p>
        </Route>
        <Route path="/jackets">
          <Products cat="Jackets" />
        </Route>
        <Route path="/shirts">
          <Products cat="Shirts" />
        </Route>
        <Route path="/accessories">
          <Products cat="Accessories" />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;

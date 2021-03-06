import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Navbar from "./components/Navbar.js";
import Products from "./components/Products.js";
import "./App.css";

const App = () => {
  // Save the latest result for each category for faster viewing
  const [productList, setProductList] = useState({
    jackets: [],
    shirts: [],
    accessories: [],
  });

  const updateProductList = (category, products) => {
    setProductList({ ...productList, [category]: products });
  };

  return (
    <Router>
      <Navbar />
      <Switch>
        <Route exact path="/">
          <p className="text-center catHeader">
            Welcome! Choose a product category.
          </p>
        </Route>
        <Route path="/jackets">
          <Products
            category="jackets"
            productList={productList["jackets"]}
            updateProductList={updateProductList}
          />
        </Route>
        <Route path="/shirts">
          <Products
            category="shirts"
            productList={productList["shirts"]}
            updateProductList={updateProductList}
          />
        </Route>
        <Route path="/accessories">
          <Products
            category="accessories"
            productList={productList["accessories"]}
            updateProductList={updateProductList}
          />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;

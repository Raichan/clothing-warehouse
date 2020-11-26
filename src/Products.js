import React, { useState } from "react";

const Products = () => {
  const [products, setProducts] = useState(null);

  const getProducts = (category) => {
    fetch("https://bad-api-assignment.reaktor.com/products/" + category)
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  return (
    <div>
      <h1>Products</h1>
      <p>Welcome! Choose a product category.</p>
      <button onClick={() => getProducts("jackets")}>Jackets</button>
      <div>{products}</div>
    </div>
  );
};

export default Products;

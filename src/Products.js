import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { FaSearch } from "react-icons/fa";
import Availability from "./Availability.js";

const Products = ({ cat }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    setSearch(""); // Empty search bar
    getProducts(cat);
  }, [cat]);

  const updateSearch = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const results = products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
    setSearchResults(results);
  }, [search, products]);

  const getProducts = (category) => {
    // Get products
    let sorted = [];
    fetch("https://bad-api-assignment.reaktor.com/products/" + category)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        sorted = data.sort((a, b) => (a.name > b.name ? 1 : -1));
        //setProducts(sorted);

        // Find all manufacturers
        let manufacturers = [];
        data.forEach((product) => {
          if (!manufacturers.includes(product.manufacturer)) {
            manufacturers.push(product.manufacturer);
          }
        });
        // "xoon", "reps", "nouke", "derp", "abiplos"
        manufacturers.forEach((manufacturer, m) => {
          fetch(
            "https://bad-api-assignment.reaktor.com/availability/" +
              manufacturer
          )
            .then((response) => response.json())
            .then((data) => {
              console.log("processing " + manufacturer);
              const parser = new DOMParser();

              // Loop through products, set availabilities
              sorted.forEach((product, i) => {
                // Skip products from wrong manufacturers
                if (product.manufacturer === manufacturer) {
                  let avLine = data.response.find(
                    (p) => p.id.toLowerCase() === product.id
                  );

                  if (avLine !== undefined) {
                    const availabilityXml = parser.parseFromString(
                      avLine.DATAPAYLOAD,
                      "application/xml"
                    );

                    // Update product availability
                    let availability = availabilityXml.getElementsByTagName(
                      "INSTOCKVALUE"
                    )[0].childNodes[0].nodeValue;
                    sorted[i].availability = availability;
                  }
                }
              });
            })
            .then(() => {
              console.log("done " + manufacturer);
              // All 5 manufacturers have been handled
              // TODO find a more generic solution
              if (m === 4) {
                // Update availabilities
                setProducts(sorted);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <h5 class="text-center catName">{cat}</h5>
      <div class="input-group mb-3 search">
        <div class="input-group-prepend">
          <span class="input-group-text">
            <FaSearch />
          </span>
        </div>
        <input
          type="text"
          class="form-control"
          placeholder="Search"
          aria-label="Search"
          value={search}
          onChange={updateSearch}
        />
      </div>
      <div class="productTable">
        <Table striped>
          <tbody>
            {searchResults.map(function (item, i) {
              return (
                <tr key={i}>
                  <td>
                    {item.name}
                    <br />
                    {item.manufacturer}
                  </td>
                  <td>
                    {item.color.join(", ")}
                    <br />
                    {item.price + " €"}
                    {/* Took the liberty of assuming these are euros*/}
                  </td>
                  <td>
                    <Availability availability={item.availability} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Products;

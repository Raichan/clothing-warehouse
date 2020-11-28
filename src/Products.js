import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from "react-bootstrap/Table";
import Availability from "./Availability.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";

const Products = ({ category, productList, updateProductList }) => {
  const [search, setSearch] = useState(""); // Search bar
  const [searchResults, setSearchResults] = useState(productList); // Filters results
  const [loadingError, setLoadingError] = useState(false); // Availability API error flag
  const productUrl = "https://bad-api-assignment.reaktor.com/products/";
  const availabilityUrl =
    "https://bad-api-assignment.reaktor.com/availability/";

  // Search bar
  const updateSearch = (e) => {
    setSearch(e.target.value);
  };

  // Filter search results
  useEffect(() => {
    const results = productList.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
    setSearchResults(results);
  }, [search, productList]);

  // Load products and their availability
  const getProducts = () => {
    let sorted = [];
    setLoadingError(false); // Reset loading status
    axios.get(productUrl + category).then((res) => {
      const data = res.data;
      console.log(data);
      sorted = data.sort((a, b) => (a.name > b.name ? 1 : -1));

      // Find all manufacturers
      let manufacturers = [];
      data.forEach((product) => {
        if (!manufacturers.includes(product.manufacturer)) {
          manufacturers.push(product.manufacturer);
        }
      });
      // "xoon", "reps", "nouke", "derp", "abiplos"
      // Get availability data
      let axiosCalls = [];
      let availabilities = [];
      manufacturers.forEach((manufacturer) => {
        axiosCalls.push(axios.get(availabilityUrl + manufacturer));
      });
      axios.all(axiosCalls).then(
        axios.spread((...responses) => {
          responses.forEach((res) => {
            let result = res.data.response;
            // Check that response is longer than [] (API error)
            if (result.length > 2) {
              availabilities.push(...result);
            } else {
              // API error, set error flag
              console.log("manufacturer error");
              setLoadingError(true);
            }
          });
          console.log(availabilities);
          const parser = new DOMParser();
          // Loop through products, set availabilities
          sorted.forEach((product, i) => {
            let avLine = availabilities.find(
              (p) => p.id.toLowerCase() === product.id
            );

            if (avLine !== undefined) {
              // Parse availability status
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
          });

          // All products have been handled, update availabilities
          updateProductList(category, sorted);
        })
      );
    });
  };

  // Fetch products on page load
  useEffect(() => {
    console.log("get products");

    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <div>
      {/* Capitalize header */}
      <h5 className="text-center catHeader">
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </h5>
      <div className="input-group mb-3 search">
        <div className="input-group-prepend">
          <span className="input-group-text">
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>
        <input
          type="text"
          className="form-control"
          placeholder="Search"
          aria-label="Search"
          value={search}
          onChange={updateSearch}
        />
      </div>
      {/* Show a loading spinner during the first category load */}
      <p
        className={"text-center" + (searchResults.length > 0 ? " d-none" : "")}
      >
        Loading <FontAwesomeIcon icon={faSpinner} pulse />
      </p>
      {/* Only slow the error text if any availability calls failed */}
      <p
        className={
          "text-center text-danger errorText" + (loadingError ? "" : " d-none")
        }
      >
        Loading availabilities failed for one or more manufacturers.
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => getProducts()}
        >
          Reload
        </button>
      </p>
      <div className="productTable">
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

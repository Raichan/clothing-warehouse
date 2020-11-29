import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductTable from "./ProductTable.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";

const Products = ({ category, productList, updateProductList }) => {
  const [search, setSearch] = useState(""); // Search bar
  const [searchResults, setSearchResults] = useState(productList); // Filters results
  const [loadingError, setLoadingError] = useState(false); // Availability API error flag
  const [availability, setAvailability] = useState({});
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

  // Add manufacturer to availability info
  const addAvailabilities = (availabilities) => {
    let newList = { ...availability, ...availabilities };
    setAvailability(newList);
  };

  // Load products and their availability
  const getProducts = () => {
    setLoadingError(false); // Reset loading status
    axios
      .get(productUrl + category)
      .then((res) => {
        const productData = res.data;

        // Find all manufacturers
        let manufacturers = [];
        productData.forEach((product) => {
          if (!manufacturers.includes(product.manufacturer)) {
            manufacturers.push(product.manufacturer);
          }
        });

        updateProductList(category, productData);

        // getAvailabilities(manufacturers);
        // Set up call and availability object for each manufacturer
        let availabilities = {};
        const parser = new DOMParser();
        manufacturers.forEach((manufacturer, i) => {
          axios
            .get(availabilityUrl + manufacturer)
            .then((res) => {
              console.log("handling " + manufacturer);
              let result = res.data.response;
              // Check that response is longer than [] (API error)
              if (result.length > 2) {
                result.forEach((a) => {
                  const availabilityXml = parser.parseFromString(
                    a.DATAPAYLOAD,
                    "application/xml"
                  );
                  let availability = availabilityXml.getElementsByTagName(
                    "INSTOCKVALUE"
                  )[0].childNodes[0].nodeValue;
                  availabilities[a.id.toLowerCase()] = availability;
                });
                addAvailabilities(availabilities);
              } else {
                // API error, set error flag
                console.error("Availability API error: " + manufacturer);
                setLoadingError(true);
              }
            })
            .catch((err) => {
              console.error(err);
            });
        });
      })
      .catch((err) => {
        console.error(err);
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
        <ProductTable
          searchResults={searchResults}
          availability={availability}
        />
      </div>
    </div>
  );
};

export default Products;

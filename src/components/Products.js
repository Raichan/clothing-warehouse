import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductTable from "./ProductTable.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faRedo, faSpinner } from "@fortawesome/free-solid-svg-icons";

const Products = ({ category, productList, updateProductList }) => {
  const [search, setSearch] = useState(""); // Search bar
  const [searchResults, setSearchResults] = useState(productList); // Filters results
  const [availability, setAvailability] = useState({}); // Availability data for all manufacturers
  const [loading, setLoading] = useState(false); // Show loading spinner or refresh button
  const productUrl = "https://bad-api-assignment.reaktor.com/products/";
  const availabilityUrl =
    "https://bad-api-assignment.reaktor.com/availability/";
  const maxCalls = 3; // Maximum times to try an availability call
  let requestStatus = {}; // Status of each running API request
  let availabilities = {}; // Temporary container for availability

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

  // Keep track of which calls are still running
  const updateRequestStatus = (request, status) => {
    requestStatus[request] = status;
    if (Object.keys(requestStatus).every((k) => !requestStatus[k])) {
      setLoading(false); // All values false, no requests running
    } else {
      setLoading(true); // At least one request hasn't finished
    }
  };

  // Get availability data for manufacturer, try at most n times
  const getAvailabilityData = (manufacturer, n) => {
    const parser = new DOMParser();
    let url = availabilityUrl + manufacturer;
    if (n === maxCalls) {
      updateRequestStatus(url, true); // First try, set the call as running
    }
    axios
      .get(url)
      .then((res) => {
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
          updateRequestStatus(res.config.url, false); // Set call as finished
        } else {
          // API error, give up or try again
          if (n === 1) {
            updateRequestStatus(res.config.url, false); // Set call as finished
            console.error("Availability API error: " + manufacturer);
          } else {
            getAvailabilityData(manufacturer, n - 1);
          }
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Load products and their availability
  const getProducts = (refresh = false) => {
    let url = productUrl + category;
    updateRequestStatus(url, true); // Set the call as running
    axios
      .get(url)
      .then((res) => {
        const productData = res.data;
        updateProductList(category, productData);
        updateRequestStatus(res.config.url, false); // Set the call as finished

        // If availabilities have not been set or if refreshing the page, get the availability data
        if (Object.keys(availability).length === 0 || refresh) {
          // Find all manufacturers
          let manufacturers = [];
          productData.forEach((product) => {
            if (!manufacturers.includes(product.manufacturer)) {
              manufacturers.push(product.manufacturer);
            }
          });

          manufacturers.forEach((manufacturer, i) => {
            getAvailabilityData(manufacturer, maxCalls);
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Reset search results, then reload
  const refresh = () => {
    setSearchResults([]);
    getProducts(true);
  };

  // Load products when the category is opened for the first time
  useEffect(() => {
    // Empty the search bar
    setSearch("");
    if (productList.length === 0) {
      getProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <div>
      {/* Capitalize header */}
      <h5 className="text-center catHeader">
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </h5>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-auto">
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
          </div>
          <div className="col-auto">
            {/* Show a spinner when loading, refresh icon otherwise */}
            <button
              aria-label="Refresh"
              onClick={refresh}
              className={
                "btn btn-outline-secondary" + (loading ? " d-none" : "")
              }
            >
              <FontAwesomeIcon icon={faRedo} />
            </button>
            <FontAwesomeIcon
              className={"refresh text-center h3" + (loading ? "" : " d-none")}
              icon={faSpinner}
              pulse
            />
          </div>
        </div>
      </div>

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

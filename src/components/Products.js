import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductTable from "./ProductTable.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faRedo, faSpinner } from "@fortawesome/free-solid-svg-icons";

const Products = ({ category, productList, updateProductList }) => {
  const [search, setSearch] = useState(""); // Search bar
  const [searchResults, setSearchResults] = useState(productList); // Filters results
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const productUrl = "https://bad-api-assignment.reaktor.com/products/";
  const availabilityUrl =
    "https://bad-api-assignment.reaktor.com/availability/";
  const maxCalls = 3; // Maximum times to try an availability call
  let requestStatus = {};
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
      setLoading(false); // All requests false
      console.log("loading false");
    } else {
      setLoading(true); // At least one request hasn't finished
      console.log("loading true");
    }
    console.log(requestStatus);
  };

  const availabilities = {};

  const getAvailabilityData = (manufacturer, n) => {
    const parser = new DOMParser();
    let url = availabilityUrl + manufacturer;
    if (n === maxCalls) {
      updateRequestStatus(url, true); // First try, set the call as running
    }
    axios
      .get(url)
      .then((res) => {
        console.log("handling " + manufacturer + ", n = " + n);
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
          // API error, try 3 times before giving up
          if (n === 1) {
            updateRequestStatus(res.config.url, false); // Set call as finished
            console.error("Availability API error: " + manufacturer);
          } else {
            console.log(manufacturer + " failed, n = " + n);
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
        updateRequestStatus(res.config.url, false); // Set call as finished

        // If availabilities have not been set or if refreshing the page, get the availability data
        console.log(availability);
        if (Object.keys(availability).length === 0 || refresh) {
          console.log("finding manufacturers");
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

  // Fetch products on first page load only
  useEffect(() => {
    console.log(productList);
    if (productList.length === 0) {
      console.log("get products");
      getProducts();
    } else {
      console.log("don't get products");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Reset search results and availability, then reload
  const refresh = () => {
    console.log("refresh");
    setSearchResults([]);
    getProducts(true);
  };

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
          <div class="col-auto">
            {/* Show a spinner when loading, refresh icon otherwise */}
            <button
              aria-label="Refresh"
              onClick={() => refresh()}
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

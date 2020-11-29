import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductTable from "./ProductTable.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faRedo, faSpinner } from "@fortawesome/free-solid-svg-icons";

const Products = ({ category, productList, updateProductList }) => {
  const [search, setSearch] = useState(""); // Search bar
  const [searchResults, setSearchResults] = useState(productList); // Filters results
  const [availability, setAvailability] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(1); // Loading countdowns
  const [loadingAvailability, setLoadingAvailability] = useState(1);
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

  // Decrease loading countdown when availability has been added
  useEffect(() => {
    if (Object.keys(availability).length !== 0) {
      console.log("lowering loading from " + loadingAvailability);
      setLoadingAvailability(loadingAvailability - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availability]);

  useEffect(() => {
    console.log(productList);
    if (productList.length > 0) {
      console.log("products found, decreasing countdown");
      setLoadingProducts(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productList]);

  const availabilities = {};

  const getAvailabilityData = (manufacturer, n) => {
    const parser = new DOMParser();
    axios
      .get(availabilityUrl + manufacturer)
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
        } else {
          // API error, try 3 times before giving up
          if (n === 1) {
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
    setLoadingProducts(1);
    axios
      .get(productUrl + category)
      .then((res) => {
        const productData = res.data;

        updateProductList(category, productData);

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

          // Set loading countdown
          setLoadingAvailability(manufacturers.length);
          manufacturers.forEach((manufacturer, i) => {
            getAvailabilityData(manufacturer, 3);
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
                "btn btn-outline-secondary" +
                (loadingProducts || loadingAvailability ? " d-none" : "")
              }
            >
              <FontAwesomeIcon icon={faRedo} />
            </button>
            <FontAwesomeIcon
              className={
                "refresh text-center h3" +
                (!loadingProducts && !loadingAvailability ? " d-none" : "")
              }
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

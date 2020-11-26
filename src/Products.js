import React, { useState } from "react";

const Products = () => {
  const [products, setProducts] = useState([]);

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
        //console.log(manufacturers); // "xoon", "reps", "nouke", "derp", "abiplos"
        manufacturers.forEach((manufacturer, m) => {
          console.log("fetching " + manufacturers);
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

                    let availability;
                    switch (
                      availabilityXml.getElementsByTagName("INSTOCKVALUE")[0]
                        .childNodes[0].nodeValue
                    ) {
                      case "INSTOCK":
                        availability = 2;
                        break;
                      case "LESSTHAN10":
                        availability = 1;
                        break;
                      case "OUTOFSTOCK":
                        availability = 0;
                        break;
                      default:
                        availability = -1; // unknown
                        break;
                    }

                    // Update product availability
                    sorted[i].availability = availability;
                    console.log(
                      "product " +
                        product.name +
                        " availability: " +
                        availability
                    );
                  } else {
                    console.log("id " + product.id + " not found");
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
      <p>Welcome! Choose a product category.</p>
      <button onClick={() => getProducts("jackets")}>Jackets</button>
      <button onClick={() => getProducts("shirts")}>Shirts</button>
      <button onClick={() => getProducts("accessories")}>Accessories</button>
      <ul>
        {products.map(function (item, i) {
          return (
            <li key={i}>
              {item.name +
                " " +
                item.id +
                " " +
                (item.availability ? " " + item.availability : " -1")}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Products;

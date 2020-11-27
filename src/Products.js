import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";

const Products = ({ cat }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts(cat);
  }, [cat]);

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
      <Table striped>
        <tbody>
          {products.map(function (item, i) {
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
                  {item.price}
                </td>
                <td>{item.availability ? " " + item.availability : " -1"}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default Products;

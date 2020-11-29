import React from "react";
import Table from "react-bootstrap/Table";
import Availability from "./Availability.js";

const ProductTable = ({ searchResults, availability }) => {
  const products = searchResults.sort((a, b) => (a.name > b.name ? 1 : -1));

  return (
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
                {item.price + " €"}
                {/* Took the liberty of assuming these are euros*/}
              </td>
              <td>
                <Availability availability={availability[item.id]} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default ProductTable;

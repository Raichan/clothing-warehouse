import React from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
  FaQuestionCircle,
} from "react-icons/fa";

const Availability = ({ availability }) => {
  switch (availability) {
    case "INSTOCK":
      return <FaCheckCircle title="In stock" className="text-success" />;
    case "LESSTHAN10":
      return (
        <FaExclamationCircle title="Less than 10" className="text-warning" />
      );
    case "OUTOFSTOCK":
      return <FaTimesCircle title="Out of stock" className="text-danger" />;
    default:
      return (
        <FaQuestionCircle
          title="Availability not found"
          className="text-muted"
        />
      );
  }
};

export default Availability;

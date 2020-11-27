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
      return <FaCheckCircle title="In stock" class="text-success" />;
    case "LESSTHAN10":
      return <FaExclamationCircle title="Less than 10" class="text-warning" />;
    case "OUTOFSTOCK":
      return <FaTimesCircle title="Out of stock" class="text-danger" />;
    default:
      return (
        <FaQuestionCircle title="Availability not found" class="text-muted" />
      );
  }
};

export default Availability;

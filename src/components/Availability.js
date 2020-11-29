import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
  faTimesCircle,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

const Availability = ({ availability }) => {
  // Show icon depending on availability value
  switch (availability) {
    case "INSTOCK":
      return (
        <FontAwesomeIcon
          icon={faCheckCircle}
          title="In stock"
          className="text-success"
        />
      );
    case "LESSTHAN10":
      return (
        <FontAwesomeIcon
          icon={faExclamationCircle}
          title="Less than 10"
          className="text-warning"
        />
      );
    case "OUTOFSTOCK":
      return (
        <FontAwesomeIcon
          icon={faTimesCircle}
          title="Out of stock"
          className="text-danger"
        />
      );
    default:
      return (
        <FontAwesomeIcon
          icon={faQuestionCircle}
          title="Availability not found"
          className="text-muted"
        />
      );
  }
};

export default Availability;

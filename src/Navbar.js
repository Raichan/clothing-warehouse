import React from "react";
import { NavLink } from "react-router-dom";
import { GiMonclerJacket, GiPoloShirt, GiDiamondRing } from "react-icons/gi";

const Navbar = () => {
  return (
    <div id="navbar">
      <h2>Clothing Warehouse</h2>
      <ul>
        <li>
          <NavLink to="/jackets" activeClassName="active">
            <GiMonclerJacket />
          </NavLink>
        </li>
        <li>
          <NavLink to="/shirts" activeClassName="active">
            <GiPoloShirt />
          </NavLink>
        </li>
        <li>
          <NavLink to="/accessories" activeClassName="active">
            <GiDiamondRing />
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;

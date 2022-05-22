import React from "react";
import { getLifeExpFemale, getLifeExpMale } from "../utils";

import Pill from "../Pill";

import "./InfoPopup.scss";

const InfoPopup = ({ year, country }) => {
  const name = country?.object?.properties?.ADMIN || "";
  const maleLifeExpectancy = getLifeExpMale(year)(country.object);
  const femaleLifeExpectancy = getLifeExpFemale(year)(country.object);
  console.log(name, maleLifeExpectancy, femaleLifeExpectancy);
  return (
    <div className="InfoPopup">
      <h2>{name}</h2>
      <Pill>{maleLifeExpectancy} years</Pill>
      <Pill>{femaleLifeExpectancy} years</Pill>
    </div>
  );
};

export default InfoPopup;

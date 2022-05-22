import React from "react";
import { getLifeExpFemale, getLifeExpMale } from "../utils";

import Pill, { PillVariant } from "../Pill";

import "./InfoPopup.scss";

const InfoPopup = ({ year, country }) => {
  const name = country?.object?.properties?.ADMIN || "";
  const maleLifeExpectancy = getLifeExpMale(year)(country.object);
  const femaleLifeExpectancy = getLifeExpFemale(year)(country.object);
  console.log(name, maleLifeExpectancy, femaleLifeExpectancy);
  return (
    <div className="InfoPopup">
      <h2>{name}</h2>
      <Pill variant={PillVariant.male}>{maleLifeExpectancy} years</Pill>
      <Pill variant={PillVariant.female}>{femaleLifeExpectancy} years</Pill>
    </div>
  );
};

export default InfoPopup;

import React from "react";
import { getLifeExpFemale, getLifeExpMale } from "../utils";

import LineChart from "../LineChart";
import Pill, { PillVariant } from "../Pill";

import { MIN_YEAR } from "../consts";

import "./InfoPopup.scss";

const formatXScale = Math.round;
const formatYScale = Math.round;

const InfoPopup = ({ year, country }) => {
  const name = country?.object?.properties?.ADMIN || "";
  const maleLifeExpectancy = getLifeExpMale(year)(country.object);
  const femaleLifeExpectancy = getLifeExpFemale(year)(country.object);

  const maleData = {
    id: "male",
    label: "Male",
    color: "blue",
    datapoints: country?.object?.properties?.lifeExpMale?.map((yearData, index) => {
      return {
        valueY: yearData,
        valueX: MIN_YEAR + index,
      };
    }),
  };

  const femaleData = {
    id: "female",
    label: "Female",
    color: "pink",
    datapoints: country?.object?.properties?.lifeExpFemale?.map((yearData, index) => {
      return {
        valueY: yearData,
        valueX: MIN_YEAR + index,
      };
    }),
  };

  const dataSeries = [maleData, femaleData];

  return (
    <div className="InfoPopup">
      <h2>{name}</h2>
      <LineChart
        data={dataSeries}
        numXAxisTicks={5}
        formatXScale={formatXScale}
        formatYScale={formatYScale}
        height={300}
      />
      <div className="InfoPopup__pills">
        <Pill variant={PillVariant.male}>{maleLifeExpectancy} years</Pill>
        <Pill variant={PillVariant.female}>{femaleLifeExpectancy} years</Pill>
      </div>
    </div>
  );
};

export default InfoPopup;

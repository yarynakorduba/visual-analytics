import React from "react";
import { getGdpPerCapita, getGdpPerCapitaPred, getLifeExpAll, getLifeExpFemale, getLifeExpMale, getLifeExpPred, getMostSimGdp, getMostSimLifeExp } from "../utils";

import LineChart from "../LineChart";
import Pill, { PillVariant } from "../Pill";

import { MAX_YEAR, MIN_YEAR } from "../consts";

import "./InfoPopup.scss";
//
const formatXScale = Math.round;
const formatYScale = Math.round;

const InfoPopup = ({ year, country }) => {
  const name = country?.object?.properties?.ADMIN || "";
  const maleLifeExpectancy = getLifeExpMale(year)(country.object);
  const femaleLifeExpectancy = getLifeExpFemale(year)(country.object);
  const lifeExpAll = getLifeExpAll(MAX_YEAR)(country.object);
  const lifeExpPred = getLifeExpPred(country.object);
  const mostSimLifeExp = getMostSimLifeExp(country.object);
  const gdpPerCapita = getGdpPerCapita(MAX_YEAR)(country.object);
  const gdpPred = getGdpPerCapitaPred(country.object);
  const mostSimGdp = getMostSimGdp(country.object);

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
      <div className="InfoPopup__other">
        <h3>Future Predictions (in 2030)</h3>
        Average Life Expectancy:
        { lifeExpPred >= lifeExpAll && <Pill variant={PillVariant.posTrend}>{lifeExpPred} years</Pill>}
        { lifeExpPred < lifeExpAll && <Pill variant={PillVariant.negTrend}>{lifeExpPred} years</Pill>}
        <br></br>
        GDP per Capita:
        { gdpPred >= gdpPerCapita && <Pill variant={PillVariant.posTrend}>${gdpPred}</Pill>}
        { gdpPred < gdpPerCapita && <Pill variant={PillVariant.negTrend}>${gdpPred}</Pill>}
      </div>
      <br></br>
      <div className="InfoPopup__other">
        <h3>Most Similar Countries</h3>
        Average Life Expectancy: { mostSimLifeExp }
        <br></br>
        GDP per Capita: { mostSimGdp }
      </div>
    </div>
  );
};

export default InfoPopup;

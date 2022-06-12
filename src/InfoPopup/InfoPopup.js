import React from "react";
import {
  getGdpPerCapita,
  getGdpPerCapitaPred,
  getLifeExpAll,
  getLifeExpFemale,
  getLifeExpMale,
  getLifeExpPred,
  getMostSimGdp,
  getMostSimLifeExp,
  getMaleFemaleChartData,
  getGdpChartData,
} from "../utils";

import LineChart from "../LineChart";
import Pill, { PillVariant } from "../Pill";
import { MAX_YEAR } from "../consts";

import "./InfoPopup.scss";

const formatXScale = Math.round;
const formatYScale = Math.round;

const InfoPopup = ({ year, country, onClose, firstChartLabel, secondChartLabel }) => {
  const name = country?.object?.properties?.ADMIN || "";
  const maleLifeExpectancy = getLifeExpMale(year)(country.object);
  const femaleLifeExpectancy = getLifeExpFemale(year)(country.object);
  const lifeExpAll = getLifeExpAll(MAX_YEAR)(country.object);
  const lifeExpPred = getLifeExpPred(country.object);
  const mostSimLifeExp = getMostSimLifeExp(country.object);
  const gdpPerCapita = getGdpPerCapita(MAX_YEAR)(country.object);
  const gdpPred = getGdpPerCapitaPred(country.object);
  const mostSimGdp = getMostSimGdp(country.object);

  const firstChartData = getMaleFemaleChartData(country);
  const secondChartData = getGdpChartData(country);

  return (
    <div className="InfoPopup">
      <h2 className="InfoPopup__header">{name}</h2>
      <button className="InfoPopup__close" onClick={onClose}>
        &#10005;
      </button>
      <LineChart
        heading={firstChartLabel}
        data={firstChartData}
        numXAxisTicks={5}
        numYAxisTicks={5}
        formatXScale={formatXScale}
        formatYScale={formatYScale}
        height={150}
      />
      <div className="InfoPopup__pills">
        <Pill variant={PillVariant.male}>{maleLifeExpectancy} years</Pill>
        <Pill variant={PillVariant.female}>{femaleLifeExpectancy} years</Pill>
      </div>
      <LineChart
        heading={secondChartLabel}
        data={secondChartData}
        numXAxisTicks={5}
        numYAxisTicks={5}
        formatXScale={formatXScale}
        formatYScale={formatYScale}
        height={150}
      />
      <div className="InfoPopup__other">
        <h3>Future Predictions (in 2030)</h3>
        Average Life Expectancy:
        {lifeExpPred >= lifeExpAll && <Pill variant={PillVariant.posTrend}>{lifeExpPred} years</Pill>}
        {lifeExpPred < lifeExpAll && <Pill variant={PillVariant.negTrend}>{lifeExpPred} years</Pill>}
        <br></br>
        GDP per Capita:
        {gdpPred >= gdpPerCapita && <Pill variant={PillVariant.posTrend}>${gdpPred}</Pill>}
        {gdpPred < gdpPerCapita && <Pill variant={PillVariant.negTrend}>${gdpPred}</Pill>}
      </div>
      <br></br>
      <div className="InfoPopup__other">
        <h3>Most Similar Countries</h3>
        Average Life Expectancy: {mostSimLifeExp}
        <br></br>
        GDP per Capita: {mostSimGdp}
      </div>
    </div>
  );
};

export default InfoPopup;

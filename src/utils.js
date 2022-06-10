import { useCallback, useMemo, useState } from "react";
import { scaleBand, scaleLinear } from "@visx/scale";

import { reverse } from "lodash";

import { MIN_YEAR, ChartVariant, AxisVariant } from "./consts";

// Return year index
const getYearIdx = (year) => {
  return year - MIN_YEAR;
};

// LIFEEXPALL
export const getLifeExpAll = (displayedYear) => (d) => {
  const { lifeExpAll } = d.properties;
  if (!lifeExpAll) return [255, 255, 255];
  return lifeExpAll?.[getYearIdx(displayedYear)];
};

// LIFEEXPFEMALE
export const getLifeExpFemale = (displayedYear) => (d) => {
  const { lifeExpFemale } = d.properties;
  if (!lifeExpFemale) return [255, 255, 255];
  return lifeExpFemale?.[getYearIdx(displayedYear)];
};

// LIFEEXPMALE
export const getLifeExpMale = (displayedYear) => (d) => {
  const { lifeExpMale } = d?.properties;
  if (!lifeExpMale) return [255, 255, 255];
  return lifeExpMale?.[getYearIdx(displayedYear)];
};

// IMMUNDPT
export const getImmunRateDpt = (displayedYear) => (d) => {
  const { immunDpt } = d.properties;
  if (!immunDpt) return [255, 255, 255];
  return immunDpt?.[getYearIdx(displayedYear)];
};

// GDP
export const getGdp = (displayedYear) => (d) => {
  const { gdp } = d.properties;
  if (!gdp) return [255, 255, 255];
  return gdp?.[getYearIdx(displayedYear)];
};

// GDP per Capita
export const getGdpPerCapita = (displayedYear) => (d) => {
  const { gdpPerCapita } = d.properties;
  if (!gdpPerCapita) return [255, 255, 255];
  return gdpPerCapita?.[getYearIdx(displayedYear)];
};

// LifeExpAll prediction for in 10 years
export const getLifeExpPred = (d) => {
  const { lifeExpPred } = d.properties;
  if (!lifeExpPred) return -1;
  return lifeExpPred;
};

// GDP per Capita prediction for in 10 years
export const getGdpPerCapitaPred = (d) => {
  const { gdpPred } = d.properties;
  if (!gdpPred) return -1;
  return gdpPred;
};

// LifeExpAll similiarty value in comparison with other countries --> index = countrycode
export const getLifeExpSim = (otherCountryCode) => (d) => {
  const { lifeExpSim } = d.properties;
  if (!lifeExpSim) return -1;
  return lifeExpSim?.[otherCountryCode];
};

// ImmunDpt similiarty value in comparison with other countries --> index = countrycode
export const getImmunDptSim = (otherCountryCode) => (d) => {
  const { immunDptSim } = d.properties;
  if (!immunDptSim) return -1;
  return immunDptSim?.[otherCountryCode];
};

// GDP per Capita similiarty value in comparison with other countries --> index = countrycode
export const getGdpSim = (otherCountryCode) => (d) => {
  const { gdpSim } = d.properties;
  if (!gdpSim) return -1;
  return gdpSim?.[otherCountryCode];
};

export const getLinearScale = (values = [], range) =>
  scaleLinear({
    domain: [Math.min(...values), Math.max(...values)],
    range,
  });

export const getBandScale = (domain = [], range, padding = 0) =>
  scaleBand({
    domain,
    range,
    round: true,
    padding,
  });

export const formatAxisTick = (maxWidth, handler) => (text) => {
  const formatted = handler ? handler(text) : text; // apply custom formatter
  return formatted;
  // return getClippedText(formatted, maxWidth, 5); // then clip text, if it's too long
};

export const getInvertedBandScaleValue = (scale, point, variant) => {
  const step = scale?.step();
  const index = Math.round((point + 0.5 * scale.bandwidth()) / step) - 1;
  const domain = variant === ChartVariant.horizontal ? reverse(scale.domain()) : scale.domain();
  return domain[index];
};

export const getAxisTickLabelProps =
  (variant = AxisVariant.bottom) =>
  () => {
    let textAnchor = "middle";
    if (variant === AxisVariant.left) textAnchor = "end";
    if (variant === AxisVariant.right) textAnchor = "start";
    return {
      fill: Text.Default,
      fontSize: "0.875rem",
      dy: variant === AxisVariant.bottom ? 0 : "0.33em",
      textAnchor,
    };
  };

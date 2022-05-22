import { MIN_YEAR } from "./consts";

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
  console.log("!!!!! > ", d.properties);
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

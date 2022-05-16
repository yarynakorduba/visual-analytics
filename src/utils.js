import { MIN_YEAR } from "./consts";

export const getAvgLifeExpectancy = (displayedYear) => (d) => {
  const yearIndex = displayedYear - MIN_YEAR;
  const { lifeExpMale, lifeExpFemale } = d.properties;
  if (!lifeExpMale || !lifeExpFemale) return [255, 255, 255];
  const avgLifeExpectancy = (lifeExpMale?.[yearIndex] + lifeExpFemale?.[yearIndex]) / 2;
  return avgLifeExpectancy;
};

import React from "react";
import "./Pill.scss";

export const PillVariant = {
  male: "male",
  female: "female",
  negTrend: "negTrend",
  posTrend: "posTrend"
};

// Variant: male / female
const Pill = ({ children, variant }) => {
  return <div className={`Pill Pill--${variant}`}>{children}</div>;
};

export default Pill;

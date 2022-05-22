import React from "react";
import "./Pill.scss";

export const PillVariant = {
  male: "male",
  female: "female",
};

// Variant: male / female
const Pill = ({ children, variant }) => {
  return <div className={`Pill Pill--${variant}`}>{children}</div>;
};

export default Pill;

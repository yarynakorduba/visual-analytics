import React from "react";
import "./Pill.scss";

// Variant: men / women
const Pill = ({ children, variant }) => {
  return <div className={`Pill--${variant}`}>{children}</div>;
};

export default Pill;

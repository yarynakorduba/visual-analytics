import React, { useCallback } from "react";
import { defaultStyles, Tooltip, TooltipWithBounds } from "@visx/tooltip";
import { isNil, map } from "lodash";

const pointTooltipStyles = {
  ...defaultStyles,
  minWidth: "2rem",
  maxWidth: "20rem",
  textAlign: "center",
  pointerEvents: "none",
};

const xAxisTooltipStyles = {
  ...defaultStyles,
  minWidth: "2rem",
  maxWidth: "7rem",
  textAlign: "center",
  pointerEvents: "none",
  color: "white",
  background: "#1B2021",
  transform: "translate(calc(-50% - 0.6rem), -0.5rem)",
};

const yAxisTooltipStyles = {
  ...defaultStyles,
  minWidth: "2rem",
  maxWidth: "7rem",
  width: "fit-content",
  textAlign: "center",
  pointerEvents: "none",
  color: "white",
  transform: "translate(calc(-100% - 0.75rem), calc(-50% - 0.6rem))",
  background: "#1B2021",
};

function TooltipDatumIndicator({ color }) {
  return (
    <svg viewBox="0 0 4 4" width="0.5rem" height="0.5rem" style={{ margin: "0 0.5rem 0 0" }}>
      <circle cx="50%" cy="50%" r="2" fill={color} stroke="none" />
    </svg>
  );
}

export default function ChartTooltips({ pointTooltip, xTooltip, yTooltip }) {
  const renderPointTooltipText = useCallback(
    () =>
      map(pointTooltip?.tooltipData, (point) => (
        <div key={point?.data?.id}>
          <TooltipDatumIndicator color={point?.color} />
          {point?.data?.text?.map((str, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={index}>{str} </span>
          ))}
        </div>
      )),
    [pointTooltip]
  );

  const renderTooltip = useCallback(
    (tooltip, styles, isTooltipForPoint = false) => {
      if (isNil(tooltip?.tooltipData) || isNil(tooltip?.tooltipTop) || isNil(tooltip?.tooltipLeft)) {
        return null;
      }

      const TooltipComponent = isTooltipForPoint ? TooltipWithBounds : Tooltip;
      return (
        <TooltipComponent top={tooltip?.tooltipTop} left={tooltip?.tooltipLeft} style={styles}>
          <div>{isTooltipForPoint ? renderPointTooltipText() : tooltip?.tooltipData}</div>
        </TooltipComponent>
      );
    },
    [renderPointTooltipText]
  );

  return (
    <>
      {renderTooltip(xTooltip, xAxisTooltipStyles)}
      {renderTooltip(yTooltip, yAxisTooltipStyles)}
      {renderTooltip(pointTooltip, pointTooltipStyles, true)}
    </>
  );
}

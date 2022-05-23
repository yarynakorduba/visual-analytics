import { AxisLeft, AxisBottom } from "@visx/axis";
import { GridColumns, GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { ParentSize } from "@visx/responsive";
import React, { useCallback, useMemo } from "react";
import { flatMap, flow, isNil, uniq } from "lodash";

// import { ParentSize } from "@visx/responsive";
// import ChartOverlays from "./ChartOverlays";
// import Legend from "./Legend";
import ChartOverlays from "../ChartOverlays";
import ChartTooltips from "../ChartTooltips";
import { useTooltipConfigs } from "../hooks";
import { formatAxisTick, getAxisTickLabelProps, getLinearScale } from "../utils";
import { ChartVariant, AxisVariant } from "../consts";

const CHART_X_PADDING = 80;
const CHART_Y_PADDING = 24;

const GRAY = "#E1E5EA";

const getUniqueFlatValues = (prop, data) =>
  flow((d) => flatMap(d, (lineData) => lineData?.datapoints?.map((datum) => datum?.[prop])), uniq)(data);

/**
 * Line chart has two axes: one of them uses linear scale, and another uses band scale.
 * The vertical (default) variant renders vertical bars with band x-axis and linear y-axis.
 * The horizontal variant renders horizontal bars with linear x-axis and band y-axis.
 */

const LineChart = ({
  width = 900,
  height = 460,
  heading,
  variant = ChartVariant.vertical,
  data,
  formatXScale,
  formatYScale,
  numXAxisTicks = 8, // approximate
}) => {
  const cleanWidth = useMemo(() => {
    const clean = width - 2 * CHART_X_PADDING;
    return clean > 0 ? clean : 0;
  }, [width]);
  const cleanHeight = useMemo(() => height - 2 * CHART_Y_PADDING, [height]);

  const isVertical = useMemo(() => variant === ChartVariant.vertical, [variant]);

  const xValues = getUniqueFlatValues("valueX", data);
  const yValues = getUniqueFlatValues("valueY", data);

  const xTickWidth = useMemo(
    () => (isVertical ? cleanWidth / xValues.length : cleanWidth / numXAxisTicks),
    [cleanWidth, isVertical, numXAxisTicks, xValues.length]
  );

  const isEmpty = useMemo(() => !xValues?.length || !yValues?.length, [xValues?.length, yValues?.length]);

  // const { xScale, yScale } = useBandLinScale(xValues, yValues, cleanWidth, cleanHeight, isEmpty, isVertical);

  const xScale = getLinearScale(xValues, [0, cleanWidth]);
  const yScale = getLinearScale(yValues, [cleanHeight, 0]);

  const renderLine = useCallback(
    (lineData) => {
      const getX = (lineDatum) => {
        const x = xScale(lineDatum?.valueX);
        const offset = 0; //isVertical ? xScale.bandwidth() / 2 : 0;
        return x + offset;
      };

      const getY = (lineDatum) => {
        const y = yScale(lineDatum?.valueY);
        const offset = 0; //isVertical ? 0 : yScale.bandwidth() / 2;

        return y + offset;
      };
      return (
        <LinePath
          key={lineData?.label}
          data={lineData?.datapoints}
          x={getX}
          y={getY}
          stroke={lineData?.color}
          strokeWidth={2}
        />
      );
    },
    [isVertical, xScale, yScale]
  );

  // const labels = useMemo(
  //   () =>
  //     data?.map(
  //       ({ label, color }) => ({
  //         label,
  //         color,
  //         width: 20,
  //         height: 4,
  //       }),
  //     ),
  //   [data],
  // );

  const { pointTooltip, xTooltip, yTooltip, handleHover, handleMouseLeave, containerRef } = useTooltipConfigs(
    CHART_X_PADDING,
    CHART_Y_PADDING,
    cleanHeight,
    variant,
    xScale,
    yScale,
    formatXScale,
    formatYScale
  );

  return (
    <>
      <h2 level={2} isCentered>
        {heading}
      </h2>
      <div style={{ position: "relative" }}>
        <svg width={width} height={height} ref={containerRef}>
          <Group left={CHART_X_PADDING} top={CHART_Y_PADDING}>
            {variant === ChartVariant.vertical ? (
              <GridRows scale={yScale} width={cleanWidth} height={cleanHeight} stroke={GRAY} />
            ) : (
              <GridColumns scale={xScale} width={cleanWidth} height={cleanHeight} stroke={GRAY} />
            )}
            <AxisBottom
              top={cleanHeight}
              scale={xScale}
              hideTicks
              hideAxisLine
              tickFormat={formatAxisTick(xTickWidth, formatXScale)}
              tickLabelProps={getAxisTickLabelProps()}
              numTicks={5}
            />
            <AxisLeft
              scale={yScale}
              hideTicks
              hideAxisLine
              tickFormat={formatAxisTick(CHART_X_PADDING, formatYScale)}
              tickLabelProps={getAxisTickLabelProps(AxisVariant.left)}
            />
            {data?.map(renderLine)}
          </Group>
          <ChartOverlays
            offsetLeft={CHART_X_PADDING}
            offsetTop={CHART_Y_PADDING}
            width={cleanWidth}
            height={cleanHeight}
            xScale={xScale}
            yScale={yScale}
            dataSeries={data}
            variant={variant}
            onHover={handleHover}
            onMouseLeave={handleMouseLeave}
          />
        </svg>
        <ChartTooltips pointTooltip={pointTooltip} xTooltip={xTooltip} yTooltip={yTooltip} />
      </div>
    </>
  );
};

export default function ResponsiveLineChart({
  width = 900,
  height = 460,
  heading,
  variant = ChartVariant.vertical,
  data,
  formatXScale,
  formatYScale,
  numXAxisTicks = 8, // approximate
  isResponsive = true,
}) {
  const renderChart = useCallback(
    (chartWidth) => (
      <LineChart
        width={chartWidth}
        height={height}
        heading={heading}
        variant={variant}
        data={data}
        formatXScale={formatXScale}
        formatYScale={formatYScale}
        numXAxisTicks={numXAxisTicks} // approximate
      />
    ),
    [data, formatXScale, formatYScale, heading, height, numXAxisTicks, variant]
  );

  const renderResponsiveChart = useCallback(
    (parent) => {
      const responsiveWidth = !isNil(width) && Math.min(width, parent.width);
      return renderChart(responsiveWidth);
    },
    [renderChart, width]
  );

  if (!isResponsive) return renderChart(width);
  return <ParentSize>{renderResponsiveChart}</ParentSize>;
}

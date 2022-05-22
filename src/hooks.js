import { useCallback, useMemo, useState, useEffect } from "react";
import { useTooltipInPortal } from "@visx/tooltip";
import { area, point } from "@turf/turf";
import { GeoJsonLayer, TextLayer, ColumnLayer } from "@deck.gl/layers";
import { scaleSequential, scaleLinear } from "d3-scale";
import { interpolateGreens, interpolateInferno, interpolateBlues, interpolatePurples } from "d3-scale-chromatic";
import hexRgb from "hex-rgb";
import { isNil } from "lodash";

import {
  getLifeExpAll,
  getLifeExpFemale,
  getLifeExpMale,
  getImmunRateDpt,
  getBandScale,
  getLinearScale,
  getInvertedBandScaleValue,
} from "./utils";
import { MIN_AREA_TEXT_SHOWN, ChartVariant } from "./consts";

// DATASET
export const useDataset = () => {
  const [data, setData] = useState();
  useEffect(() => {
    fetch("countryData.geojson")
      .then((resp) => {
        return resp.json().then((res) => {
          return res.geojson;
        });
      })
      .then(setData)
      .catch((err) => console.error("Could not load data", err)); // eslint-disable-line
  }, []);

  return [data, setData];
};
const getPosition = (d) => {
  return point([d.properties.lon, d.properties.lat]).geometry.coordinates;
};

// LIFEEXPALL TEXT LAYER
export const useTextLifeExpAllLayer = (data, year) => {
  const getText = useCallback(
    (d) => {
      const lifeExpAll = getLifeExpAll(year)(d);
      if ((lifeExpAll || 0) <= 0) return "";
      const countryCode = d.properties.ISO_A3;
      const countryArea = area(d.geometry);
      return countryArea > MIN_AREA_TEXT_SHOWN ? `${countryCode} | ${Math.round(lifeExpAll)}y.` : "";
    },
    [year]
  );

  const getColor = useCallback(
    (d) => {
      const avgLifeExpectancy = getLifeExpAll(year)(d);
      if (avgLifeExpectancy > 70) return [0, 0, 255, 255];
      return [0, 0, 255, 255];
    },
    [year]
  );

  const getTextPosition = useCallback((d) => {
    const position = getPosition(d);
    return [position[0], position[1] - 1.5];
  }, []);

  const layer = useMemo(
    () =>
      data?.features &&
      new TextLayer({
        id: "textLifeExpAll",
        data: data?.features,
        pickable: true,
        getPosition: getTextPosition,
        getText,
        getSize: 8,
        getAngle: 0,
        getTextAnchor: "middle",
        getAlignmentBaseline: "center",
        getColor,
        background: true,
        billboard: false,
        backgroundColor: [255, 255, 255, 100],
        fontSettings: {
          sdf: true,
          radius: 80,
          cutoff: 0.23,
        },
      }),
    [data?.features, getColor, getTextPosition]
  );
  return layer;
};

// LIFEEXPALL TEXT LAYER
export const useTextLifeExpGenderLayer = (data, year) => {
  const getText = useCallback(
    (d) => {
      const lifeExpMale = getLifeExpMale(year)(d);
      const lifeExpFemale = getLifeExpFemale(year)(d);
      if (((lifeExpMale && lifeExpFemale) || 0) <= 0) return "";
      const countryCode = d.properties.ISO_A3;
      const countryArea = area(d.geometry);
      return `${countryCode} \n M ${Math.round(lifeExpMale)}y.|F ${Math.round(lifeExpFemale)}y.`;
    },
    [year]
  );

  const getColor = useCallback(
    (d) => {
      const avgLifeExpectancy = getLifeExpAll(year)(d);
      if (avgLifeExpectancy > 70) return [0, 0, 255, 255];
      return [0, 0, 255, 255];
    },
    [year]
  );

  const getTextPosition = useCallback((d) => {
    const position = getPosition(d);
    return [position[0], position[1] - 2];
  }, []);

  const layer = useMemo(
    () =>
      data?.features &&
      new TextLayer({
        id: "textLifeExpGender",
        data: data?.features,
        pickable: true,
        getPosition: getTextPosition,
        getText,
        getSize: 10,
        getAngle: 0,
        getTextAnchor: "middle",
        getAlignmentBaseline: "center",
        getColor,
        background: true,
        billboard: false,
        backgroundColor: [255, 255, 255, 100],
        fontSettings: {
          sdf: true,
          radius: 80,
          cutoff: 0.23,
        },
      }),
    [data?.features, getColor, getTextPosition]
  );
  return layer;
};

const formatRGB = (rgb) => rgb.match(/\d+/g).map(Number);
const getPolygon = (d) => d.geometry.coordinates;
const colorScale = (interpolation) => scaleSequential(interpolation).domain([50, 90]);

// GROUND LAYER
export const useGeojsonLayer = (data, year, onSelect) => {
  const getFillColor = useCallback(
    (d) => {
      const value = getImmunRateDpt(year)(d);
      const color = colorScale(interpolateGreens)(value);
      if (color.startsWith("#")) {
        const { red, green, blue } = hexRgb(color);
        return [red, green, blue];
      } else {
        return formatRGB(color);
      }
    },
    [year]
  );

  const layer = useMemo(
    () =>
      new GeoJsonLayer({
        id: "ground-layer",
        data,
        stroked: true,
        getLineColor: [255, 255, 255, 255],
        getLineWidth: 1,
        lineWidthScale: 2,
        lineWidthMinPixels: 0.5,
        getFillColor,
        getPolygon,
        extruded: false,
        pickable: true, // enables picking of the elements
        onClick: (d) => {
          onSelect(d);
        },
      }),
    [data, getFillColor]
  );
  if (!data?.features) return undefined;
  return layer;
};

const elevationScale = scaleLinear().range([50, 1000]).domain([50, 100]);

// LIFE EXP ALL
export const useColLifeExpAllLayer = (data, year) => {
  const getElevation = useCallback(
    (d) => {
      const lifeExp = getLifeExpAll(year)(d);

      return elevationScale(lifeExp);
    },
    [year]
  );

  const getFillColor = useCallback(
    (d) => {
      const lifeExp = getLifeExpAll(year)(d);
      const color = colorScale(interpolateInferno)(lifeExp);
      if (color.startsWith("#")) {
        const { red, green, blue } = hexRgb(color);
        return [red, green, blue];
      } else {
        return formatRGB(color);
      }
    },
    [year]
  );

  const layer = useMemo(
    () =>
      new ColumnLayer({
        id: "colLifeExpAll",
        data: data?.features,

        /* props from ColumnLayer class */

        angle: -45,
        coverage: 2,
        diskResolution: 1000,
        elevationScale: 1000,
        extruded: true,
        getElevation,
        getFillColor,
        getLineWidth: 400,
        getPosition,
        material: false,
        radius: 25000,
        stroked: false,
        highlightColor: [0, 0, 128, 128],
        opacity: 0.5,
      }),
    [data?.features, getElevation, getFillColor]
  );

  if (!data?.features) return undefined;

  return layer;
};

export const useColLifeExpMaleLayer = (data, year) => {
  const getElevation = useCallback(
    (d) => {
      const lifeExp = getLifeExpMale(year)(d);

      return elevationScale(lifeExp);
    },
    [year]
  );

  const getColPosition = useCallback((d) => {
    const position = getPosition(d);
    return [position[0] - 0.5, position[1]];
  }, []);

  const getFillColor = useCallback(
    (d) => {
      const lifeExp = getLifeExpMale(year)(d);
      const color = colorScale(interpolateBlues)(lifeExp);
      if (color.startsWith("#")) {
        const { red, green, blue } = hexRgb(color);
        return [red, green, blue];
      } else {
        return formatRGB(color);
      }
    },
    [year]
  );

  const layer = useMemo(
    () =>
      new ColumnLayer({
        id: "colLifeExpMale",
        data: data?.features,

        /* props from ColumnLayer class */

        angle: -45,
        coverage: 2,
        diskResolution: 1000,
        elevationScale: 1000,
        extruded: true,
        getElevation,
        getFillColor,
        getLineWidth: 400,
        getPosition: getColPosition,
        material: false,
        radius: 20000,
        stroked: false,
        highlightColor: [0, 0, 128, 128],
        opacity: 0.5,
      }),
    [data?.features, getElevation, getFillColor, getColPosition]
  );

  if (!data?.features) return undefined;

  return layer;
};

export const useColLifeExpFemaleLayer = (data, year) => {
  const getElevation = useCallback(
    (d) => {
      const lifeExp = getLifeExpFemale(year)(d);

      return elevationScale(lifeExp);
    },
    [year]
  );

  const getColPosition = useCallback((d) => {
    const position = getPosition(d);
    return [position[0] + 0.5, position[1]];
  }, []);

  const getFillColor = useCallback(
    (d) => {
      const lifeExp = getLifeExpMale(year)(d);
      const color = colorScale(interpolatePurples)(lifeExp);
      if (color.startsWith("#")) {
        const { red, green, blue } = hexRgb(color);
        return [red, green, blue];
      } else {
        return formatRGB(color);
      }
    },
    [year]
  );

  const layer = useMemo(
    () =>
      new ColumnLayer({
        id: "colLifeExpFemale",
        data: data?.features,

        /* props from ColumnLayer class */

        angle: -45,
        coverage: 2,
        diskResolution: 1000,
        elevationScale: 1000,
        extruded: true,
        getElevation,
        getFillColor,
        getLineWidth: 400,
        getPosition: getColPosition,
        material: false,
        radius: 20000,
        stroked: false,
        highlightColor: [0, 0, 128, 128],
        opacity: 0.5,
      }),
    [data?.features, getElevation, getFillColor, getColPosition]
  );

  if (!data?.features) return undefined;

  return layer;
};

export const useBandLinScale = (xValues, yValues, width, height, isChartEmpty, isChartVertical, bandPadding = 0) =>
  useMemo(() => {
    if (isChartEmpty) {
      return {
        yScale: (v) => 0,
        xScale: (v) => 0,
      };
    }

    return {
      xScale: isChartVertical ? getBandScale(xValues, [0, width], bandPadding) : getLinearScale(xValues, [0, width]),
      yScale: isChartVertical ? getLinearScale(yValues, [height, 0]) : getBandScale(yValues, [height, 0], bandPadding),
    };
  }, [bandPadding, height, isChartEmpty, isChartVertical, width, xValues, yValues]);

export const useTooltipConfigs = (
  xPadding,
  yPadding,
  chartHeight,
  variant,
  xScale,
  yScale,
  formatXScale,
  formatYScale
) => {
  const [pointTooltip, setPointTooltip] = useState();
  const [xTooltip, setXTooltip] = useState();
  const [yTooltip, setYTooltip] = useState();

  const { containerRef, containerBounds } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

  const handleMouseLeave = (event, pointGroup) => {
    const noTooltipData = {
      tooltipLeft: undefined,
      tooltipTop: undefined,
      tooltipData: undefined,
    };

    if (pointGroup) setPointTooltip(noTooltipData);

    setYTooltip(noTooltipData);
    setXTooltip(noTooltipData);
  };

  const getAxisTooltipData = useCallback(
    (scale, isScaleLinear, formatter, coordinate) => {
      if (isNil(coordinate)) return undefined;
      const value = isScaleLinear ? scale.invert(coordinate) : getInvertedBandScaleValue(scale, coordinate, variant);

      return formatter ? formatter(value) : value;
    },
    [variant]
  );

  const handleHover = useCallback(
    (event, pointGroup) => {
      const top = "clientY" in event ? event.clientY : 0;
      const left = "clientX" in event ? event.clientX : 0;
      setPointTooltip({
        tooltipLeft: left - containerBounds.left,
        tooltipTop: top - containerBounds.top,
        tooltipData: pointGroup?.points,
      });
      setYTooltip({
        tooltipLeft: xPadding,
        tooltipTop: top - containerBounds.top,
        tooltipData: getAxisTooltipData(
          yScale,
          true,
          formatYScale,
          top > yPadding + containerBounds.top ? top - yPadding - containerBounds.top : 0
        ),
      });
      setXTooltip({
        tooltipLeft: left - containerBounds.left,
        tooltipTop: chartHeight + yPadding,
        tooltipData: getAxisTooltipData(
          xScale,
          true,
          formatXScale,
          left > xPadding + containerBounds.left ? left - xPadding - containerBounds.left : 0
        ),
      });
    },
    [
      containerBounds,
      xPadding,
      getAxisTooltipData,
      yScale,
      variant,
      formatYScale,
      yPadding,
      chartHeight,
      xScale,
      formatXScale,
    ]
  );

  return {
    pointTooltip,
    xTooltip,
    yTooltip,
    handleHover,
    handleMouseLeave,
    containerRef,
  };
};

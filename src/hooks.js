import { useCallback, useMemo, useState, useEffect } from "react";
import { centroid, area } from "@turf/turf";
import { GeoJsonLayer, TextLayer, ColumnLayer } from "@deck.gl/layers";

import { scaleSequential, scaleLinear } from "d3-scale";
import { interpolateGreens, interpolateInferno } from "d3-scale-chromatic";
import hexRgb from "hex-rgb";

import { getAvgLifeExpectancy } from "./utils";
import { MIN_AREA_TEXT_SHOWN } from "./consts";

export const useDataset = () => {
  const [data, setData] = useState();
  useEffect(() => {
    fetch("countryData.geojson")
      .then((resp) => {
        return resp.json();
      })
      .then(setData)
      .catch((err) => console.error("Could not load data", err)); // eslint-disable-line
  }, []);

  return [data, setData];
};
const getPosition = (d) => {
  const countryCentroid = centroid(d.geometry);
  return countryCentroid.geometry.coordinates;
};
export const useTextLayer = (data, year) => {
  const getText = useCallback(
    (d) => {
      const avgLifeExpectancy = getAvgLifeExpectancy(year)(d);
      const countryName = d.properties.ISO_A3;
      if ((avgLifeExpectancy || 0) <= 0) return "";
      const countryArea = area(d.geometry);
      return countryArea > MIN_AREA_TEXT_SHOWN ? `${countryName} ${Math.round(avgLifeExpectancy)}y.` : "";
    },
    [year]
  );

  const getColor = useCallback(
    (d) => {
      const avgLifeExpectancy = getAvgLifeExpectancy(year)(d);
      if (avgLifeExpectancy > 70) return [0, 0, 255, 255];
      return [0, 0, 255, 255];
    },
    [year]
  );

  const getTextPosition = useCallback((d) => {
    const position = getPosition(d);
    console.log("ABCD", [position[0] - 10, position[1]]);
    return [position[0] - 1, position[1] - 1];
  }, []);

  const layer = useMemo(
    () =>
      data?.features &&
      new TextLayer({
        id: "text-layer",
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
      }),
    [data?.features, getColor, getTextPosition]
  );
  return layer;
};

const formatRGB = (rgb) => rgb.match(/\d+/g).map(Number);
const getPolygon = (d) => d.geometry.coordinates;
const colorScale = (interpolation) => scaleSequential(interpolation).domain([50, 90]);

export const useGeojsonLayer = (data, year) => {
  const getFillColor = useCallback(
    (d) => {
      const avgLifeExpectancy = getAvgLifeExpectancy(year)(d);
      const color = colorScale(interpolateGreens)(avgLifeExpectancy);
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
      }),
    [data, getFillColor]
  );
  if (!data?.features) return undefined;
  return layer;
};

const elevationScale = scaleLinear().range([50, 1000]).domain([50, 100]);

export const useColumnLayer = (data, year) => {
  const getElevation = useCallback(
    (d) => {
      const avgLifeExpectancy = getAvgLifeExpectancy(year)(d);

      return elevationScale(avgLifeExpectancy);
    },
    [year]
  );

  const getFillColor = useCallback(
    (d) => {
      const avgLifeExpectancy = getAvgLifeExpectancy(year)(d);
      const color = colorScale(interpolateInferno)(avgLifeExpectancy);
      console.log("what a fuck", color);
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
        id: "column-layer",
        data: data?.features,

        /* props from ColumnLayer class */

        angle: -45,
        coverage: 2,
        diskResolution: 1000,
        elevationScale: 1000,
        extruded: true,
        // filled: true,
        getElevation, //: getElevation(),
        getFillColor,
        // getLineColor: [0, 0, 0],
        // getLineWidth: 200,
        getPosition,
        // lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
        // lineWidthMinPixels: 0,
        // lineWidthScale: 1,
        // lineWidthUnits: 'meters',
        material: false,
        // offset: [0, 0],
        radius: 25000,
        // radiusUnits: 'meters',
        stroked: false,
        // vertices: null,
        // wireframe: false,

        /* props inherited from Layer class */

        // autoHighlight: false,
        // coordinateOrigin: [0, 0, 0],
        // coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        highlightColor: [0, 0, 128, 128],
        // modelMatrix: null,
        opacity: 0.5,
        // pickable: true,
        // visible: true,
        // wrapLongitude: false,
      }),
    [data?.features, getElevation, getFillColor]
  );

  if (!data?.features) return undefined;

  return layer;
};

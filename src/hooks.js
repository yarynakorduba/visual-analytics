import { useCallback, useMemo, useState, useEffect } from "react";
import { centroid, area } from "@turf/turf";
import { GeoJsonLayer, TextLayer } from "@deck.gl/layers";

import { scaleSequential } from "d3-scale";
import { interpolateYlGn } from "d3-scale-chromatic";
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

export const useTextLayer = (data, year) => {
  const getTextPosition = useCallback((d) => {
    const countryCentroid = centroid(d.geometry);
    return countryCentroid.geometry.coordinates;
  }, []);

  const getText = useCallback(
    (d) => {
      const avgLifeExpectancy = getAvgLifeExpectancy(year)(d);
      if ((avgLifeExpectancy || 0) <= 0) return "";
      const countryArea = area(d.geometry);
      return countryArea > MIN_AREA_TEXT_SHOWN ? `${Math.round(avgLifeExpectancy)}y.` : "";
    },
    [year]
  );
  const layer = useMemo(
    () =>
      data?.features &&
      new TextLayer({
        id: "text-layer",
        data: data?.features,
        pickable: true,
        getPosition: getTextPosition,
        getText,
        getSize: 16,
        getAngle: 0,
        getTextAnchor: "middle",
        getAlignmentBaseline: "center",
        getColor: (d) => [255, 0, 0],
      }),
    [data?.features, getText, getTextPosition]
  );
  return layer;
};

const formatRGB = (rgb) => rgb.match(/\d+/g).map(Number);
const getPolygon = (d) => d.geometry.coordinates;
const colorScale = scaleSequential(interpolateYlGn).domain([30, 80]);

export const useGeojsonLayer = (data, year) => {
  const getFillColor = useCallback(
    (d) => {
      const avgLifeExpectancy = getAvgLifeExpectancy(year)(d);
      const color = colorScale(avgLifeExpectancy);
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
        getLineColor: [125, 125, 125, 255],
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

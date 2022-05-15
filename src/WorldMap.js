import React, { useState, useEffect, useCallback } from "react";
import { Map } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, TextLayer } from "@deck.gl/layers";
import { LightingEffect, AmbientLight, _SunLight as SunLight } from "@deck.gl/core";
import { scaleSequential } from "d3-scale";
import { interpolateYlGn } from "d3-scale-chromatic";
import hexRgb from "hex-rgb";
import { centroid } from "@turf/turf";

const MAPBOX_TOKEN = "pk.eyJ1IjoieWFyeWNrYSIsImEiOiJjazd0ZzAyYXYweGFtM2dxdHBxN2RxbnJmIn0.e0TnDHhdtb5qz3pfPbAgmw"; // Set your mapbox token here
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  latitude: 49.254,
  longitude: -123.13,
  zoom: 1,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

const formatRGB = (rgb) => rgb.match(/\d+/g).map(Number);

const getPolygon = (d) => d.geometry.coordinates;

const colorScale = scaleSequential(interpolateYlGn).domain([30, 80]);

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const dirLight = new SunLight({
  timestamp: Date.UTC(2019, 7, 1, 22),
  color: [255, 255, 255],
  intensity: 1.0,
  _shadow: true,
});

const MIN_YEAR = 1960;
const MAX_YEAR = 2020;
// DeckGL react component
function WorldMap() {
  const [data, setData] = useState();
  const [year, setYear] = useState(MAX_YEAR);
  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ ambientLight, dirLight });
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });

  useEffect(() => {
    /* global fetch */
    fetch("countryData.geojson")
      .then((resp) => {
        return resp.json();
      })
      .then(setData)
      .catch((err) => console.error("Could not load data", err)); // eslint-disable-line
  }, []);
  const getAvgLifeExpectancy = useCallback(
    (d) => {
      const yearIndex = year - MIN_YEAR;
      const { lifeExpMale, lifeExpFemale } = d.properties;
      if (!lifeExpMale || !lifeExpFemale) return [255, 255, 255];
      const avgLifeExpectancy = (lifeExpMale?.[yearIndex] + lifeExpFemale?.[yearIndex]) / 2;
      return avgLifeExpectancy;
    },
    [year]
  );
  const getFillColor = useCallback(
    (d) => {
      const avgLifeExpectancy = getAvgLifeExpectancy(d);
      const color = colorScale(avgLifeExpectancy);
      if (color.startsWith("#")) {
        const { red, green, blue } = hexRgb(color);
        return [red, green, blue];
      } else {
        return formatRGB(color);
      }
    },
    [getAvgLifeExpectancy]
  );

  const getTextPosition = useCallback((d) => {
    const centr = centroid(d.geometry);
    return centr.geometry.coordinates;
  }, []);

  const getText = (d) => {
    const avgLifeExpectancy = getAvgLifeExpectancy(d);
    if ((avgLifeExpectancy || 0) <= 0) return "";
    return `${Math.round(avgLifeExpectancy)}`;
  };
  const geoJsonLayer = new GeoJsonLayer({
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
  });
  const textLayer = new TextLayer({
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
  });

  if (!data) return "Loading...";
  return (
    <DeckGL
      layers={[geoJsonLayer, textLayer]}
      effects={effects}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
    >
      <Map reuseMaps preventStyleDiffing={true} mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_TOKEN} />
    </DeckGL>
  );
}

export default WorldMap;

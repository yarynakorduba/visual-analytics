import React, { useState, useEffect } from "react";
import { Map } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { LightingEffect, AmbientLight, _SunLight as SunLight } from "@deck.gl/core";
import { scaleLinear } from "@visx/scale";

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

const colorScale = scaleLinear({
  domain: [0, 100],
  range: ["#9772FB", "#fdce19"],
});

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

// DeckGL react component
function WorldMap() {
  const [data, setData] = useState();
  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ ambientLight, dirLight });
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });

  useEffect(() => {
    /* global fetch */
    fetch("countries.geojson")
      .then((resp) => {
        return resp.json();
      })
      .then(setData)
      .catch((err) => console.error("Could not load data", err)); // eslint-disable-line
  }, []);

  const layers = new GeoJsonLayer({
    id: "ground",
    data,
    stroked: true,
    getLineColor: [125, 125, 125, 255],
    getLineWidth: 1,
    lineWidthScale: 2,
    lineWidthMinPixels: 0.5,
    getFillColor: (d) =>
      d.properties.lifeExpectancy ? formatRGB(colorScale(d.properties.lifeExpectancy["1960"])) : [0, 100, 1, 25],
    getPolygon: (d) => d.geometry.coordinates,
    extruded: false,
  });

  if (!data || !layers) return "Loading...";
  return (
    <DeckGL layers={[layers]} effects={effects} initialViewState={INITIAL_VIEW_STATE} controller={true}>
      <Map reuseMaps preventStyleDiffing={true} mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_TOKEN} />
    </DeckGL>
  );
}

export default WorldMap;

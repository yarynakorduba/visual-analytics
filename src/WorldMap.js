import React, { useState, useEffect, useCallback } from "react";
import { Map } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { LightingEffect, AmbientLight, _SunLight as SunLight } from "@deck.gl/core";

import { MIN_YEAR, MAX_YEAR } from "./consts";
import { useColumnLayer, useDataset, useGeojsonLayer, useTextLayer } from "./hooks";

const MAPBOX_TOKEN = "pk.eyJ1IjoieWFyeWNrYSIsImEiOiJjazd0ZzAyYXYweGFtM2dxdHBxN2RxbnJmIn0.e0TnDHhdtb5qz3pfPbAgmw"; // Set your mapbox token here
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  latitude: 49.254,
  longitude: 0.13,
  zoom: 1.25,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

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
  const [year, setYear] = useState(MAX_YEAR);
  const [data] = useDataset();

  const geoJsonLayer = useGeojsonLayer(data, year);
  const textLayer = useTextLayer(data, year);
  const columnLayer = useColumnLayer(data, year);

  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ ambientLight, dirLight });
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });

  const filterLayers = ({ layer, viewport }) => {
    if (layer.id === "text-layer") return viewport.zoom > 2;
    return true;
  };
  console.log("AAAA --> ", columnLayer);
  const layers = [geoJsonLayer, textLayer, columnLayer].filter((l) => l);
  console.log("AAAAA 000 /, ", layers);
  if (!data?.features) return "Loading...";
  return (
    <DeckGL
      layers={layers}
      layerFilter={filterLayers}
      effects={effects}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
    >
      <Map reuseMaps preventStyleDiffing={true} mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_TOKEN} />
    </DeckGL>
  );
}

export default WorldMap;

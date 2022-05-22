import React, { useState, useEffect, useCallback } from "react";
import { Map } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { LightingEffect, AmbientLight, _SunLight as SunLight, _GlobeView as GlobeView } from "@deck.gl/core";

import { MIN_YEAR, MAX_YEAR } from "./consts";
import {
  useColLifeExpAllLayer,
  useColLifeExpMaleLayer,
  useColLifeExpFemaleLayer,
  useDataset,
  useGeojsonLayer,
  useTextLayer,
} from "./hooks";

const MAPBOX_TOKEN = "pk.eyJ1IjoieWFyeWNrYSIsImEiOiJjazd0ZzAyYXYweGFtM2dxdHBxN2RxbnJmIn0.e0TnDHhdtb5qz3pfPbAgmw"; // Set your mapbox token here
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  latitude: 48.3,
  longitude: 32.31,
  zoom: 0.75,
  maxZoom: 6,
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
  const colLifeExpAll = useColLifeExpAllLayer(data, year);
  const colLifeExpMale = useColLifeExpMaleLayer(data, year);
  const colLifeExpFemale = useColLifeExpFemaleLayer(data, year);

  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ ambientLight, dirLight });
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });

  const filterLayers = ({ layer, viewport }) => {
    if (layer.id === "text-layer") return viewport.zoom > 2;
    if (layer.id === "colLifeExpAll") return viewport.zoom < 4;
    if (layer.id === "colLifeExpMale") return viewport.zoom > 4 && viewport.zoom < 6;
    if (layer.id === "colLifeExpFemale") return viewport.zoom > 4 && viewport.zoom < 6;
    return true;
  };
  const layers = [geoJsonLayer, textLayer, colLifeExpAll, colLifeExpMale, colLifeExpFemale].filter((l) => l);
  if (!data?.features) return "Loading...";
  return (
    <DeckGL
      layers={layers}
      layerFilter={filterLayers}
      // effects={effects}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      views={[new GlobeView({ width: "100%", x: "0%" })]}
    >
      {/* <GlobeView id="map" width="50%" controller={true}> */}
      {/* <Map reuseMaps preventStyleDiffing={true} mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_TOKEN} /> */}
      {/* </GlobeView> */}
    </DeckGL>
  );
}

export default WorldMap;

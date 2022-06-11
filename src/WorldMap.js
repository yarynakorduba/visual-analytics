import React, { useState } from "react";
import { Map } from "react-map-gl";
import DeckGL from "@deck.gl/react";

import { MAX_YEAR } from "./consts";
import {
  useColLifeExpAllLayer,
  useColLifeExpMaleLayer,
  useColLifeExpFemaleLayer,
  useDataset,
  useGeojsonLayer,
  useTextLifeExpAllLayer,
  useTextLifeExpGenderLayer,
} from "./hooks";
import { getLifeExpAll, getLifeExpFemale, getLifeExpMale } from "./utils";

import InfoPopup from "./InfoPopup/InfoPopup";
import MapLegend from "./MapLegend/MapLegend";

const MAPBOX_TOKEN = "pk.eyJ1IjoieWFyeWNrYSIsImEiOiJjazd0ZzAyYXYweGFtM2dxdHBxN2RxbnJmIn0.e0TnDHhdtb5qz3pfPbAgmw"; // Set your mapbox token here
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  latitude: 10.3,
  longitude: 18.31,
  zoom: 2,
  minZoom: 2,
  maxZoom: 8,
  pitch: 45,
  bearing: 0,
  maxPitch: 60,
  minPitch: 20,

  width: "100vw",
  height: "100vh",
};

// console.log("MAP STYLE -- >", MAP_STYLE);

// DeckGL react component
function WorldMap() {
  const [year, setYear] = useState(MAX_YEAR);
  const [data] = useDataset();

  const [selectedCountry, setSelectedCountry] = useState(undefined);
  const textLifeExpAll = useTextLifeExpAllLayer(data, year);
  const textLifeExpGender = useTextLifeExpGenderLayer(data, year, "textLifeExpGender", 1.2, 12);
  const textLifeExpGenderClose = useTextLifeExpGenderLayer(data, year, "textLifeExpGenderClose", 0.5, 12);

  const [geoJsonLayer, colorScale] = useGeojsonLayer(data, year, setSelectedCountry);
  const colLifeExpAll = useColLifeExpAllLayer(data, year);

  const colLifeExpMale = useColLifeExpMaleLayer(data, year, "colLifeExpMale", 15000, 0.5, -0.5);

  const colLifeExpFemale = useColLifeExpFemaleLayer(data, year, "colLifeExpFemale", 15000, 0.5, 0.5);

  const onViewStateChange = ({ viewState, oldViewState }) => {
    if (viewState.longitude > 90) {
      viewState.longitude = 90;
    } else if (viewState.longitude < 0) {
      viewState.longitude = 0;
    }
    if (viewState.latitude > 90) {
      viewState.latitude = 90;
    } else if (viewState.latitude < 0) {
      viewState.latitude = 0;
    }

    // update mapbox
    return viewState;
  };

  const displayTooltip = (info) => {
    if (!info || !info.object) return undefined;

    if (info.layer?.id === "colLifeExpFemale") return `Female: ${Math.round(getLifeExpFemale(year)(info.object))}y.`;

    if (info.layer?.id === "colLifeExpMale") return `Male: ${Math.round(getLifeExpMale(year)(info.object))}y.`;

    if (info.layer?.id === "colLifeExpAll") return `Avg: ${Math.round(getLifeExpAll(year)(info.object))}y.`;
  };

  const filterLayers = ({ layer, viewport }) => {
    if (layer.id === "textLifeExpAll") return viewport.zoom > 3 && viewport.zoom <= 4;
    if (layer.id === "textLifeExpGender") return viewport.zoom > 4;

    if (layer.id === "colLifeExpAll") return viewport.zoom < 4;

    if (layer.id === "colLifeExpMale") return viewport.zoom > 4;

    if (layer.id === "colLifeExpFemale") return viewport.zoom > 4;
    return true;
  };

  const layers = [
    geoJsonLayer,
    textLifeExpAll,
    textLifeExpGender,
    colLifeExpAll,
    colLifeExpMale,
    colLifeExpFemale,
  ].filter((l) => l);
  if (!geoJsonLayer || !data?.features) return "Loading...";
  return (
    <div>
      <DeckGL
        layers={layers}
        layerFilter={filterLayers}
        initialViewState={INITIAL_VIEW_STATE}
        onViewStateChange={onViewStateChange}
        controller={true}
        getTooltip={displayTooltip}
      >
        <Map
          reuseMaps
          preventStyleDiffing={true}
          mapStyle={MAP_STYLE}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ background: "red" }}
        />
      </DeckGL>
      {selectedCountry && <InfoPopup country={selectedCountry} year={year} />}
      <MapLegend scale={colorScale} />
    </div>
  );
}

export default WorldMap;

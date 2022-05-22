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

import InfoPopup from "./InfoPopup/InfoPopup";

const MAPBOX_TOKEN = "pk.eyJ1IjoieWFyeWNrYSIsImEiOiJjazd0ZzAyYXYweGFtM2dxdHBxN2RxbnJmIn0.e0TnDHhdtb5qz3pfPbAgmw"; // Set your mapbox token here
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  latitude: 28.3,
  longitude: 22.31,
  zoom: 1,
  minZoom: 2,
  maxZoom: 6,
  pitch: 40,
  bearing: 0,
  maxPitch: 60,
  minPitch: 30,
  width: "100vw",
  height: "100vh",
};

// DeckGL react component
function WorldMap() {
  const [year, setYear] = useState(MAX_YEAR);
  const [data] = useDataset();

  const [selectedCountry, setSelectedCountry] = useState(undefined);
  const textLifeExpAll = useTextLifeExpAllLayer(data, year);
  const textLifeExpGender = useTextLifeExpGenderLayer(data, year);
  const geoJsonLayer = useGeojsonLayer(data, year, setSelectedCountry);
  const colLifeExpAll = useColLifeExpAllLayer(data, year);
  const colLifeExpMale = useColLifeExpMaleLayer(data, year);
  const colLifeExpFemale = useColLifeExpFemaleLayer(data, year);

  const onViewStateChange = ({ viewState, oldViewState, ...rest }) => {
    if (Math.abs(viewState?.longitude - oldViewState?.longitude) > 80) {
      viewState.longitude = Math.sign(oldViewState?.longitude) * 80;
    }

    // update mapbox
    return viewState;
  };

  const filterLayers = ({ layer, viewport }) => {
    if (layer.id === "textLifeExpAll") return viewport.zoom < 4;
    if (layer.id === "textLifeExpGender") return viewport.zoom > 4 && viewport.zoom < 6;
    if (layer.id === "colLifeExpAll") return viewport.zoom < 4;
    if (layer.id === "colLifeExpMale") return viewport.zoom >= 4 && viewport.zoom < 6;
    if (layer.id === "colLifeExpFemale") return viewport.zoom >= 4 && viewport.zoom < 6;
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
  if (!data?.features) return "Loading...";
  return (
    <div>
      <DeckGL
        layers={layers}
        layerFilter={filterLayers}
        // effects={effects}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        // views={[new GlobeView({ width: "100%", x: "0%" })]}
      >
        {/* <GlobeView id="map" width="50%" controller={true}> */}
        <Map reuseMaps preventStyleDiffing={true} mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_TOKEN} />
        {/* </GlobeView> */}
      </DeckGL>
      {selectedCountry && <InfoPopup country={selectedCountry} year={year} />}
    </div>
  );
}

export default WorldMap;

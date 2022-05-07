/// app.js
import React, { useEffect, useState } from "react";
import Map, { Source, Layer } from "react-map-gl";

const MAPBOX_TOKEN = "pk.eyJ1IjoieWFyeWNrYSIsImEiOiJjazd0ZzAyYXYweGFtM2dxdHBxN2RxbnJmIn0.e0TnDHhdtb5qz3pfPbAgmw"; // Set your mapbox token here

const dataLayer = {
  id: "data",
  type: "fill",
  paint: {
    "fill-color": {
      property: "lifeExpectancy",
      stops: [
        [0, "#3288bd"],
        [10, "#66c2a5"],
        [20, "#abdda4"],
        [30, "#e6f598"],
        [40, "#ffffbf"],
        [50, "#fee08b"],
        [60, "#fdae61"],
        [70, "#f46d43"],
        [80, "#d53e4f"],
      ],
    },
  },
};

// DeckGL react component
function WorldMap() {
  const [data, setData] = useState();

  useEffect(() => {
    /* global fetch */
    fetch("countries.geojson")
      .then((resp) => {
        return resp.json();
      })
      .then(setData)
      .catch((err) => console.error("Could not load data", err)); // eslint-disable-line
  }, []);

  if (!data) return "Loading...";
  return (
    <Map
      initialViewState={{ zoom: 1 }}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken={MAPBOX_TOKEN}
      interactiveLayerIds={["data"]}
    >
      <Source type="geojson" data={data}>
        <Layer {...dataLayer} />
      </Source>
    </Map>
  );
}

export default WorldMap;

// App.js
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getDistance } from "geolib";

// Fix leaflet's default icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function App() {
  // Starting and ending coordinates
  const startCoords = { latitude: 22.1696, longitude: 91.4996 };
  const endCoords = { latitude: 22.2637, longitude: 91.7159 };

  const speedKmph = 20; // speed in km/h
  const speedMps = (speedKmph * 1000) / 3600; // speed in meters per second
  const refreshRate = 2; // screen refresh rate in FPS
  const refreshInterval = 1000 / refreshRate; // refresh interval in milliseconds

  // Calculate total distance between start and end points
  const totalDistance = getDistance(startCoords, endCoords); // in meters

  const [currentPosition, setCurrentPosition] = useState(startCoords);
  const [distanceTraveled, setDistanceTraveled] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (distanceTraveled < totalDistance) {
        // Calculate the fraction of the journey completed
        const fraction = distanceTraveled / totalDistance;

        // Calculate new coordinates
        const newLat =
          startCoords.latitude +
          fraction * (endCoords.latitude - startCoords.latitude);
        const newLng =
          startCoords.longitude +
          fraction * (endCoords.longitude - startCoords.longitude);

        setCurrentPosition({ latitude: newLat, longitude: newLng });
        setDistanceTraveled((prev) => prev + speedMps * (refreshInterval / 1000));
      } else {
        clearInterval(interval); // Stop the interval when the destination is reached
      }
    }, refreshInterval);

    // Clean up interval on component unmount or dependencies change
    return () => clearInterval(interval);
  }, [
    distanceTraveled,
    speedMps,
    refreshInterval,
    totalDistance,
    startCoords.latitude,
    startCoords.longitude,
    endCoords.latitude,
    endCoords.longitude,
  ]);

  return (
    <div style={{ height: "100vh" }}>
      <MapContainer
        center={[startCoords.latitude, startCoords.longitude]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        {/* OpenStreetMap tile layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Marker for the starting position */}
        <Marker position={[startCoords.latitude, startCoords.longitude]}>
          <Popup>
            Start Point <br /> Latitude: {startCoords.latitude} <br /> Longitude: {startCoords.longitude}
          </Popup>
        </Marker>
        {/* Marker for the current moving position */}
        <Marker position={[currentPosition.latitude, currentPosition.longitude]}>
          <Popup>
            Vessel is moving. <br /> Latitude: {currentPosition.latitude.toFixed(4)} <br /> Longitude: {currentPosition.longitude.toFixed(4)}
          </Popup>
        </Marker>
        {/* Marker for the ending position */}
        <Marker position={[endCoords.latitude, endCoords.longitude]}>
          <Popup>
            End Point <br /> Latitude: {endCoords.latitude} <br /> Longitude: {endCoords.longitude}
          </Popup>
        </Marker>
        {/* Polyline between start and end coordinates */}
        <Polyline
          positions={[
            [startCoords.latitude, startCoords.longitude],
            [endCoords.latitude, endCoords.longitude],
          ]}
          color="blue"
        />
      </MapContainer>
    </div>
  );
}

export default App;

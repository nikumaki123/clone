import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import socketIOClient from "socket.io-client";

const ENDPOINT = "https://fantastic-chainsaw-jjg55xq59rhxrr-3001.app.github.dev/"; // Your server endpoint
const socket = socketIOClient(ENDPOINT);

const MapComponent = () => {
  const [users, setUsers] = useState({});

  useEffect(() => {
    // Get the user's current location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        // Emit the location to the server
        socket.emit('updateLocation', location);
      });
    }

    // Listen for location updates from the server
    socket.on("locationUpdate", (updatedUsers) => {
      setUsers(updatedUsers);
      // Debugging: Check if this log appears when the server emits locationUpdate
      console.log('Received locationUpdate from server', updatedUsers);
    });
  }, []);

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {Object.keys(users).map((userId) => {
        const user = users[userId];
        return (
          <Marker key={userId} position={[user.location.latitude, user.location.longitude]}>
            <Popup>
              A {user.role} is here!
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;

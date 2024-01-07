import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import './App.css';

function App() {
  const [flightNumber, setFlightNumber] = useState('');
  const [flightData, setFlightData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getFlightData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://api.aviationstack.com/v1/flights?access_key=0d0378521db577400956bdf913cc0b95&flight_iata=${flightNumber}`);

      console.log(response.data);

      if (response.data.data.length > 0) {
        setFlightData(response.data.data[0]);
      } else {
        alert('Flight not found');
      }
    } catch (error) {
      console.error('Error fetching flight data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Flight Tracker</h1>
      <div>
        <input
          type="text"
          placeholder="Enter flight number"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
        />
        <button onClick={getFlightData} disabled={isLoading}>
          {isLoading ? 'Tracking...' : 'Track Flight'}
        </button>
      </div>
      {isLoading && <p>Loading...</p>}
      {flightData && (
        <div>
          <h2>Flight Details</h2>
          <p>Departure Time: {flightData.departure?.estimated}</p>
          <p>Arrival Time: {flightData.arrival?.estimated}</p>
        </div>
      )}
      {flightData && flightData.geography && (
        <div>
          <h2>Flight Map</h2>
          <MapContainer
            center={[flightData.geography.latitude, flightData.geography.longitude]}
            zoom={6}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[flightData.geography.latitude, flightData.geography.longitude]}>
              <Popup>{flightData.flight.iata}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
}

export default App;
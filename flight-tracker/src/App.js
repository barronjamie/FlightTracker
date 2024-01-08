import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const [flightNumber, setFlightNumber] = useState('');
  const [flightData, setFlightData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [liveData, setLiveData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (flightData && flightData.flight && flightData.flight.icao) {
          console.log('ICAO Code:', flightData.flight.icao);

          const response = await axios.get(`https://opensky-network.org/api/states/all?icao24=${flightData.flight.icao}`);

          console.log('Opensky Network API Response:', response.data);

          setLiveData(response.data.states || []);
        }
      } catch (error) {
        console.error('Error fetching live data:', error);
      }
    };

    fetchData();
    console.log('Updated flightData:', flightData);
    console.log('Updated liveData:', liveData);
  }, [flightData, liveData]);

  const getFlightData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://api.aviationstack.com/v1/flights?access_key=0d0378521db577400956bdf913cc0b95&flight_iata=${flightNumber}`);

      console.log('Flight API Response:', response.data);

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
          <p>Departure Time: {flightData.departure.estimated}</p>
          <p>Arrival Time: {flightData.arrival.estimated}</p>
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
            {liveData.map((plane) => (
              <Marker key={plane[0]} position={[plane[6], plane[5]]}>
                <Popup>{plane[1]}</Popup>
              </Marker>
            ))}
            {liveData.length > 1 && (
              <Polyline positions={liveData.map((plane) => [plane[6], plane[5]])} color="red" dashArray="10" />
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
}

export default App;
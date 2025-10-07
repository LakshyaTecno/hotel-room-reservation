import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./styles/index.css";

function App() {
  const [rooms, setRooms] = useState([]);
  const [numRooms, setNumRooms] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [totalRooms, setTotalRooms] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [bookedRooms, setBookedRooms] = useState(0);

  // Fetch room data
  const fetchRooms = useCallback(async () => {
    try {
      console.log("Fetching rooms...");
      const response = await axios.get("/api/rooms");
      console.log("Rooms fetched successfully:", response.data);
      setRooms(response.data.rooms);
      setTotalRooms(response.data.totalRooms);
      setAvailableRooms(response.data.availableRooms);
      setBookedRooms(response.data.bookedRooms);
    } catch (error) {
      console.error("Error fetching room data:", error);
      showMessage("Error fetching room data", "error");
    }
  }, []);

  // Show message
  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  // Book rooms
  const handleBookRooms = async () => {
    if (!numRooms || numRooms < 1 || numRooms > 5) {
      showMessage("Please enter a valid number of rooms (1-5)", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/book", { numRooms });

      if (response.data.success) {
        const { rooms: bookedRooms, travelTime } = response.data;
        const roomNumbers = bookedRooms.map((room) => room.number).join(", ");
        showMessage(
          `Successfully booked ${numRooms} room(s): ${roomNumbers}. Total travel time: ${travelTime} minutes`,
          "success"
        );
        fetchRooms();
      } else {
        showMessage(response.data.message, "error");
      }
    } catch (error) {
      showMessage("Error booking rooms", "error");
    } finally {
      setLoading(false);
    }
  };

  // Generate random occupancy
  const handleRandomOccupancy = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/random-occupancy", {
        percentage: 0.3,
      });

      if (response.data.success) {
        showMessage(
          `Generated random occupancy: ${response.data.bookedRooms} rooms booked out of ${response.data.totalRooms}`,
          "info"
        );
        fetchRooms();
      } else {
        showMessage("Error generating random occupancy", "error");
      }
    } catch (error) {
      showMessage("Error generating random occupancy", "error");
    } finally {
      setLoading(false);
    }
  };

  // Reset all bookings
  const handleReset = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/reset");

      if (response.data.success) {
        showMessage("All bookings have been reset", "success");
        fetchRooms();
      } else {
        showMessage("Error resetting bookings", "error");
      }
    } catch (error) {
      showMessage("Error resetting bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load rooms on component mount
  useEffect(() => {
    console.log("Component mounted, fetching rooms...");
    fetchRooms();
  }, [fetchRooms]);

  // Group rooms by floor for visualization
  const roomsByFloor = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) {
      acc[room.floor] = [];
    }
    acc[room.floor].push(room);
    return acc;
  }, {});

  // Sort floors in descending order (floor 10 at top)
  const sortedFloors = Object.keys(roomsByFloor)
    .map(Number)
    .sort((a, b) => b - a);

  // Show loading state if no rooms loaded yet
  if (rooms.length === 0 && !message) {
    return (
      <div className="app">
        <div className="header">
          <h1>🏨 Hotel Room Reservation System</h1>
          <div className="loading">Loading rooms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🏨 Hotel Room Reservation System</h1>
        <p>
          SDE 3 Assessment - Optimal Room Booking with Travel Time Calculation
        </p>
      </div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <div className="controls">
        <div className="control-group">
          <label htmlFor="numRooms">No of Rooms:</label>
          <input
            id="numRooms"
            type="number"
            min="1"
            max="5"
            value={numRooms}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setNumRooms("");
              } else {
                const num = parseInt(value);
                if (!isNaN(num) && num >= 1 && num <= 5) {
                  setNumRooms(num);
                }
              }
            }}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleBookRooms}
          disabled={loading || availableRooms < numRooms || !numRooms}
        >
          {loading ? "Booking..." : "Book"}
        </button>

        <button
          className="btn btn-success"
          onClick={handleRandomOccupancy}
          disabled={loading}
        >
          Random
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={loading}
        >
          Reset
        </button>
      </div>

      <div className="status-info">
        <div className="status-item">
          <h3>{totalRooms}</h3>
          <p>Total Rooms</p>
        </div>
        <div className="status-item">
          <h3>{availableRooms}</h3>
          <p>Available Rooms</p>
        </div>
        <div className="status-item">
          <h3>{bookedRooms}</h3>
          <p>Booked Rooms</p>
        </div>
        <div className="status-item">
          <h3>{Math.round((bookedRooms / totalRooms) * 100)}%</h3>
          <p>Occupancy Rate</p>
        </div>
      </div>

      <div className="hotel-visualization">
        <h2 className="hotel-title">Hotel Building Visualization</h2>

        <div className="hotel-building">
          {sortedFloors.map((floor) => (
            <div key={floor} className="floor">
              <div className="floor-label">
                Floor {floor}
                {floor === 10 && (
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>
                    (Top Floor)
                  </div>
                )}
              </div>
              <div className="floor-rooms">
                {roomsByFloor[floor]
                  .sort((a, b) => a.position - b.position)
                  .map((room) => (
                    <div
                      key={room.number}
                      className={`room ${
                        room.available ? "available" : "booked"
                      }`}
                      title={`Room ${room.number} - ${
                        room.available ? "Available" : "Booked"
                      }`}
                    >
                      {room.number}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Available Rooms</span>
          </div>
          <div className="legend-item">
            <div className="legend-color booked"></div>
            <span>Booked Rooms</span>
          </div>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "30px",
          color: "white",
          opacity: 0.8,
        }}
      >
        <p>
          <strong>Booking Rules:</strong>
        </p>
        <p>• Maximum 5 rooms per booking</p>
        <p>• Priority: Same floor → Minimize travel time</p>
        <p>• Travel time: 2 min/floor (vertical) + 1 min/room (horizontal)</p>
        <p>• Floors 1-9: 10 rooms each (101-110, 201-210, etc.)</p>
        <p>• Floor 10: 7 rooms (1001-1007)</p>
      </div>
    </div>
  );
}

export default App;

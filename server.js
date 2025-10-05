const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from React app
app.use(express.static(path.join(__dirname, "client/build")));

// Hotel room data structure
class HotelRoomSystem {
  constructor() {
    this.rooms = this.initializeRooms();
    this.bookings = new Map(); // roomNumber -> bookingId
    this.nextBookingId = 1;
  }

  initializeRooms() {
    const rooms = [];

    // Floors 1-9: 10 rooms each (101-110, 201-210, etc.)
    for (let floor = 1; floor <= 9; floor++) {
      for (let room = 1; room <= 10; room++) {
        const roomNumber = floor * 100 + room;
        rooms.push({
          number: roomNumber,
          floor: floor,
          position: room, // 1-10 position on floor
          available: true,
          bookingId: null,
        });
      }
    }

    // Floor 10: 7 rooms (1001-1007)
    for (let room = 1; room <= 7; room++) {
      const roomNumber = 1000 + room;
      rooms.push({
        number: roomNumber,
        floor: 10,
        position: room,
        available: true,
        bookingId: null,
      });
    }

    return rooms;
  }

  // Calculate travel time between two rooms
  calculateTravelTime(room1, room2) {
    const floorDiff = Math.abs(room1.floor - room2.floor);
    const positionDiff = Math.abs(room1.position - room2.position);

    // Vertical travel: 2 minutes per floor
    const verticalTime = floorDiff * 2;

    // Horizontal travel: 1 minute per room
    const horizontalTime = positionDiff;

    return verticalTime + horizontalTime;
  }

  // Calculate total travel time for a group of rooms
  calculateTotalTravelTime(rooms) {
    if (rooms.length <= 1) return 0;

    let totalTime = 0;
    for (let i = 0; i < rooms.length - 1; i++) {
      totalTime += this.calculateTravelTime(rooms[i], rooms[i + 1]);
    }
    return totalTime;
  }

  // Find optimal rooms for booking
  findOptimalRooms(numRooms) {
    const availableRooms = this.rooms.filter((room) => room.available);

    if (availableRooms.length < numRooms) {
      return {
        success: false,
        message: `Only ${availableRooms.length} rooms available`,
      };
    }

    // Group rooms by floor
    const roomsByFloor = {};
    availableRooms.forEach((room) => {
      if (!roomsByFloor[room.floor]) {
        roomsByFloor[room.floor] = [];
      }
      roomsByFloor[room.floor].push(room);
    });

    let bestCombination = null;
    let minTravelTime = Infinity;

    // Try to find rooms on the same floor first
    for (const floor in roomsByFloor) {
      const floorRooms = roomsByFloor[floor];
      if (floorRooms.length >= numRooms) {
        // Sort rooms by position for optimal selection
        floorRooms.sort((a, b) => a.position - b.position);

        // Try different combinations of consecutive rooms
        for (let i = 0; i <= floorRooms.length - numRooms; i++) {
          const selectedRooms = floorRooms.slice(i, i + numRooms);
          const travelTime = this.calculateTotalTravelTime(selectedRooms);

          if (travelTime < minTravelTime) {
            minTravelTime = travelTime;
            bestCombination = selectedRooms;
          }
        }
      }
    }

    // If no single floor has enough rooms, find optimal cross-floor combination
    if (!bestCombination) {
      bestCombination = this.findCrossFloorOptimalRooms(
        availableRooms,
        numRooms
      );
    }

    return {
      success: true,
      rooms: bestCombination,
      travelTime: minTravelTime,
    };
  }

  // Find optimal rooms across multiple floors
  findCrossFloorOptimalRooms(availableRooms, numRooms) {
    const combinations = this.generateCombinations(availableRooms, numRooms);
    let bestCombination = null;
    let minTravelTime = Infinity;

    for (const combination of combinations) {
      // Sort rooms by floor and position for travel time calculation
      const sortedRooms = combination.sort((a, b) => {
        if (a.floor !== b.floor) {
          return a.floor - b.floor;
        }
        return a.position - b.position;
      });

      const travelTime = this.calculateTotalTravelTime(sortedRooms);

      if (travelTime < minTravelTime) {
        minTravelTime = travelTime;
        bestCombination = sortedRooms;
      }
    }

    return bestCombination;
  }

  // Generate all possible combinations of rooms
  generateCombinations(rooms, numRooms) {
    const combinations = [];

    function backtrack(start, current) {
      if (current.length === numRooms) {
        combinations.push([...current]);
        return;
      }

      for (let i = start; i < rooms.length; i++) {
        current.push(rooms[i]);
        backtrack(i + 1, current);
        current.pop();
      }
    }

    backtrack(0, []);
    return combinations;
  }

  // Book rooms
  bookRooms(numRooms) {
    const result = this.findOptimalRooms(numRooms);

    if (!result.success) {
      return result;
    }

    const bookingId = this.nextBookingId++;
    const bookedRooms = result.rooms;

    // Mark rooms as booked
    bookedRooms.forEach((room) => {
      room.available = false;
      room.bookingId = bookingId;
      this.bookings.set(room.number, bookingId);
    });

    return {
      success: true,
      bookingId: bookingId,
      rooms: bookedRooms,
      travelTime: result.travelTime,
    };
  }

  // Generate random occupancy
  generateRandomOccupancy(percentage = 0.3) {
    this.resetAllBookings();

    const totalRooms = this.rooms.length;
    const numRoomsToBook = Math.floor(totalRooms * percentage);

    // Randomly select rooms to book
    const shuffledRooms = [...this.rooms].sort(() => Math.random() - 0.5);
    const roomsToBook = shuffledRooms.slice(0, numRoomsToBook);

    roomsToBook.forEach((room) => {
      room.available = false;
      room.bookingId = this.nextBookingId++;
      this.bookings.set(room.number, room.bookingId);
    });

    return {
      success: true,
      bookedRooms: roomsToBook.length,
      totalRooms: totalRooms,
    };
  }

  // Reset all bookings
  resetAllBookings() {
    this.rooms.forEach((room) => {
      room.available = true;
      room.bookingId = null;
    });
    this.bookings.clear();
    this.nextBookingId = 1;

    return { success: true, message: "All bookings reset" };
  }

  // Get room status
  getRoomStatus() {
    return {
      rooms: this.rooms,
      totalRooms: this.rooms.length,
      availableRooms: this.rooms.filter((room) => room.available).length,
      bookedRooms: this.rooms.filter((room) => !room.available).length,
    };
  }
}

// Initialize hotel system
const hotelSystem = new HotelRoomSystem();

// API Routes
app.get("/api/rooms", (req, res) => {
  res.json(hotelSystem.getRoomStatus());
});

app.post("/api/book", (req, res) => {
  const { numRooms } = req.body;

  if (!numRooms || numRooms < 1 || numRooms > 5) {
    return res.status(400).json({
      success: false,
      message: "Number of rooms must be between 1 and 5",
    });
  }

  const result = hotelSystem.bookRooms(numRooms);
  res.json(result);
});

app.post("/api/random-occupancy", (req, res) => {
  const { percentage } = req.body;
  const result = hotelSystem.generateRandomOccupancy(percentage || 0.3);
  res.json(result);
});

app.post("/api/reset", (req, res) => {
  const result = hotelSystem.resetAllBookings();
  res.json(result);
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Export the app for Vercel
module.exports = app;

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

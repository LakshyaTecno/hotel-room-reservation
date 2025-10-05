// Vercel API handler
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from React app
app.use(express.static(path.join(__dirname, "../client/build")));

// Hotel room data structure
class HotelRoomSystem {
  constructor() {
    this.rooms = this.initializeRooms();
    this.bookings = new Map();
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

  // Calculate travel time between rooms
  calculateTravelTime(room1, room2) {
    const floorDiff = Math.abs(room1.floor - room2.floor);
    const positionDiff = Math.abs(room1.position - room2.position);
    
    // Vertical travel: 2 minutes per floor
    const verticalTime = floorDiff * 2;
    
    // Horizontal travel: 1 minute per room
    const horizontalTime = positionDiff * 1;
    
    return verticalTime + horizontalTime;
  }

  // Find optimal rooms for booking
  findOptimalRooms(numRooms) {
    const availableRooms = this.rooms.filter(room => room.available);
    
    if (availableRooms.length < numRooms) {
      return { success: false, message: "Not enough available rooms" };
    }

    // If only one room needed, return any available room
    if (numRooms === 1) {
      return { success: true, rooms: [availableRooms[0]] };
    }

    // For multiple rooms, try to find rooms on the same floor first
    const roomsByFloor = {};
    availableRooms.forEach(room => {
      if (!roomsByFloor[room.floor]) {
        roomsByFloor[room.floor] = [];
      }
      roomsByFloor[room.floor].push(room);
    });

    // Check if we can find all rooms on the same floor
    for (const floor in roomsByFloor) {
      if (roomsByFloor[floor].length >= numRooms) {
        const selectedRooms = roomsByFloor[floor].slice(0, numRooms);
        return { success: true, rooms: selectedRooms };
      }
    }

    // If not possible on same floor, find rooms that minimize total travel time
    let bestCombination = null;
    let minTotalTime = Infinity;

    // Generate all possible combinations
    const combinations = this.generateCombinations(availableRooms, numRooms);
    
    for (const combination of combinations) {
      let totalTime = 0;
      for (let i = 0; i < combination.length; i++) {
        for (let j = i + 1; j < combination.length; j++) {
          totalTime += this.calculateTravelTime(combination[i], combination[j]);
        }
      }
      
      if (totalTime < minTotalTime) {
        minTotalTime = totalTime;
        bestCombination = combination;
      }
    }

    return { success: true, rooms: bestCombination };
  }

  // Generate combinations of rooms
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
  bookRooms(roomNumbers) {
    const bookingId = this.nextBookingId++;
    const bookedRooms = [];
    
    for (const roomNumber of roomNumbers) {
      const room = this.rooms.find(r => r.number === roomNumber);
      if (room && room.available) {
        room.available = false;
        room.bookingId = bookingId;
        bookedRooms.push(room);
      }
    }
    
    this.bookings.set(bookingId, {
      id: bookingId,
      rooms: bookedRooms,
      timestamp: new Date()
    });
    
    return { success: true, bookingId, rooms: bookedRooms };
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
    });

    return { success: true, message: `Randomly booked ${numRoomsToBook} rooms` };
  }

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
  const status = hotelSystem.getRoomStatus();
  res.json(status);
});

app.post("/api/book", (req, res) => {
  const { numRooms } = req.body;
  
  if (!numRooms || numRooms < 1) {
    return res.status(400).json({ success: false, message: "Invalid number of rooms" });
  }

  const result = hotelSystem.findOptimalRooms(numRooms);
  
  if (result.success) {
    const bookingResult = hotelSystem.bookRooms(result.rooms.map(room => room.number));
    res.json(bookingResult);
  } else {
    res.json(result);
  }
});

app.post("/api/random", (req, res) => {
  const { percentage } = req.body;
  const result = hotelSystem.generateRandomOccupancy(percentage);
  res.json(result);
});

app.post("/api/reset", (req, res) => {
  const result = hotelSystem.resetAllBookings();
  res.json(result);
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

module.exports = app;

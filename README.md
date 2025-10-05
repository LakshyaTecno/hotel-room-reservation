# Hotel Room Reservation System

A comprehensive hotel room reservation system built for the Software Development Engineer Assessment, featuring optimal room selection based on travel time calculations.

## 🚀 Live Demo

**Live Application**: [https://hotel-room-reservation-system-new.vercel.app/](https://hotel-room-reservation-system-new.vercel.app/)

Experience the full functionality of the Hotel Room Reservation System with real-time room visualization, optimal booking algorithms, and interactive controls.

## 🏨 System Overview

This system manages a hotel with 97 rooms across 10 floors:

- **Floors 1-9**: 10 rooms each (101-110, 201-210, etc.)
- **Floor 10**: 7 rooms (1001-1007)
- **Maximum booking**: 5 rooms per guest
- **Smart selection**: Prioritizes same-floor bookings, then minimizes travel time

## 🚀 Features

### Core Functionality

- **Room Booking Interface**: Enter number of rooms (1-5) and book optimally
- **Visual Hotel Layout**: Interactive visualization of all floors and rooms
- **Travel Time Calculation**:
  - Vertical travel: 2 minutes per floor
  - Horizontal travel: 1 minute per room
- **Optimal Room Selection**:
  - Priority 1: Same floor rooms
  - Priority 2: Minimize total travel time across floors

### Additional Features

- **Random Occupancy Generator**: Create realistic hotel occupancy scenarios
- **Reset Functionality**: Clear all bookings instantly
- **Real-time Status**: Live updates of available/booked rooms
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Technology Stack

### Backend

- **Node.js** with Express.js
- **RESTful API** design
- **Optimal algorithm** for room selection
- **Travel time calculation** engine

### Frontend

- **React.js** with modern hooks
- **Axios** for API communication
- **Responsive CSS** with gradient designs
- **Interactive visualization** components

## 📋 API Endpoints

| Endpoint                | Method | Description               |
| ----------------------- | ------ | ------------------------- |
| `/api/rooms`            | GET    | Get current room status   |
| `/api/book`             | POST   | Book optimal rooms        |
| `/api/random-occupancy` | POST   | Generate random occupancy |
| `/api/reset`            | POST   | Reset all bookings        |

## 🏗️ Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation Steps

1. **Clone/Download the project**

```bash
cd "Room Reservation System"
```

2. **Install backend dependencies**

```bash
npm install
```

3. **Install frontend dependencies**

```bash
cd client
npm install
cd ..
```

4. **Start the development server**

```bash
# Start backend server
npm run dev

# In another terminal, start frontend
npm run client
```

5. **Access the application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎯 Usage Instructions

### Booking Rooms

1. Enter the number of rooms (1-5) in the input field
2. Click "Book" to automatically select optimal rooms
3. View the booking confirmation with travel time

### Random Occupancy

1. Click "Random" to generate 30% random occupancy
2. Useful for testing different scenarios

### Reset System

1. Click "Reset" to clear all bookings
2. Returns the hotel to empty state

### Visualization

- **Green rooms**: Available for booking
- **Red rooms**: Currently booked
- **Floor layout**: Shows actual hotel structure
- **Room numbers**: Match the specification (101-110, 201-210, etc.)

## 🧮 Algorithm Details

### Room Selection Logic

1. **Same Floor Priority**: First tries to find rooms on the same floor
2. **Consecutive Rooms**: Within a floor, selects consecutive rooms when possible
3. **Cross-Floor Optimization**: If same floor unavailable, finds combination with minimum travel time
4. **Travel Time Calculation**:
   ```
   Total Time = (Floor Difference × 2) + (Position Difference × 1)
   ```

### Example Scenarios

- **Scenario 1**: Book 4 rooms, Floor 1 has 101,102,105,106 available
  - **Result**: Books 101,102,105,106 (same floor, minimal travel)
- **Scenario 2**: Book 2 rooms, Floor 1 only has 101,102 available
  - **Result**: Books 201,202 (next floor, minimal vertical travel)

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Express Server │    │  Room Database  │
│                 │    │                 │    │                 │
│ • UI Components │◄──►│ • API Routes    │◄──►│ • Room States   │
│ • State Mgmt    │    │ • Business Logic│    │ • Bookings      │
│ • Visualization │    │ • Algorithms    │    │ • Travel Calc   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🧪 Testing Scenarios

The system handles various edge cases:

- ✅ Maximum booking limit (5 rooms)
- ✅ Insufficient rooms available
- ✅ Cross-floor optimization
- ✅ Same-floor priority
- ✅ Travel time minimization
- ✅ Random occupancy generation
- ✅ Complete system reset

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Environment Variables

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode

## 📝 Assessment Requirements Met

✅ **Interface to enter number of rooms and book them**
✅ **Visualization of booking**
✅ **Button to generate random occupancy on rooms**
✅ **Button to reset entire booking**
✅ **Optimal room selection algorithm**
✅ **Travel time calculation**
✅ **Hotel structure compliance** (97 rooms, 10 floors)
✅ **Booking rules implementation**

## 🎨 UI/UX Features

- **Modern Design**: Gradient backgrounds and smooth animations
- **Responsive Layout**: Works on all screen sizes
- **Interactive Elements**: Hover effects and visual feedback
- **Status Indicators**: Clear room availability visualization
- **Real-time Updates**: Live status updates
- **User-friendly**: Intuitive controls and clear messaging

## 🔧 Customization

The system is easily customizable:

- **Room capacity**: Modify `initializeRooms()` method
- **Travel time rules**: Adjust calculation constants
- **Booking limits**: Change maximum rooms per booking
- **UI themes**: Modify CSS variables and gradients

## 📞 Support

For questions or issues:

- Check the console for error messages
- Verify all dependencies are installed
- Ensure ports 3000 and 5000 are available
- Review the API endpoints documentation

---

**Built for Software Development Engineer Assessment - Hotel Room Reservation System**
_Demonstrating optimal algorithms, modern web development, and user experience design_

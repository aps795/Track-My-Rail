# Track My Rail - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- npm (comes with Node.js)
- Git

### Step 1: Clone/Copy Project
```bash
cd /home/abhishekps/TRACK\ MY\ RAIL
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- **express** - Web framework
- **cors** - Cross-origin requests
- **axios** - HTTP client
- **dotenv** - Environment variables
- **nodemon** - Development auto-reload

### Step 3: Setup Environment Variables
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your API keys
nano .env  # or use your editor
```

**Option A: Use Mock Data (No API Key Needed)**
- Leave `RAPID_API_KEY` empty in `.env`
- Backend will use mock data automatically
- Perfect for testing and development

**Option B: Get Real Data (Optional)**
1. Visit https://rapidapi.com/
2. Search for "Indian Railway API"
3. Subscribe to a free tier plan
4. Copy your API key
5. Paste in `.env` as `RAPID_API_KEY`

### Step 4: Start Backend Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Expected output:
```
🚂 Track My Rail Backend running on http://localhost:5000
Using MOCK DATA
```

### Step 5: Test the Backend
Open your browser and visit:
```
http://localhost:5000/api/trains/search?from=NDLS&to=CSTM&date=2024-01-15
```

You should see train data!

---

## 📡 Available API Endpoints

### 1. Search Trains
```
GET /api/trains/search?from=NDLS&to=CSTM&date=2024-01-15
```

**Response:**
```json
{
  "success": true,
  "trains": [
    {
      "trainNo": "12015",
      "trainName": "Shatabdi Express",
      "source": "Delhi Jn",
      "destination": "Mumbai Central",
      "departure": "06:15",
      "arrival": "16:30",
      "status": "On Time",
      "availability": {
        "firstClass": 45,
        "secondClass": 120
      }
    }
  ],
  "count": 15,
  "date": "2024-01-15"
}
```

### 2. Get All Stations
```
GET /api/stations
```

### 3. Search Stations
```
GET /api/stations/search?query=Delhi
```

### 4. Get Train Details
```
GET /api/trains/12015
```

**Response includes:**
- Train schedule
- Seat availability
- Current status
- Real-time location

### 5. Check PNR Status
```
GET /api/pnr/1234567890
```

**Response:**
```json
{
  "success": true,
  "pnr": "1234567890",
  "bookingStatus": "Confirmed",
  "passengers": [
    {
      "seatNo": "42",
      "status": "Confirmed"
    }
  ],
  "journey": {
    "from": "Delhi Jn",
    "to": "Mumbai Central",
    "date": "2024-01-20"
  },
  "fare": {
    "totalFare": 2500
  }
}
```

### 6. Get Live Status
```
GET /api/live-status/12015/2024-01-15
```

**Response includes:**
- Current location with GPS coordinates
- Next station
- Expected delays
- Station-wise schedule

---

## 🔌 Frontend Integration

Update your frontend `script.js` file:

```javascript
// Change API_BASE_URL to localhost
const API_BASE_URL = 'http://localhost:5000/api';

// Your existing API calls will now work:
apiFetch('/trains/search?from=NDLS&to=CSTM&date=2024-01-15')
  .then(response => {
    console.log('Trains:', response.data.trains);
  });
```

---

## 🐛 Troubleshooting

### Port 5000 already in use
```bash
# Find process using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### CORS errors
- Make sure `cors` middleware is enabled in server.js ✓
- Check that frontend API calls use `http://localhost:5000`

### No trains appearing
1. Check backend console for errors
2. Verify `.env` file exists
3. Try accessing API directly in browser
4. Make sure `NODE_ENV` is not 'production'

---

## 🌐 Production Deployment

To deploy on Heroku:

```bash
# Create Heroku app
heroku create your-app-name

# Add buildpack for Node.js
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set RAPID_API_KEY=your_key

# Deploy
git push heroku main
```

**Update frontend API URL in production:**
```javascript
const API_BASE_URL = 'https://your-app-name.herokuapp.com/api';
```

---

## 📚 Learning Resources

- [Express.js Docs](https://expressjs.com/)
- [RapidAPI Marketplace](https://rapidapi.com/)
- [IRCTC Official API](https://www.irctc.co.in/nget/in/developer-resources)
- [JSON API Guide](https://jsonapi.org/)

---

## 💡 Next Steps

1. ✅ Install and run the backend
2. ✅ Test API endpoints
3. ✅ Integrate with frontend
4. ✅ Get real API key (optional)
5. ✅ Deploy to production

Good luck with your Track My Rail project! 🚂

# Track My Rail - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Browser)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ index.html, train-search.html, pnr-status.html, etc. │   │
│  │ JavaScript: apieFetch(), handleTrainSearch(), etc.    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬──────────────────────────────────────────┘
                     │ HTTP Requests (AJAX/Fetch)
                     │ API_BASE_URL = 'http://localhost:5000/api'
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Server (Node.js/Express)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ server.js - REST API Endpoints                        │   │
│  │ • GET /api/trains/search                             │   │
│  │ • GET /api/stations                                  │   │
│  │ • GET /api/pnr/:pnrNumber                            │   │
│  │ • GET /api/live-status/:trainNo/:date                │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬──────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  Mock Database   │    │  Real APIs       │
│                  │    │  (Optional)      │
│ • Trains         │    │                  │
│ • Stations       │    │ • RapidAPI       │
│ • PNR Data       │    │ • IRCTC API      │
│ • Live Status    │    │ • Other Sources  │
└──────────────────┘    └──────────────────┘
        │                         │
        └────────────┬────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  JSON Response Data    │
        │  (Back to Frontend)    │
        └────────────────────────┘
```

---

## Data Flow for Train Search

### Request Flow:
```
1. User fills train search form
   ├─ From Station: Delhi (NDLS)
   ├─ To Station: Mumbai (CSTM)
   └─ Date: 2024-01-15

2. frontend/train-search.js submits form
   └─ handleTrainSearch() → apiFetch('/trains/search?from=NDLS&to=CSTM&date=2024-01-15')

3. Browser makes HTTP GET request
   └─ http://localhost:5000/api/trains/search?from=NDLS&to=CSTM&date=2024-01-15

4. server.js receives request
   ├─ Route: GET /api/trains/search
   ├─ Parse parameters: from, to, date
   └─ Check if using MOCK_DATA or REAL_API

5. server.js retrieves train data
   ├─ MOCK_DATA: Filter mockTrains array
   └─ REAL_API: Fetch from RapidAPI with axios

6. JSON Response sent back
   ├─ trainNo, trainName, departure, arrival
   ├─ status, availability, distance
   └─ runDays

7. Frontend receives response
   ├─ Parse JSON
   ├─ Update DOM with tables/cards
   └─ Display results to user
```

---

## Live Data Updates

### Real-Time Status Updates:

```
Browser (Every 10 seconds)
  │
  ├─→ GET /api/live-status/12015/2024-01-15
  │
  ▼
Backend fetches:
  ├─ Current train location (GPS)
  ├─ Next station name
  ├─ Expected arrival time
  ├─ Current delay (if any)
  └─ Passengers on board

  │
  ▼
Update Map/Dashboard:
  ├─ Train icon moves on map
  ├─ Delay countdown updates
  ├─ Next station changes
  └─ Estimated arrival time refreshes
```

---

## API Response Format

### Train Search Response Example:
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
      "duration": "10h 15m",
      "status": "On Time",
      "distance": 1448,
      "availability": {
        "firstClass": 45,
        "secondClass": 120,
        "sleeper": 200
      },
      "runDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    }
  ],
  "count": 15,
  "date": "2024-01-15",
  "source": "NDLS",
  "destination": "CSTM"
}
```

---

## Data Sources

### Mock Data (Built-in):
```
✓ 3 Sample Trains
✓ 8 Major Stations
✓ Complete PNR Example
✓ Real-time status simulator
✓ No internet required
✓ No API key needed
```

### Real Data Sources (Optional):
```
1. RapidAPI
   - Multiple API providers
   - Free tier available
   - Easy integration

2. Official IRCTC API
   - Most accurate
   - Requires registration
   - Better for production

3. Other Public APIs
   - Open source options
   - Community maintained
   - Variable reliability
```

---

## Component Interaction

### Train Search Flow:
```
User Interface (HTML)
       │
       └→ train-search.js
           ├─ Validate inputs
           ├─ Format parameters
           └─ Call API
               │
               └→ script.js (apiFetch)
                   ├─ Make HTTP request
                   ├─ Handle response
                   └─ Return data
                       │
                       └→ train-search.js
                           ├─ Process response
                           ├─ Display results
                           └─ Update table
                               │
                               └→ User sees trains
```

---

## Configuration Options

### Environment Variables (.env):

```
# Server Settings
PORT=5000                           # Backend port
NODE_ENV=development                # environment

# API Sources
RAPID_API_KEY=xxx                   # Optional: For real data
USE_MOCK_DATA=true                  # Use mock by default

# IRCTC (If using official API)
IRCTC_API_KEY=xxx                   # Optional: Official IRCTC key
IRCTC_API_SECRET=xxx

# Security
JWT_SECRET=your_secret              # For auth tokens

# Database (Future use)
DB_HOST=localhost
DB_PORT=27017
DB_NAME=track_my_rail
```

---

## Deployment Architecture

### Development:
```
┌──────────────────┐      ┌──────────────────┐
│ Frontend Files   │      │ Backend Server   │
│ (localhost:8000) │◄────►│ (localhost:5000) │
└──────────────────┘      └──────────────────┘
         │                         │
         └─── Mock Data Only ──────┘
              (No real APIs)
```

### Production (Heroku):
```
┌────────────────────────┐
│ Frontend (Static HTML) │
│ Served by CDN/Heroku   │
└────────────┬───────────┘
             │
             ◄–► Backend Server (Heroku)
             │   ├─ Express.js
             │   ├─ RapidAPI Integration
             │   └─ Real IRCTC Data
             │
             └──────► Database (Optional MongoDB)
                     └─ Cache train data
```

---

## Error Handling Flow

```
API Request
    │
    ├─ Validation Error
    │  ├─ Missing parameters
    │  ├─ Invalid date format
    │  └─ Invalid station code
    │       │
    │       └─→ 400 Bad Request
    │           └─ Error message to user
    │
    ├─ External API Error
    │  ├─ RapidAPI rate limit exceeded
    │  ├─ Network timeout
    │  └─ API down
    │       │
    │       └─→ Fallback to MOCK_DATA
    │           └─ Continue operation
    │
    └─ Server Error
       ├─ Database connection failed
       ├─ Unexpected error
       └─→ 500 Internal Server Error
           └─ Error logged + user notified
```

---

## Performance Optimization

### Caching Strategy:
```
Train Data
├─ Fresh data: < 5 minutes old
├─ Use cache if available
├─ Update every 5 minutes
└─ Fallback to last known state

Station Data
├─ Static/rarely changes
├─ Cache indefinitely
└─ Manual refresh option

Live Status
├─ Update every 10 seconds
├─ Real-time GPS coordinates
└─ Server pushes if available (WebSocket)
```

---

## Security Considerations

### Current Implementation:
```
✓ CORS enabled (development)
✓ Input validation on parameters
✓ Error messages don't leak internals
✗ No authentication required (development)
✗ No rate limiting (development)
```

### For Production:
```
Add:
□ JWT authentication
□ Rate limiting (100 requests/hour/IP)
□ Input sanitization
□ HTTPS only
□ API key rotation
□ CORS restrictions
└─ Only allow your frontend domain
```

---

## Scaling Strategy

### Phase 1: Current (Development)
- Single Node.js process
- Mock + one API provider
- Local testing

### Phase 2: Testing
- Load balancer
- Multiple server instances
- Database caching (Redis)
- Real API with fallback

### Phase 3: Production
- Kubernetes cluster
- Microservices (separate auth, trains, live-status)
- CDN for static files
- Dedicated database
- Monitoring (NewRelic, DataDog)
- Analytics

---

## Future Enhancements

```
□ WebSocket for real-time updates
□ Train booking integration
□ User accounts and saved searches
□ Mobile app (React Native)
□ SMS/Email notifications
□ Advanced filters (price, stops, comfort)
□ Multi-language support
□ Offline mode
□ Integration with payment gateways
```

---

This architecture ensures:
- ✅ Easy development
- ✅ Quick testing
- ✅ Flexible data sources
- ✅ Scalable for production
- ✅ User-friendly errors
- ✅ Performance optimized

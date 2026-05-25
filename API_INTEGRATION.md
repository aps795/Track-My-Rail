# Indian Rail API Integration Guide

## Overview
This document provides complete integration details for the Indian Rail API endpoints used in Track My Rail.

## API Endpoints

### 1. PNR Check API
**Endpoint:** `http://indianrailapi.com/api/v2/PNRCheck/apikey/{apikey}/PNRNumber/{pnrno}/Route/1/`

**Description:** Check the status of a railway ticket using PNR (Passenger Name Record).

**Parameters:**
- `apikey` (string, required): Your Indian Rail API key
- `pnrno` (string, required): 10-digit PNR number
- `Route` (number, required): Set to 1 for basic information

**Example Request:**
```javascript
const pnrNumber = "1234567890";
const apiKey = "your_api_key_here";
const response = await fetch(
  `http://indianrailapi.com/api/v2/PNRCheck/apikey/${apiKey}/PNRNumber/${pnrNumber}/Route/1/`
);
const data = await response.json();
```

**Sample Response:**
```json
{
  "pnr_number": "1234567890",
  "train_number": "12345",
  "train_name": "Express Train",
  "boarding_station": "DEL",
  "destination_station": "NYC",
  "journey_date": "25-May-2026",
  "reservation_status": "CONFIRMED",
  "class_type": "3A",
  "coach_position": "A1",
  "passengers": [
    {
      "name": "John Doe",
      "seat_number": "42",
      "status": "CNF"
    }
  ],
  "message": "Success"
}
```

---

### 2. Live Train Status API
**Endpoint:** `https://indianrailapi.com/api/v2/livetrainstatus/apikey/{apikey}/trainnumber/{train_no}/date/{date_of_journey}/`

**Description:** Get real-time status of a train including arrival/departure times and delays.

**Parameters:**
- `apikey` (string, required): Your Indian Rail API key
- `train_no` (string, required): Train number
- `date_of_journey` (string, required): Date in DDMMMYYYY format (e.g., "25May2026")

**Date Format Examples:**
- May 25, 2026 → `25May2026`
- January 1, 2026 → `01Jan2026`
- December 31, 2026 → `31Dec2026`

**Example Request:**
```javascript
const trainNumber = "12345";
const journeyDate = "25May2026";
const apiKey = "your_api_key_here";
const response = await fetch(
  `https://indianrailapi.com/api/v2/livetrainstatus/apikey/${apiKey}/trainnumber/${trainNumber}/date/${journeyDate}/`
);
const data = await response.json();
```

**Sample Response:**
```json
{
  "train_number": "12345",
  "train_name": "Express Train",
  "status": "On Time",
  "current_station": "ABC",
  "current_station_name": "Central Station",
  "route": [
    {
      "station_code": "DEL",
      "station_name": "Delhi",
      "arrival_time": "10:30",
      "departure_time": "10:45",
      "platform": "5",
      "delay": 0
    },
    {
      "station_code": "NYC",
      "station_name": "New City",
      "arrival_time": "15:30",
      "departure_time": "15:45",
      "platform": "3",
      "delay": 5
    }
  ],
  "message": "Success"
}
```

---

## Integration in Your Project

### Using the API Service Module

```javascript
// Import the API service
<script src="api-service.js"></script>

// Set up your API key
const apiKey = "your_indian_rail_api_key";

// Check PNR Status
async function checkPNR(pnrNumber) {
  try {
    const result = await getPNRStatus(apiKey, pnrNumber);
    const parsed = parsePNRData(result);
    console.log("PNR Status:", parsed);
    return parsed;
  } catch (error) {
    console.error("Error checking PNR:", error);
  }
}

// Check Train Status
async function checkTrain(trainNumber, dateOfJourney) {
  try {
    const formattedDate = formatDateForAPI(new Date(dateOfJourney));
    const result = await getLiveTrainStatus(apiKey, trainNumber, formattedDate);
    const parsed = parseTrainStatusData(result);
    console.log("Train Status:", parsed);
    return parsed;
  } catch (error) {
    console.error("Error checking train:", error);
  }
}
```

### Using the Data Handler Module

```javascript
// Import data handler
<script src="data-handler.js"></script>

// Save API key
saveAPIKey("your_api_key_here");

// Add to search history
addPNRToHistory(pnrData);
addTrainToHistory(trainData);

// Retrieve history
const pnrHistory = getPNRHistory();
const trainHistory = getTrainHistory();

// Use cached data (reduces API calls)
const cached = getCachedPNRResponse("1234567890");
```

---

## Error Handling

### Common Errors

**401 Unauthorized**
- Invalid API key
- API key not provided
- API key has expired

**400 Bad Request**
- Invalid PNR number format (must be 10 digits)
- Invalid train number
- Invalid date format

**429 Too Many Requests**
- API rate limit exceeded
- Use caching to reduce requests

### Error Handling Example

```javascript
async function checkPNRSafely(apiKey, pnrNumber) {
  try {
    // Check cache first
    const cached = getCachedPNRResponse(pnrNumber);
    if (cached) {
      console.log("Using cached data");
      return cached;
    }
    
    // Fetch from API
    const data = await getPNRStatus(apiKey, pnrNumber);
    
    // Cache for 5 minutes
    cachePNRResponse(pnrNumber, data);
    
    return data;
  } catch (error) {
    if (error.message.includes("401")) {
      console.error("Invalid API key");
    } else if (error.message.includes("400")) {
      console.error("Invalid request parameters");
    } else if (error.message.includes("429")) {
      console.error("Too many requests - using cache");
      return getCachedPNRResponse(pnrNumber);
    }
    throw error;
  }
}
```

---

## CORS Issues & Solutions

### Problem
Browser blocks cross-origin requests to the API due to CORS policy.

### Solutions

**1. Use Backend Proxy** (Recommended)
```javascript
// Route through your backend instead
async function getPNRStatusViaBackend(pnrNumber) {
  const response = await fetch('/api/pnr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pnrNumber })
  });
  return response.json();
}
```

**2. Use CORS Proxy** (Development only)
```javascript
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const fullUrl = CORS_PROXY + originalUrl;
const response = await fetch(fullUrl);
```

**3. Configure Backend CORS**
```javascript
// Node.js/Express example
app.use(cors({
  origin: 'https://yourdomains.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
```

---

## Security Best Practices

### 1. Protect API Keys
❌ **DO NOT** hardcode API keys in client-side code
✅ **DO** store in environment variables on backend
✅ **DO** validate requests on backend

```javascript
// Backend route
app.post('/api/pnr', (req, res) => {
  const apiKey = process.env.INDIAN_RAIL_API_KEY; // From env variables
  const { pnrNumber } = req.body;
  
  // Validate input
  if (!pnrNumber || pnrNumber.length !== 10) {
    return res.status(400).json({ error: 'Invalid PNR' });
  }
  
  // Make request
  // ...
});
```

### 2. Rate Limiting
Implement request throttling to avoid hitting API limits:

```javascript
const requestQueue = [];
const MAX_REQUESTS_PER_MINUTE = 60;
let requestCount = 0;

async function queuedAPICall(fn) {
  requestQueue.push(fn);
  
  if (requestQueue.length <= MAX_REQUESTS_PER_MINUTE) {
    return requestQueue.shift()();
  }
  
  // Wait for request limit to reset
  await new Promise(resolve => setTimeout(resolve, 60000));
  return requestQueue.shift()();
}
```

### 3. Input Validation
```javascript
function validatePNR(pnrNumber) {
  return /^\d{10}$/.test(pnrNumber);
}

function validateTrainNumber(trainNumber) {
  return /^\d{4,5}$/.test(trainNumber);
}

function validateDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}
```

---

## Testing the Integration

### Test with the Example HTML
Open `api-integration-example.html` in your browser and test:
1. PNR status checking
2. Train status tracking
3. Search history persistence

### Test with cURL
```bash
# Test PNR endpoint
curl "http://indianrailapi.com/api/v2/PNRCheck/apikey/YOUR_API_KEY/PNRNumber/1234567890/Route/1/"

# Test Train Status endpoint
curl "https://indianrailapi.com/api/v2/livetrainstatus/apikey/YOUR_API_KEY/trainnumber/12345/date/25May2026/"
```

---

## Getting an API Key

1. Visit [Indian Rail API](http://indianrailapi.com/)
2. Sign up for a free account
3. Generate your API key
4. Add to your `.env` file:
   ```
   INDIAN_RAIL_API_KEY=your_key_here
   ```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API returns 401 | Verify API key is correct and active |
| API returns 400 | Check PNR format (10 digits) and date format (DDMMMYYYY) |
| CORS errors in browser | Use backend proxy route or CORS proxy |
| No response | Check network connectivity and API server status |
| Cached data not updating | Cache expires after 5 minutes; clear manually if needed |

---

## Rate Limits

- **Free Tier**: 60 requests/minute
- **Pro Tier**: 300 requests/minute
- **Enterprise**: Contact API provider

Use the caching system to minimize API calls.

---

## Support

For issues or questions:
1. Check the [Indian Rail API documentation](http://indianrailapi.com/)
2. Review error logs in browser console
3. Test with cURL first to isolate issues
4. Check API status page

---

## License

This integration guide is part of Track My Rail project.
API data provided by Indian Rail API.

**Last Updated:** May 25, 2026

/**
 * Track My Rail - Node.js Backend
 * Fetches real-time train data from alternative APIs
 * 
 * Setup:
 * 1. npm init -y
 * 2. npm install express cors dotenv axios
 * 3. Create .env file with API credentials
 * 4. node server.js
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ============================================
// Root Route
// ============================================
app.get('/', (req, res) => {
    res.send({
        status: 'online',
        message: 'Track My Rail Backend is running!',
        api_endpoints: '/api/...'
    });
});

// ============================================
// Configuration
// ============================================
const RAILWAY_API_OPTIONS = {
    // Option 1: RapidAPI Railway Service
    RAPID_API_KEY: process.env.RAPID_API_KEY,
    RAPID_API_HOST: process.env.RAPID_API_HOST || 'indian-railway-api.p.rapidapi.com',
    RAPID_TRAIN_API_URL: 'https://indian-railway-api.p.rapidapi.com',
    
    // Option 2: Official IRCTC API
    IRCTC_API_KEY: process.env.IRCTC_API_KEY,
    IRCTC_API_SECRET: process.env.IRCTC_API_SECRET,
    
    // Option 3: Mock Data (Default for Development)
    USE_MOCK_DATA: !process.env.RAPID_API_KEY && !process.env.IRCTC_API_KEY,
    
    // Determine which API to use
    API_SOURCE: process.env.IRCTC_API_KEY ? 'IRCTC_OFFICIAL' : 
                (process.env.RAPID_API_KEY ? 'RAPID_API' : 'MOCK_DATA')
};

// ============================================
// Mock Database (for testing without API key)
// ============================================
const mockTrains = [
    {
        trainNo: '12015',
        trainName: 'Shatabdi Express',
        source: 'Delhi Jn',
        destination: 'Mumbai Central',
        departure: '06:15',
        arrival: '16:30',
        duration: '10h 15m',
        status: 'On Time',
        availability: { firstClass: 45, secondClass: 120, sleeper: 200 },
        distance: 1448,
        runDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        route: [
            { station: 'NDLS', name: 'New Delhi', arrival: '06:15', departure: '06:15', distance: 0, day: 1 },
            { station: 'MTJ', name: 'Mathura Jn', arrival: '07:45', departure: '07:47', distance: 141, day: 1 },
            { station: 'KOTA', name: 'Kota Jn', arrival: '11:15', departure: '11:25', distance: 465, day: 1 },
            { station: 'RTM', name: 'Ratlam Jn', arrival: '14:30', departure: '14:35', distance: 732, day: 1 },
            { station: 'BRC', name: 'Vadodara Jn', arrival: '18:15', departure: '18:25', distance: 993, day: 1 },
            { station: 'BCT', name: 'Mumbai Central', arrival: '16:30', departure: '16:30', distance: 1448, day: 1 }
        ]
    },
    {
        trainNo: '12002',
        trainName: 'Bhopal Shatabdi',
        source: 'Delhi Jn',
        destination: 'Bhopal Jn',
        departure: '06:00',
        arrival: '12:15',
        duration: '6h 15m',
        status: 'On Time',
        availability: { firstClass: 30, secondClass: 85 },
        distance: 705,
        runDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        route: [
            { station: 'NDLS', name: 'New Delhi', arrival: '06:00', departure: '06:00', distance: 0, day: 1 },
            { station: 'AGC', name: 'Agra Cantt', arrival: '07:50', departure: '07:55', distance: 195, day: 1 },
            { station: 'GWL', name: 'Gwalior Jn', arrival: '09:20', departure: '09:25', distance: 313, day: 1 },
            { station: 'VGLB', name: 'VGL Jhansi Jn', arrival: '10:45', departure: '10:53', distance: 411, day: 1 },
            { station: 'BINA', name: 'Bina Jn', arrival: '12:40', departure: '12:45', distance: 564, day: 1 },
            { station: 'BPL', name: 'Bhopal Jn', arrival: '12:15', departure: '12:15', distance: 705, day: 1 }
        ]
    },
    {
        trainNo: '15002',
        trainName: 'Rajdhani Express',
        source: 'Delhi Jn',
        destination: 'Kolkata',
        departure: '16:55',
        arrival: '10:25',
        duration: '17h 30m',
        status: 'On Time',
        availability: { firstClass: 12, secondClass: 45 },
        distance: 1445,
        runDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        route: [
            { station: 'NDLS', name: 'New Delhi', arrival: '16:55', departure: '16:55', distance: 0, day: 1 },
            { station: 'CNB', name: 'Kanpur Central', arrival: '21:40', departure: '21:45', distance: 440, day: 1 },
            { station: 'DDU', name: 'Pt Deen Dayal Upadhyaya Jn', arrival: '02:00', departure: '02:10', distance: 787, day: 2 },
            { station: 'DHN', name: 'Dhanbad Jn', arrival: '06:50', departure: '06:55', distance: 1186, day: 2 },
            { station: 'ASN', name: 'Asansol Jn', arrival: '07:50', departure: '07:52', distance: 1244, day: 2 },
            { station: 'KOAA', name: 'Kolkata', arrival: '10:25', departure: '10:25', distance: 1445, day: 2 }
        ]
    }
];

const mockStations = [
    { code: 'NDLS', name: 'Delhi Jn', city: 'Delhi', state: 'Delhi' },
    { code: 'BCNA', name: 'Bhopal Jn', city: 'Bhopal', state: 'Madhya Pradesh' },
    { code: 'CSTM', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
    { code: 'CSMT', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
    { code: 'KOLKATA', name: 'Kolkata', city: 'Kolkata', state: 'West Bengal' },
    { code: 'BBS', name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha' },
    { code: 'RJPB', name: 'Rajpura Jn', city: 'Rajpura', state: 'Punjab' },
    { code: 'LKO', name: 'Lucknow', city: 'Lucknow', state: 'Uttar Pradesh' }
];

// ============================================
// API Endpoints
// ============================================

/**
 * Search Trains Between Two Stations
 * GET /api/trains/search?from=NDLS&to=CSTM&date=2024-01-15
 */
app.get('/api/trains/search', async (req, res) => {
    try {
        const { from, to, date } = req.query;

        if (!from || !to || !date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: from, to, date'
            });
        }

        // Try real API first if configured
        if (RAILWAY_API_OPTIONS.API_SOURCE === 'RAPID_API') {
            try {
                const results = await fetchFromRapidAPI('/trains', { from, to, date });
                return res.json({
                    success: true,
                    trains: results.trains || results,
                    count: results.trains?.length || 0,
                    date: date,
                    source: from,
                    destination: to,
                    dataSource: 'RAPID_API'
                });
            } catch (apiError) {
                console.error('RapidAPI Error:', apiError.message);
                // Fall through to mock data
            }
        }

        // Try IRCTC Official API if configured
        if (RAILWAY_API_OPTIONS.API_SOURCE === 'IRCTC_OFFICIAL') {
            try {
                const results = await fetchFromIRCTC('/trains/search', { from, to, date });
                return res.json({
                    success: true,
                    trains: results.trains || results,
                    count: results.trains?.length || 0,
                    date: date,
                    source: from,
                    destination: to,
                    dataSource: 'IRCTC_OFFICIAL'
                });
            } catch (apiError) {
                console.error('IRCTC API Error:', apiError.message);
                // Fall through to mock data
            }
        }

        // Use Mock Data (Default)
        const results = mockTrains.filter(train => {
            const isValidRoute = (
                train.source.toUpperCase().includes(from.toUpperCase()) ||
                train.destination.toUpperCase().includes(to.toUpperCase())
            ) || (
                from === 'NDLS' && (to === 'CSTM' || to === 'BCNA' || to === 'KOLKATA')
            );
            return isValidRoute;
        });

        return res.json({
            success: true,
            trains: results,
            count: results.length,
            date: date,
            source: from,
            destination: to,
            dataSource: 'MOCK_DATA'
        });
    } catch (error) {
        console.error('Error searching trains:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching train data',
            error: error.message
        });
    }
});

/**
 * Get Train Route
 * GET /api/trains/:trainNo/route
 */
app.get('/api/trains/:trainNo/route', async (req, res) => {
    try {
        const { trainNo } = req.params;

        // Try real API first if configured
        if (RAILWAY_API_OPTIONS.API_SOURCE === 'RAPID_API') {
            try {
                const results = await fetchFromRapidAPI('/route', { trainNo });
                return res.json({
                    success: true,
                    trainNo: trainNo,
                    route: results.route || results,
                    dataSource: 'RAPID_API'
                });
            } catch (apiError) {
                console.error('RapidAPI Error:', apiError.message);
            }
        }

        // Use Mock Data
        const train = mockTrains.find(t => t.trainNo === trainNo);
        if (!train) {
            return res.status(404).json({
                success: false,
                message: 'Train not found'
            });
        }

        res.json({
            success: true,
            trainNo: trainNo,
            trainName: train.trainName,
            route: train.route,
            dataSource: 'MOCK_DATA'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching train route',
            error: error.message
        });
    }
});

/**
 * Get Station List / Search Stations
 * GET /api/stations/search?query=Delhi
 */
app.get('/api/stations/search', (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 1) {
            return res.json({
                success: false,
                stations: [],
                message: 'Please provide a search query'
            });
        }

        const filtered = mockStations.filter(station =>
            station.name.toLowerCase().includes(query.toLowerCase()) ||
            station.code.toLowerCase().includes(query.toLowerCase()) ||
            station.city.toLowerCase().includes(query.toLowerCase())
        );

        res.json({
            success: true,
            stations: filtered,
            count: filtered.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching stations',
            error: error.message
        });
    }
});

/**
 * Get All Stations
 * GET /api/stations
 */
app.get('/api/stations', (req, res) => {
    res.json({
        success: true,
        stations: mockStations,
        count: mockStations.length
    });
});

/**
 * Get Train Details
 * GET /api/trains/:trainNo
 */
app.get('/api/trains/:trainNo', (req, res) => {
    try {
        const { trainNo } = req.params;
        const train = mockTrains.find(t => t.trainNo === trainNo);

        if (!train) {
            return res.status(404).json({
                success: false,
                message: 'Train not found'
            });
        }

        // Add real-time status
        train.currentStatus = {
            location: 'Between Station A and B',
            nextStation: 'Station C',
            delayMinutes: 0,
            lastUpdated: new Date().toISOString()
        };

        res.json({
            success: true,
            train: train
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching train details',
            error: error.message
        });
    }
});

/**
 * Check PNR Status
 * GET /api/pnr/:pnrNumber
 */
app.get('/api/pnr/:pnrNumber', async (req, res) => {
    try {
        const { pnrNumber } = req.params;

        // Try real API first if configured
        if (RAILWAY_API_OPTIONS.API_SOURCE === 'RAPID_API') {
            try {
                const results = await fetchFromRapidAPI('/pnr-status', { pnr: pnrNumber });
                return res.json({
                    success: true,
                    pnr: pnrNumber,
                    data: results,
                    dataSource: 'RAPID_API'
                });
            } catch (apiError) {
                console.error('RapidAPI Error:', apiError.message);
            }
        }

        // Mock PNR Response
        const pnrData = {
            success: true,
            pnr: pnrNumber,
            bookingStatus: 'Confirmed',
            passengers: [
                { seatNo: '42', coachType: 'S1', status: 'Confirmed', bookingStatus: 'CNF/S1/42' },
                { seatNo: '43', coachType: 'S1', status: 'Confirmed', bookingStatus: 'CNF/S1/43' }
            ],
            trainDetails: {
                trainNo: '12015',
                trainName: 'Shatabdi Express',
                departure: '06:15',
                arrival: '16:30',
                from: 'NDLS',
                to: 'BCT'
            },
            journey: {
                from: 'Delhi Jn',
                to: 'Mumbai Central',
                date: '2024-01-20',
                class: '3A'
            },
            fare: {
                totalFare: 2500,
                tax: 450,
                grandTotal: 2950
            },
            lastUpdated: new Date().toISOString(),
            dataSource: 'MOCK_DATA'
        };

        res.json(pnrData);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking PNR',
            error: error.message
        });
    }
});

/**
 * Get Live Train Status
 * GET /api/live-status/:trainNo/:date
 */
app.get('/api/live-status/:trainNo/:date', async (req, res) => {
    try {
        const { trainNo, date } = req.params;

        // Try real API first if configured
        if (RAILWAY_API_OPTIONS.API_SOURCE === 'RAPID_API') {
            try {
                const results = await fetchFromRapidAPI('/live-status', { trainNo, date });
                return res.json({
                    success: true,
                    trainNo: trainNo,
                    data: results,
                    dataSource: 'RAPID_API'
                });
            } catch (apiError) {
                console.error('RapidAPI Error:', apiError.message);
            }
        }

        const train = mockTrains.find(t => t.trainNo === trainNo);
        if (!train) {
            return res.status(404).json({
                success: false,
                message: 'Train not found'
            });
        }

        // Generate dynamic mock status based on current time
        const delayMinutes = Math.floor(Math.random() * 30); // Random delay 0-30 mins
        const statusText = delayMinutes === 0 ? 'On Time' : `${delayMinutes} min Late`;

        const liveStatus = {
            success: true,
            trainNo: trainNo,
            trainName: train.trainName,
            date: date,
            statusIndicator: delayMinutes === 0 ? 'ON_TIME' : 'LATE',
            currentStatus: {
                location: 'Approaching Next Station',
                currentStation: train.route[1].name,
                nextStation: train.route[2].name,
                expectedArrival: '14:30',
                delayMinutes: delayMinutes,
                statusText: statusText,
                speed: 85, // km/h
                latitude: 28.6139,
                longitude: 77.2090
            },
            stations: train.route.map((s, index) => ({
                ...s,
                status: index < 2 ? 'Arrived' : (index === 2 ? 'Next' : 'Upcoming'),
                actualArrival: s.arrival,
                actualDeparture: s.departure
            })),
            lastUpdated: new Date().toISOString(),
            dataSource: 'MOCK_DATA'
        };

        res.json(liveStatus);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching live status',
            error: error.message
        });
    }
});

// ============================================
// Helper Functions
// ============================================

/**
 * Fetch data from RapidAPI Railway Services
 * Note: You need to get API key from https://rapidapi.com/
 */
async function fetchFromRapidAPI(endpoint, params) {
    try {
        const response = await axios({
            method: 'GET',
            url: `${RAILWAY_API_OPTIONS.RAPID_TRAIN_API_URL}${endpoint}`,
            headers: {
                'X-RapidAPI-Key': RAILWAY_API_OPTIONS.RAPID_API_KEY,
                'X-RapidAPI-Host': RAILWAY_API_OPTIONS.RAPID_API_HOST
            },
            params: params,
            timeout: 5000
        });
        return response.data;
    } catch (error) {
        console.error('RapidAPI Error:', error.message);
        throw error;
    }
}

/**
 * Fetch data from Official IRCTC API
 * Requires API Key and Secret from IRCTC developer portal
 */
async function fetchFromIRCTC(endpoint, params) {
    try {
        // IRCTC API uses different authentication
        // This is a template - actual implementation depends on IRCTC's API format
        const response = await axios({
            method: 'GET',
            url: `https://api.irctc.co.in/v1${endpoint}`,
            headers: {
                'Authorization': `Bearer ${RAILWAY_API_OPTIONS.IRCTC_API_KEY}`,
                'X-API-Key': RAILWAY_API_OPTIONS.IRCTC_API_SECRET,
                'Content-Type': 'application/json'
            },
            params: params,
            timeout: 5000
        });
        return response.data;
    } catch (error) {
        console.error('IRCTC API Error:', error.message);
        throw error;
    }
}

// ============================================
// Server Start
// ============================================
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚂 Track My Rail Backend running on http://localhost:${PORT}`);
    console.log(`${'='.repeat(60)}`);
    
    // Show which API source is being used
    const apiSource = RAILWAY_API_OPTIONS.API_SOURCE;
    console.log(`\n📡 Data Source: ${apiSource}`);
    
    if (apiSource === 'IRCTC_OFFICIAL') {
        console.log('   ✅ Using Official IRCTC API');
        console.log('   (Real-time data from irctc.co.in)');
    } else if (apiSource === 'RAPID_API') {
        console.log('   ✅ Using RapidAPI Third-Party');
        console.log('   (Real-time aggregated data)');
    } else {
        console.log('   ℹ️  Using MOCK DATA');
        console.log('   (Perfect for development & testing)');
        console.log('\n   💡 To enable real data:');
        console.log('      1. Get API key from RapidAPI or IRCTC');
        console.log('      2. Add to .env file');
        console.log('      3. Restart server');
    }
    
    console.log(`\n📍 Available Endpoints:`);
    console.log(`  GET /api/trains/search?from=NDLS&to=CSTM&date=2024-01-15`);
    console.log(`  GET /api/stations`);
    console.log(`  GET /api/stations/search?query=Delhi`);
    console.log(`  GET /api/trains/:trainNo`);
    console.log(`  GET /api/pnr/:pnrNumber`);
    console.log(`  GET /api/live-status/:trainNo/:date`);
    console.log(`${'='.repeat(60)}\n`);
});

module.exports = app;

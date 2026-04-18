/**
 * Track My Rail - Node.js Backend
 * Fetches real-time train data from alternative APIs
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 10000;

// ============================================
// Configuration (Must be before routes)
// ============================================
const RAILWAY_API_OPTIONS = {
    RAPID_API_KEY: process.env.RAPID_API_KEY,
    RAPID_API_HOST: process.env.RAPID_API_HOST || 'irctc-indian-railway-pnr-status.p.rapidapi.com',
    RAPID_TRAIN_API_URL: 'https://irctc-indian-railway-pnr-status.p.rapidapi.com',
    API_SOURCE: process.env.RAPID_API_KEY ? 'RAPID_API' : 'MOCK_DATA'
};

// ============================================
// Helper Functions
// ============================================

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

// ============================================
// Routes
// ============================================

app.get('/', (req, res) => {
    res.status(200).send('Backend is running and healthy!');
});

/**
 * Get PNR Status
 */
app.get('/api/pnr/:pnrNumber', async (req, res) => {
    try {
        const { pnrNumber } = req.params;

        if (RAILWAY_API_OPTIONS.API_SOURCE === 'RAPID_API') {
            try {
                const data = await fetchFromRapidAPI('/getPNRStatus', { pnrNumber });
                return res.json({
                    success: true,
                    pnr: pnrNumber,
                    data: data.data || data,
                    dataSource: 'RAPID_API'
                });
            } catch (apiError) {
                console.error('RapidAPI PNR Error:', apiError.message);
            }
        }
        res.status(404).json({ success: false, message: 'PNR status not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Search Stations
 */
app.get('/api/stations/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ success: false, message: 'Missing query' });

        if (RAILWAY_API_OPTIONS.API_SOURCE === 'RAPID_API') {
            try {
                const data = await fetchFromRapidAPI('/searchStation', { query });
                let stations = [];
                const rawData = data.data || data || [];
                if (Array.isArray(rawData)) {
                    stations = rawData.map(s => ({
                        name: s.station_name || s.name || s.stationName,
                        code: s.station_code || s.code || s.stationCode
                    }));
                }
                return res.json({ success: true, stations, dataSource: 'RAPID_API' });
            } catch (apiError) {
                console.error('RapidAPI Station Error:', apiError.message);
            }
        }
        res.json({ success: true, stations: [], dataSource: 'MOCK_DATA' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Search Trains Between Two Stations
 */
app.get('/api/trains/search', async (req, res) => {
    try {
        const { from, to, date } = req.query;

        if (!from || !to || !date) {
            return res.status(400).json({ success: false, message: 'Missing parameters' });
        }

        if (RAILWAY_API_OPTIONS.API_SOURCE === 'RAPID_API') {
            try {
                const data = await fetchFromRapidAPI('/getTrainBetweenStations', { 
                    fromStationCode: from, 
                    toStationCode: to, 
                    dateOfJourney: date 
                });
                
                let trains = [];
                const rawData = data.data || data || [];
                if (Array.isArray(rawData)) {
                    trains = rawData.map(t => ({
                        trainNumber: t.train_number || t.trainNo || t.trainNumber,
                        trainName: t.train_name || t.trainName,
                        from: t.from_station_name || t.source || from,
                        to: t.to_station_name || t.destination || to,
                        departureTime: t.departure_time || t.run_days || 'N/A',
                        arrivalTime: t.arrival_time || t.arrivalTime || 'N/A',
                        duration: t.duration || 'N/A',
                        status: 'Real-time',
                        classes: t.classes || ['SL', '3A', '2A', '1A']
                    }));
                }

                return res.json({
                    success: true,
                    trains: trains,
                    dataSource: 'RAPID_API'
                });
            } catch (apiError) {
                console.error('RapidAPI Search Error:', apiError.message);
            }
        }

        res.json({ success: true, trains: [], dataSource: 'MOCK_DATA' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Get Train Route
 */
app.get('/api/trains/:trainNo/route', async (req, res) => {
    try {
        const { trainNo } = req.params;

        if (RAILWAY_API_OPTIONS.API_SOURCE === 'RAPID_API') {
            try {
                const data = await fetchFromRapidAPI('/getTrainSchedule', { trainNo });
                return res.json({
                    success: true,
                    trainNo,
                    route: data.data || data,
                    dataSource: 'RAPID_API'
                });
            } catch (apiError) {
                console.error('RapidAPI Route Error:', apiError.message);
            }
        }
        res.status(404).json({ success: false, message: 'Route not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Get Live Train Status
 */
app.get('/api/trains/:trainNo/status', async (req, res) => {
    try {
        const { trainNo } = req.params;

        if (RAILWAY_API_OPTIONS.API_SOURCE === 'RAPID_API') {
            try {
                const data = await fetchFromRapidAPI('/getLiveTrainStatus', { trainNo, startDay: '0' });
                return res.json({
                    success: true,
                    trainNo,
                    data: data.data || data,
                    dataSource: 'RAPID_API'
                });
            } catch (apiError) {
                console.error('RapidAPI Live Error:', apiError.message);
            }
        }
        res.status(404).json({ success: false, message: 'Live status not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚂 Server is live and listening on 0.0.0.0:${PORT}`);
});

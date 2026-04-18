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
            return res.status(400).json({ success: false, message: 'Missing parameters' });
        }

        if (RAILWAY_API_OPTIONS.API_SOURCE === 'RAPID_API') {
            try {
                // Using endpoint name based on Amitesh's API (usually /getTrainBetweenStations)
                const data = await fetchFromRapidAPI('/getTrainBetweenStations', { 
                    fromStationCode: from, 
                    toStationCode: to, 
                    dateOfJourney: date 
                });
                return res.json({
                    success: true,
                    trains: data.data || data,
                    dataSource: 'RAPID_API'
                });
            } catch (apiError) {
                console.error('RapidAPI Search Error:', apiError.message);
            }
        }

        // Fallback to minimal mock if API fails or not configured
        res.json({ success: true, trains: [], dataSource: 'MOCK_DATA', message: 'No real data available' });
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
app.get('/api/live-status/:trainNo/:date', async (req, res) => {
    try {
        const { trainNo, date } = req.params;

        if (RAILWAY_API_OPTIONS.API_SOURCE === 'RAPID_API') {
            try {
                const data = await fetchFromRapidAPI('/getLiveTrainStatus', { trainNo, startDay: '0' }); // 0 for today
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

app.listen(PORT, () => {
    console.log(`🚂 Server running on port ${PORT}`);
});

app.listen(PORT, () => {
    console.log(`🚂 Server running on port ${PORT}`);
});

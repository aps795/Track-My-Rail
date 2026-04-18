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
    RAPID_API_HOST: process.env.RAPID_API_HOST || 'indian-railway-api.p.rapidapi.com',
    RAPID_TRAIN_API_URL: 'https://indian-railway-api.p.rapidapi.com',
    USE_MOCK_DATA: !process.env.RAPID_API_KEY,
    API_SOURCE: process.env.RAPID_API_KEY ? 'RAPID_API' : 'MOCK_DATA'
};

// ============================================
// Mock Database
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
    }
];

// ============================================
// API Endpoints
// ============================================

app.get('/api/trains/search', async (req, res) => {
    const { from, to, date } = req.query;
    res.json({ success: true, trains: mockTrains, dataSource: 'MOCK_DATA' });
});

app.get('/api/trains/:trainNo/route', async (req, res) => {
    const { trainNo } = req.params;
    const train = mockTrains.find(t => t.trainNo === trainNo);
    if (!train) return res.status(404).json({ success: false, message: 'Train not found' });
    res.json({ success: true, trainName: train.trainName, route: train.route, dataSource: 'MOCK_DATA' });
});

app.get('/api/live-status/:trainNo/:date', async (req, res) => {
    const { trainNo, date } = req.params;
    const train = mockTrains.find(t => t.trainNo === trainNo);
    if (!train) return res.status(404).json({ success: false, message: 'Train not found' });
    res.json({
        success: true,
        trainNo,
        statusIndicator: 'ON_TIME',
        currentStatus: { location: 'On Schedule', delayMinutes: 0 },
        dataSource: 'MOCK_DATA'
    });
});

app.listen(PORT, () => {
    console.log(`🚂 Server running on port ${PORT}`);
});

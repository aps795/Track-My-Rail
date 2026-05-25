// Backend Server with IRCTC Proxy
// Node.js + Express

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

const PORT = process.env.PORT || 5000;

// ============================================
// IRCTC API Integration Routes
// ============================================

// Mock IRCTC API Response (Replace with actual IRCTC API calls)
async function fetchIRCTCTrains(fromCode, toCode, date, classType) {
    try {
        // This is a mock response. In production, integrate with actual IRCTC API
        // You can use unofficial APIs or web scraping with proper authorization
        
        const mockTrains = [
            {
                trainNumber: '12002',
                trainName: 'Shatabdi Express',
                trainType: 'Express',
                fromStation: fromCode,
                toStation: toCode,
                departureTime: '06:15 AM',
                arrivalTime: '08:55 AM',
                duration: '2h 40m',
                distance: '206 km',
                availability: [
                    { classType: '1A', available: 5, waitlist: 0, price: 1250 },
                    { classType: '2A', available: 12, waitlist: 0, price: 850 },
                    { classType: 'SL', available: 25, waitlist: 0, price: 450 }
                ],
                runDays: 'Daily',
                platform: 'TBD',
                operatedBy: 'Indian Railways'
            },
            {
                trainNumber: '12382',
                trainName: 'Rajdhani Express',
                trainType: 'Superfast',
                fromStation: fromCode,
                toStation: toCode,
                departureTime: '04:00 PM',
                arrivalTime: '08:30 AM (Next Day)',
                duration: '16h 30m',
                distance: '1384 km',
                availability: [
                    { classType: '1A', available: 0, waitlist: 3, price: 5200 },
                    { classType: '2A', available: 8, waitlist: 0, price: 3500 },
                    { classType: '3A', available: 15, waitlist: 0, price: 2300 },
                    { classType: 'SL', available: 42, waitlist: 0, price: 1400 }
                ],
                runDays: 'Specific Days',
                platform: 'TBD',
                operatedBy: 'Indian Railways'
            },
            {
                trainNumber: '12424',
                trainName: 'Dibrugarh Express',
                trainType: 'Express',
                fromStation: fromCode,
                toStation: toCode,
                departureTime: '10:30 PM',
                arrivalTime: '10:45 AM (Next Day)',
                duration: '12h 15m',
                distance: '1060 km',
                availability: [
                    { classType: '2A', available: 6, waitlist: 0, price: 2800 },
                    { classType: '3A', available: 20, waitlist: 5, price: 1900 },
                    { classType: 'SL', available: 55, waitlist: 0, price: 1100 }
                ],
                runDays: 'Specific Days',
                platform: 'TBD',
                operatedBy: 'Indian Railways'
            }
        ];

        // Filter by class type if specified
        if (classType) {
            return mockTrains.map(train => ({
                ...train,
                availability: train.availability.filter(a => a.classType === classType)
            }));
        }

        return mockTrains;
    } catch (error) {
        console.error('Error fetching IRCTC trains:', error);
        throw error;
    }
}

// ============================================
// API Endpoints
// ============================================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});

// Search Trains Endpoint
app.post('/api/search-trains', async (req, res) => {
    try {
        const { fromCode, toCode, date, classType } = req.body;

        // Validate Input
        if (!fromCode || !toCode || !date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: fromCode, toCode, date'
            });
        }

        if (fromCode === toCode) {
            return res.status(400).json({
                success: false,
                message: 'Source and destination stations cannot be the same'
            });
        }

        // Fetch trains from IRCTC proxy
        const trains = await fetchIRCTCTrains(fromCode, toCode, date, classType);

        res.json({
            success: true,
            message: `Found ${trains.length} trains`,
            trains: trains,
            searchDate: date,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Search trains error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching trains',
            error: error.message
        });
    }
});

// Get Train Details by Number
app.get('/api/train/:trainNumber', async (req, res) => {
    try {
        const { trainNumber } = req.params;

        // Mock train details
        const trainDetails = {
            trainNumber: trainNumber,
            trainName: 'Sample Train',
            trainType: 'Express',
            routes: [
                { station: 'NDLS', arrivalTime: '10:00 AM', departureTime: '10:30 AM', day: 0, distance: 0 },
                { station: 'GZB', arrivalTime: '11:00 AM', departureTime: '11:15 AM', day: 0, distance: 65 },
                { station: 'AGC', arrivalTime: '02:00 PM', departureTime: '02:30 PM', day: 0, distance: 206 },
            ],
            coaches: [
                { coachNumber: 'A1', type: '1A', seats: 18 },
                { coachNumber: 'B1', type: '2A', seats: 48 },
                { coachNumber: 'C1', type: '3A', seats: 72 },
            ],
            timestamp: new Date()
        };

        res.json({
            success: true,
            trainDetails: trainDetails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching train details',
            error: error.message
        });
    }
});

// Get All Stations
app.get('/api/stations', (req, res) => {
    const stations = [
        { code: 'NDLS', name: 'Delhi', fullName: 'New Delhi Railway Station' },
        { code: 'MMCT', name: 'Mumbai', fullName: 'Mumbai Central' },
        { code: 'HWH', name: 'Kolkata', fullName: 'Howrah Junction' },
        { code: 'MAS', name: 'Chennai', fullName: 'Chennai Central' },
        { code: 'BLR', name: 'Bangalore', fullName: 'Bangalore City Junction' },
        { code: 'HYD', name: 'Hyderabad', fullName: 'Secunderabad Junction' },
        { code: 'AGC', name: 'Agra', fullName: 'Agra Cantonment' },
        { code: 'VAR', name: 'Varanasi', fullName: 'Varanasi Junction' },
        { code: 'JBP', name: 'Jabalpur', fullName: 'Jabalpur Junction' },
        { code: 'CSTM', name: 'Mumbai', fullName: 'Mumbai CST' },
        { code: 'LKO', name: 'Lucknow', fullName: 'Lucknow Junction' },
        { code: 'ALD', name: 'Allahabad', fullName: 'Allahabad Junction' },
        { code: 'GZB', name: 'Ghaziabad', fullName: 'Ghaziabad Junction' },
        { code: 'CNB', name: 'Kanpur', fullName: 'Kanpur Central' },
        { code: 'GWL', name: 'Gwalior', fullName: 'Gwalior Junction' },
    ];

    res.json({
        success: true,
        stations: stations,
        count: stations.length
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚂 Track My Rail Backend Server running on http://localhost:${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api/health`);
});

module.exports = app;

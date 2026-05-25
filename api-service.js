/**
 * Indian Rail API Service
 * Handles PNR checking and live train status queries
 */

const API_BASE_URL = 'http://indianrailapi.com/api/v2';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'; // Alternative proxy if needed

/**
 * Get PNR Status
 * @param {string} apiKey - Indian Rail API key
 * @param {string} pnrNumber - PNR number to check
 * @returns {Promise<Object>} PNR status data
 */
async function getPNRStatus(apiKey, pnrNumber) {
  try {
    const endpoint = `${API_BASE_URL}/PNRCheck/apikey/${apiKey}/PNRNumber/${pnrNumber}/Route/1/`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('PNR Status Response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching PNR status:', error);
    throw error;
  }
}

/**
 * Get Live Train Status
 * @param {string} apiKey - Indian Rail API key
 * @param {string} trainNumber - Train number to track
 * @param {string} dateOfJourney - Date in DDMMMYYYY format (e.g., 25May2026)
 * @returns {Promise<Object>} Train status data
 */
async function getLiveTrainStatus(apiKey, trainNumber, dateOfJourney) {
  try {
    const endpoint = `${API_BASE_URL}/livetrainstatus/apikey/${apiKey}/trainnumber/${trainNumber}/date/${dateOfJourney}/`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Live Train Status Response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching live train status:', error);
    throw error;
  }
}

/**
 * Format date for API (DDMMMYYYY format)
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
function formatDateForAPI(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day}${month}${year}`;
}

/**
 * Parse PNR status response and extract key information
 * @param {Object} pnrData - Raw PNR status data from API
 * @returns {Object} Parsed PNR information
 */
function parsePNRData(pnrData) {
  try {
    return {
      pnrNumber: pnrData.pnr_number || 'N/A',
      trainNumber: pnrData.train_number || 'N/A',
      trainName: pnrData.train_name || 'N/A',
      boardingStation: pnrData.boarding_station || 'N/A',
      destinationStation: pnrData.destination_station || 'N/A',
      journeyDate: pnrData.journey_date || 'N/A',
      reservationStatus: pnrData.reservation_status || 'N/A',
      passengers: pnrData.passengers || [],
      classType: pnrData.class_type || 'N/A',
      coachPosition: pnrData.coach_position || 'N/A',
      statusMessage: pnrData.message || 'No message'
    };
  } catch (error) {
    console.error('Error parsing PNR data:', error);
    return null;
  }
}

/**
 * Parse live train status response and extract key information
 * @param {Object} trainData - Raw train status data from API
 * @returns {Object} Parsed train information
 */
function parseTrainStatusData(trainData) {
  try {
    return {
      trainNumber: trainData.train_number || 'N/A',
      trainName: trainData.train_name || 'N/A',
      stationName: trainData.station_name || 'N/A',
      stationCode: trainData.station_code || 'N/A',
      arrivalTime: trainData.arrival_time || 'N/A',
      departureTime: trainData.departure_time || 'N/A',
      platform: trainData.platform || 'N/A',
      status: trainData.status || 'N/A',
      distance: trainData.distance || 'N/A',
      delay: trainData.delay || 0,
      routeStations: trainData.route || [],
      statusMessage: trainData.message || 'No message'
    };
  } catch (error) {
    console.error('Error parsing train status data:', error);
    return null;
  }
}

/**
 * Handle CORS issues with alternative fetch method
 * @param {string} url - URL to fetch
 * @returns {Promise<Response>}
 */
async function fetchWithCORS(url) {
  try {
    return await fetch(url);
  } catch (error) {
    console.warn('Direct fetch failed, trying with CORS proxy...');
    try {
      return await fetch(CORS_PROXY + url);
    } catch (proxyError) {
      throw new Error(`Failed to fetch: ${error.message}`);
    }
  }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getPNRStatus,
    getLiveTrainStatus,
    formatDateForAPI,
    parsePNRData,
    parseTrainStatusData,
    fetchWithCORS
  };
}

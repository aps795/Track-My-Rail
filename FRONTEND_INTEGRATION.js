// ============================================
// Track My Rail - Frontend Integration Guide
// ============================================
// 
// This file shows how to integrate your frontend
// with the new Track My Rail backend server.js
//
// IMPORTANT: Your main script.js already uses:
//   const API_BASE_URL = 'http://localhost:5000/api';
// 
// So if your backend server.js is running,
// everything should work automatically!

// ============================================
// Test Cases - Copy & Paste in Browser Console
// ============================================

/**
 * Test 1: Search Trains
 * Paste this in browser console and press Enter
 */
async function testTrainSearch() {
    try {
        const response = await fetch('http://localhost:5000/api/trains/search?from=NDLS&to=CSTM&date=2024-01-15');
        const data = await response.json();
        console.log('Trains Found:', data.trains);
        console.table(data.trains);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Usage: testTrainSearch()


/**
 * Test 2: Get All Stations
 */
async function testGetStations() {
    try {
        const response = await fetch('http://localhost:5000/api/stations');
        const data = await response.json();
        console.log('Stations:', data.stations);
        console.table(data.stations);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Usage: testGetStations()


/**
 * Test 3: Search Stations by Query
 */
async function testSearchStations(query) {
    try {
        const response = await fetch(`http://localhost:5000/api/stations/search?query=${query}`);
        const data = await response.json();
        console.log(`Stations for "${query}":`, data.stations);
        console.table(data.stations);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Usage: testSearchStations('Delhi')


/**
 * Test 4: Get Train Details
 */
async function testGetTrainDetails(trainNo) {
    try {
        const response = await fetch(`http://localhost:5000/api/trains/${trainNo}`);
        const data = await response.json();
        console.log(`Train ${trainNo} Details:`, data.train);
        console.log(data.train);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Usage: testGetTrainDetails('12015')


/**
 * Test 5: Check PNR Status
 */
async function testPNRStatus(pnrNumber) {
    try {
        const response = await fetch(`http://localhost:5000/api/pnr/${pnrNumber}`);
        const data = await response.json();
        console.log(`PNR ${pnrNumber} Status:`, data);
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Usage: testPNRStatus('1234567890')


/**
 * Test 6: Get Live Train Status
 */
async function testLiveStatus(trainNo, date) {
    try {
        const response = await fetch(`http://localhost:5000/api/live-status/${trainNo}/${date}`);
        const data = await response.json();
        console.log(`Live Status - Train ${trainNo}:`, data);
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Usage: testLiveStatus('12015', '2024-01-15')


// ============================================
// Integration with Existing Code
// ============================================

/**
 * Example: Update Your Train Search Function
 * 
 * Current code in your pages/train-search.js:
 * 
 *   async function handleStationAutocomplete(input, suggestionsId) {
 *       let filtered = [];
 *       try {
 *           const searchResult = await RailTrack.apiFetch(`/stations/search?query=${encodeURIComponent(value)}`);
 *           if (searchResult.ok && searchResult.data?.success) {
 *               filtered = searchResult.data.stations;
 *           }
 *       } catch (error) {
 *           console.error('Station autocomplete API error:', error);
 *       }
 *   }
 * 
 * ✅ This already works with the new backend!
 * Just make sure your backend server.js is running.
 */

/**
 * Example 2: Display Real Train Data in Table
 * 
 * HTML:
 *   <tbody id="trainResults"></tbody>
 * 
 * JavaScript:
 */
async function displayTrainResults(source, destination, date) {
    try {
        const url = `http://localhost:5000/api/trains/search?from=${source}&to=${destination}&date=${date}`;
        const response = await fetch(url);
        const data = await response.json();

        const tbody = document.getElementById('trainResults');
        tbody.innerHTML = ''; // Clear existing rows

        if (!data.success || data.trains.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8">No trains found</td></tr>';
            return;
        }

        data.trains.forEach(train => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${train.trainNo}</td>
                <td>${train.trainName}</td>
                <td>${train.departure}</td>
                <td>${train.arrival}</td>
                <td>${train.duration}</td>
                <td>${train.status}</td>
                <td>${train.availability.secondClass || 0}</td>
                <td>
                    <button onclick="viewTrainDetails('${train.trainNo}')">
                        Details
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error displaying trains:', error);
    }
}

// Usage: displayTrainResults('NDLS', 'CSTM', '2024-01-15')


/**
 * Example 3: Real-time Updates
 * Update train status every 10 seconds
 */
function startLiveStatusUpdates(trainNo, date) {
    setInterval(async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/live-status/${trainNo}/${date}`);
            const data = await response.json();

            // Update UI with real-time data
            console.log('Current Location:', data.currentStatus.location);
            console.log('Delay:', data.currentStatus.delayMinutes, 'minutes');

            // Update UI elements
            const locationDiv = document.getElementById('trainLocation');
            if (locationDiv) {
                locationDiv.textContent = data.currentStatus.location;
            }
        } catch (error) {
            console.error('Error updating live status:', error);
        }
    }, 10000); // Update every 10 seconds
}

// Usage: startLiveStatusUpdates('12015', '2024-01-15')


/**
 * Example 4: Integration with Your Existing apiFetch
 * 
 * Your code already has this in script.js:
 * 
 *   async function apiFetch(path, options = {}) {
 *       try {
 *           const response = await fetch(`${API_BASE_URL}${path}`, options);
 *           const data = await response.json();
 *           return { ok: response.ok, status: response.status, data };
 *       } catch (error) {
 *           console.error('API fetch error:', error);
 *           return { ok: false, status: 0, data: null, error };
 *       }
 *   }
 * 
 * This means you can use it like:
 */
async function exampleUsingExistingFunction() {
    // Assuming RailTrack.apiFetch is available
    const result = await RailTrack.apiFetch('/trains/search?from=NDLS&to=CSTM&date=2024-01-15');

    if (result.ok && result.data?.success) {
        console.log('Trains:', result.data.trains);
    } else {
        console.error('Failed to fetch trains');
    }
}


// ============================================
// 🚀 Quick Test in Browser Console
// ============================================
// 
// 1. Open your website in browser
// 2. Press F12 to open Developer Console
// 3. Copy & Paste ANY of these commands and press Enter:
//
//    testTrainSearch()
//    testGetStations()
//    testSearchStations('Delhi')
//    testGetTrainDetails('12015')
//    testPNRStatus('1234567890')
//    testLiveStatus('12015', '2024-01-15')
//
// 4. You should see real or mock data returned!
//
// ============================================

console.log('%c🚂 Track My Rail - Frontend Integration Ready', 'font-size: 16px; color: blue; font-weight: bold;');
console.log('Test functions available: testTrainSearch(), testGetStations(), etc.');

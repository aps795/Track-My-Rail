// Train Search JavaScript - Frontend Integration

// Mock station database
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

// DOM Elements
const trainSearchForm = document.getElementById('trainSearchForm');
const fromStationInput = document.getElementById('fromStation');
const toStationInput = document.getElementById('toStation');
const fromStationList = document.getElementById('fromStationList');
const toStationList = document.getElementById('toStationList');
const journeyDateInput = document.getElementById('journeyDate');
const classTypeSelect = document.getElementById('classType');
const swapBtn = document.getElementById('swapBtn');
const searchBtn = document.querySelector('.search-btn');
const resultsContainer = document.getElementById('resultsContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const noResults = document.getElementById('noResults');
const errorMessage = document.getElementById('errorMessage');
const fromCode = document.getElementById('fromCode');
const toCode = document.getElementById('toCode');

// Set minimum date to today
const today = new Date();
journeyDateInput.min = today.toISOString().split('T')[0];
journeyDateInput.value = today.toISOString().split('T')[0];

// API Base URL (configure based on environment)
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://track-my-rail-backend.vercel.app/api';

// Station Autocomplete Function
function filterStations(input) {
    const lowerInput = input.toLowerCase();
    return stations.filter(station =>
        station.name.toLowerCase().includes(lowerInput) ||
        station.code.toLowerCase().includes(lowerInput) ||
        station.fullName.toLowerCase().includes(lowerInput)
    );
}

// Show Suggestions Dropdown
function showSuggestions(input, dropdown, selectedCode) {
    if (input.length < 1) {
        dropdown.classList.remove('show');
        return;
    }

    const filtered = filterStations(input);

    if (filtered.length === 0) {
        dropdown.classList.remove('show');
        return;
    }

    dropdown.innerHTML = filtered
        .map(station => `<li data-code="${station.code}" data-name="${station.name}">${station.name} (${station.code})</li>`)
        .join('');

    dropdown.classList.add('show');
}

// Station Input Event Listeners
fromStationInput.addEventListener('input', (e) => {
    showSuggestions(e.target.value, fromStationList);
});

toStationInput.addEventListener('input', (e) => {
    showSuggestions(e.target.value, toStationList);
});

// Handle Station Selection
fromStationList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        const code = e.target.dataset.code;
        const name = e.target.dataset.name;
        fromStationInput.value = `${name} (${code})`;
        fromCode.textContent = code;
        fromStationList.classList.remove('show');
    }
});

toStationList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        const code = e.target.dataset.code;
        const name = e.target.dataset.name;
        toStationInput.value = `${name} (${code})`;
        toCode.textContent = code;
        toStationList.classList.remove('show');
    }
});

// Close Dropdown on Outside Click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.form-group')) {
        fromStationList.classList.remove('show');
        toStationList.classList.remove('show');
    }
});

// Swap Stations Function
swapBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const temp = fromStationInput.value;
    fromStationInput.value = toStationInput.value;
    toStationInput.value = temp;

    const tempCode = fromCode.textContent;
    fromCode.textContent = toCode.textContent;
    toCode.textContent = tempCode;
});

// Extract Station Code
function extractStationCode(stationString) {
    const match = stationString.match(/\(([A-Z0-9]+)\)$/);
    return match ? match[1] : null;
}

// Format Date for API
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Fetch Trains from Backend
async function searchTrains(fromCode, toCode, date, classType) {
    try {
        loadingSpinner.style.display = 'block';
        resultsContainer.innerHTML = '';
        noResults.style.display = 'none';
        errorMessage.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/search-trains`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fromCode,
                toCode,
                date,
                classType: classType || ''
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch trains');
        }

        const data = await response.json();
        loadingSpinner.style.display = 'none';

        if (data.success && data.trains && data.trains.length > 0) {
            displayTrains(data.trains);
        } else {
            showNoResults();
        }
    } catch (error) {
        loadingSpinner.style.display = 'none';
        showError(error.message || 'An error occurred while searching trains');
        console.error('Search error:', error);
    }
}

// Display Trains
function displayTrains(trains) {
    resultsContainer.innerHTML = trains
        .map((train, index) => createTrainCard(train, index))
        .join('');
}

// Create Train Card HTML
function createTrainCard(train, index) {
    const classAvailability = train.availability
        .map(avail => `
            <div class="class-availability">
                <span class="class-name">${avail.classType}</span>
                <span class="class-seats ${avail.available > 0 ? 'available' : avail.waitlist > 0 ? 'waitlist' : 'unavailable'}">
                    ${avail.available > 0 ? `${avail.available} Available` : avail.waitlist > 0 ? `WL ${avail.waitlist}` : 'NA'}
                </span>
                <span class="class-price">₹${avail.price}</span>
            </div>
        `)
        .join('');

    return `
        <div class="train-result">
            <div class="train-header">
                <div class="train-icon">
                    <i class="fas fa-train"></i>
                </div>
                <div class="train-info">
                    <h3>${train.trainNumber} - ${train.trainName}</h3>
                    <p>${train.trainType}</p>
                </div>
            </div>

            <div class="journey-details">
                <div class="time-row">
                    <div class="time-block">
                        <span class="time">${train.departureTime}</span>
                        <span class="station-name">${train.fromStation}</span>
                    </div>
                    <div class="duration">
                        <strong>${train.duration}</strong>
                        <div class="route-line"></div>
                    </div>
                    <div class="time-block">
                        <span class="time">${train.arrivalTime}</span>
                        <span class="station-name">${train.toStation}</span>
                    </div>
                </div>
            </div>

            <div class="availability">
                ${classAvailability}
            </div>

            <button class="book-btn" data-train-number="${train.trainNumber}">
                <i class="fas fa-ticket"></i> Book Now
            </button>
        </div>
    `;
}

// Show No Results
function showNoResults() {
    noResults.style.display = 'block';
    resultsContainer.innerHTML = '';
}

// Show Error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'flex';
    resultsContainer.innerHTML = '';
}

// Form Submit Handler
trainSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fromCode = extractStationCode(fromStationInput.value);
    const toCode = extractStationCode(toStationInput.value);
    const date = formatDate(journeyDateInput.value);
    const classType = classTypeSelect.value;

    if (!fromCode || !toCode) {
        showError('Please select valid stations');
        return;
    }

    if (fromCode === toCode) {
        showError('Please select different stations');
        return;
    }

    searchTrains(fromCode, toCode, date, classType);
});

// Book Button Handler
resultsContainer.addEventListener('click', (e) => {
    if (e.target.closest('.book-btn')) {
        const trainNumber = e.target.closest('.book-btn').dataset.trainNumber;
        alert(`Redirecting to book train ${trainNumber}...\n\nNote: Booking feature coming soon!`);
        // TODO: Implement booking redirect
    }
});

// Load example trains on page load (for demo)
window.addEventListener('load', () => {
    // Uncomment to auto-load demo data
    // loadDemoTrains();
});

// Demo Function (optional)
function loadDemoTrains() {
    const demoTrains = [
        {
            trainNumber: '12002',
            trainName: 'Shatabdi Express',
            trainType: 'Express',
            fromStation: 'Delhi',
            toStation: 'Agra',
            departureTime: '06:15 AM',
            arrivalTime: '08:55 AM',
            duration: '2h 40m',
            availability: [
                { classType: '1A', available: 5, waitlist: 0, price: 1250 },
                { classType: '2A', available: 12, waitlist: 0, price: 850 }
            ]
        },
        {
            trainNumber: '12382',
            trainName: 'Rajdhani Express',
            trainType: 'Express',
            fromStation: 'Delhi',
            toStation: 'Mumbai',
            departureTime: '04:00 PM',
            arrivalTime: '08:30 AM',
            duration: '16h 30m',
            availability: [
                { classType: '1A', available: 0, waitlist: 3, price: 5200 },
                { classType: '2A', available: 8, waitlist: 0, price: 3500 },
                { classType: '3A', available: 15, waitlist: 0, price: 2300 }
            ]
        }
    ];
    displayTrains(demoTrains);
}

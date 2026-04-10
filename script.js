// ============================================
// RailTrack - Main JavaScript
// ============================================

const API_BASE_URL = 'http://localhost:5000/api';

// API helper wrapper
async function apiFetch(path, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${path}`, options);
        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        console.error('API fetch error:', error);
        return { ok: false, status: 0, data: null, error };
    }
}

async function loginUser(email, password) {
    const response = await apiFetch('/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        throw new Error(response.data?.message || 'Login failed');
    }

    saveToLocalStorage('token', response.data.token);
    saveToLocalStorage('user', response.data.user);
    return response.data;
}

function logoutUser() {
    clearLocalStorage('token');
    clearLocalStorage('user');
}

function getAuthHeaders() {
    const token = getFromLocalStorage('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function setupAuthNav() {
    const authLink = document.querySelector('.login-btn');
    const token = getFromLocalStorage('token');
    const user = getFromLocalStorage('user');
    const isPageFolder = window.location.pathname.includes('/pages/') || window.location.pathname.endsWith('/pages');

    if (!authLink) return;

    if (token) {
        authLink.textContent = 'Logout';
        authLink.href = '#';
        authLink.removeEventListener('click', handleLogout);
        authLink.addEventListener('click', handleLogout);
    } else {
        authLink.textContent = 'Login';
        authLink.href = isPageFolder ? 'login.html' : 'pages/login.html';
    }

    if (user && authLink.parentElement) {
        const existingUserLabel = document.getElementById('userLabel');
        if (!existingUserLabel) {
            const span = document.createElement('span');
            span.id = 'userLabel';
            span.textContent = `Hi, ${user.name}`;
            span.style.color = '#fff';
            span.style.marginLeft = '16px';
            authLink.parentElement.appendChild(span);
        }
    }
}

function handleLogout(event) {
    event.preventDefault();
    logoutUser();
    showSuccess('You have been logged out successfully');
    const isPageFolder = window.location.pathname.includes('/pages/') || window.location.pathname.endsWith('/pages');
    const homePage = isPageFolder ? '../index.html' : 'index.html';

    setTimeout(() => {
        window.location.href = homePage;
    }, 1200);
}

async function fetchTrains(from, to, date, classType = '') {
    const query = new URLSearchParams({ from, to, date });
    if (classType) query.set('classType', classType);
    const response = await apiFetch(`/trains/search?${query.toString()}`);
    if (response.ok && response.data?.success) {
        return response.data.trains;
    }
    return [];
}

async function fetchTrainStatus(trainNumber) {
    const response = await apiFetch(`/trains/${trainNumber}/status`);
    if (response.ok && response.data?.success) {
        return response.data;
    }
    return null;
}

async function fetchTrainRoute(trainNumber) {
    const response = await apiFetch(`/trains/${trainNumber}/route`);
    if (response.ok && response.data?.success) {
        return response.data;
    }
    return null;
}

// Hamburger Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }

    // Set minimum date to today
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }

    setupAuthNav();
    // Initialize station autocomplete
    initializeStationAutocomplete();

    // Handle quick search form
    const quickSearchForm = document.getElementById('quickSearchForm');
    if (quickSearchForm) {
        quickSearchForm.addEventListener('submit', handleQuickSearch);
    }
});

// Initialize Station Autocomplete
async function initializeStationAutocomplete() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');

    if (fromInput) {
        fromInput.addEventListener('input', function() {
            handleStationAutocomplete(this, 'fromSuggestions');
        });

        fromInput.addEventListener('blur', function() {
            setTimeout(() => {
                const suggestions = document.getElementById('fromSuggestions');
                if (suggestions) suggestions.classList.remove('show');
            }, 200);
        });
    }

    if (toInput) {
        toInput.addEventListener('input', function() {
            handleStationAutocomplete(this, 'toSuggestions');
        });

        toInput.addEventListener('blur', function() {
            setTimeout(() => {
                const suggestions = document.getElementById('toSuggestions');
                if (suggestions) suggestions.classList.remove('show');
            }, 200);
        });
    }
}

// Handle Station Autocomplete
async function handleStationAutocomplete(input, suggestionsId) {
    const value = input.value.trim();
    if (value.length < 2) {
        const suggestions = document.getElementById(suggestionsId);
        if (suggestions) suggestions.classList.remove('show');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/stations/search?query=${value}`);
        const data = await response.json();
        displaySuggestions(data.stations || [], suggestionsId, input);
    } catch (error) {
        console.error('Error fetching stations:', error);
    }
}

// Display Suggestions
function displaySuggestions(stations, suggestionsId, input) {
    const suggestionsList = document.getElementById(suggestionsId);
    if (!suggestionsList) return;

    suggestionsList.innerHTML = '';
    stations.forEach(station => {
        const li = document.createElement('li');
        li.textContent = `${station.name} (${station.code})`;
        li.addEventListener('click', function() {
            input.value = station.code;
            suggestionsList.classList.remove('show');
        });
        suggestionsList.appendChild(li);
    });

    if (stations.length > 0) {
        suggestionsList.classList.add('show');
    }
}

// Handle Quick Search
async function handleQuickSearch(e) {
    e.preventDefault();
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;

    if (!from || !to || !date) {
        showError('Please fill all fields');
        return;
    }

    // Redirect to train search page with parameters
    window.location.href = `pages/train-search.html?from=${from}&to=${to}&date=${date}`;
}

// Show Error Message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.insertBefore(errorDiv, document.body.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Show Success Message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.insertBefore(successDiv, document.body.firstChild);
    setTimeout(() => successDiv.remove(), 5000);
}

// Format Time (HH:MM)
function formatTime(time) {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
}

// Format Date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Calculate Duration
function calculateDuration(departure, arrival) {
    try {
        const [depHours, depMinutes] = departure.split(':').map(Number);
        const [arrHours, arrMinutes] = arrival.split(':').map(Number);

        let depTotalMinutes = depHours * 60 + depMinutes;
        let arrTotalMinutes = arrHours * 60 + arrMinutes;

        // If arrival is next day
        if (arrTotalMinutes < depTotalMinutes) {
            arrTotalMinutes += 24 * 60;
        }

        const diffMinutes = arrTotalMinutes - depTotalMinutes;
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        return `${hours}h ${minutes}m`;
    } catch {
        return 'N/A';
    }
}

// Fetch User Search History
async function fetchSearchHistory() {
    try {
        const token = getFromLocalStorage('token');
        if (!token) return [];

        const response = await apiFetch('/search-history', {
            headers: {
                ...getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch history');
        return response.data?.history || [];
    } catch (error) {
        console.error('Error fetching search history:', error);
        return [];
    }
}

// Add to Search History
async function addToSearchHistory(searchData) {
    try {
        const token = getFromLocalStorage('token');
        if (!token) return;

        await apiFetch('/search-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(searchData)
        });
    } catch (error) {
        console.error('Error adding to search history:', error);
    }
}

// Get Status Badge HTML
function getStatusBadge(status) {
    let badgeClass = 'badge-success';
    if (status === 'Delayed') {
        badgeClass = 'badge-warning';
    } else if (status === 'Cancelled') {
        badgeClass = 'badge-danger';
    }
    return `<span class="badge ${badgeClass}">${status}</span>`;
}

// Local Storage Helpers
function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromLocalStorage(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
}

function clearLocalStorage(key) {
    localStorage.removeItem(key);
}

// Mock Stations Data (Replace with API call in production)
const mockStations = [
    { code: 'NDLS', name: 'New Delhi' },
    { code: 'MUM', name: 'Mumbai Central' },
    { code: 'BCT', name: 'Mumbai Beach' },
    { code: 'BLR', name: 'Bangalore' },
    { code: 'CHE', name: 'Chennai Central' },
    { code: 'CCT', name: 'Cochin' },
    { code: 'HWH', name: 'Howrah' },
    { code: 'CSMT', name: 'Chhatrapati Shivaji Terminus' },
    { code: 'DEL', name: 'Delhi' },
    { code: 'AGC', name: 'Agra Cantt' },
    { code: 'GWL', name: 'Gwalior' },
    { code: 'JYP', name: 'Jaipur' },
    { code: 'LKO', name: 'Lucknow' },
    { code: 'KOL', name: 'Kolkata' },
    { code: 'ASR', name: 'Amritsar' },
    { code: 'AMB', name: 'Ambala' },
    { code: 'CNB', name: 'Kanpur Central' },
    { code: 'BPL', name: 'Bhopal' },
    { code: 'IDW', name: 'Indore' },
    { code: 'JSM', name: 'Jamshedpur' }
];

// Get Mock Trains (Replace with real API)
function getMockTrains(from, to, date) {
    return [
        {
            trainNumber: '15001',
            trainName: 'Rajdhani Express',
            from: from,
            to: to,
            departureTime: '18:00',
            arrivalTime: '06:30',
            duration: '12h 30m',
            status: 'On Time',
            coachAvailability: 500,
            classes: ['1AC', '2AC', '3AC', 'SL'],
            date: date
        },
        {
            trainNumber: '15002',
            trainName: 'Shatabdi Express',
            from: from,
            to: to,
            departureTime: '06:00',
            arrivalTime: '15:30',
            duration: '9h 30m',
            status: 'Delayed',
            coachAvailability: 150,
            classes: ['1AC', '2AC'],
            date: date
        },
        {
            trainNumber: '15003',
            trainName: 'Garib Rath Express',
            from: from,
            to: to,
            departureTime: '21:00',
            arrivalTime: '09:00',
            duration: '12h',
            status: 'On Time',
            coachAvailability: 400,
            classes: ['3AC', 'SL'],
            date: date
        }
    ];
}

// Export functions for use in other pages
window.RailTrack = {
    API_BASE_URL,
    showError,
    showSuccess,
    formatTime,
    formatDate,
    calculateDuration,
    apiFetch,
    loginUser,
    logoutUser,
    getAuthHeaders,
    setupAuthNav,
    fetchTrains,
    fetchTrainStatus,
    fetchTrainRoute,
    fetchSearchHistory,
    addToSearchHistory,
    getStatusBadge,
    saveToLocalStorage,
    getFromLocalStorage,
    clearLocalStorage,
    mockStations,
    getMockTrains
};

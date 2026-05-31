// RailTrack - Main JavaScript (Final Live Update)
// ============================================

// UPDATE THIS: Replace with your actual live Render backend URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://track-my-rail.onrender.com/api';

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

// ----------------------------------------------------
// INTELLIGENT CACHE MANAGER
// ----------------------------------------------------
const CacheManager = {
    set: function(key, data, ttlMinutes) {
        const now = new Date().getTime();
        const item = {
            data: data,
            expiry: now + (ttlMinutes * 60 * 1000)
        };
        localStorage.setItem('cache_' + key, JSON.stringify(item));
    },
    get: function(key) {
        const itemStr = localStorage.getItem('cache_' + key);
        if (!itemStr) return null;
        try {
            const item = JSON.parse(itemStr);
            if (new Date().getTime() > item.expiry) {
                localStorage.removeItem('cache_' + key);
                return null;
            }
            return item.data;
        } catch(e) {
            return null;
        }
    }
};

// ----------------------------------------------------
// LOCAL DATA LAYER (Zero API Search)
// ----------------------------------------------------
let localTrains = [];
let localStations = [];

async function initLocalData() {
    try {
        // Handle relative paths depending on where script is loaded from
        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        const [trainsRes, stationsRes] = await Promise.all([
            fetch(basePath + 'data/trains.json'),
            fetch(basePath + 'data/stations.json')
        ]);
        if (trainsRes.ok) localTrains = await trainsRes.json();
        if (stationsRes.ok) localStations = await stationsRes.json();
        console.log('✅ Local Data Layer Initialized');
    } catch (e) {
        console.error('Failed to load local datasets', e);
    }
}

// Initialize on script load
initLocalData();


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
    
    try {
        const response = await apiFetch(`/trains/search?${query.toString()}`);
        if (response.ok && response.data?.success) {
            if (response.data.dataSource === 'MOCK_DATA') {
                throw new Error('API_LIMIT_EXCEEDED');
            }
            if (response.data.trains && response.data.trains.length > 0) {
                console.log('Real-time trains loaded from API');
                return response.data.trains;
            } else {
                console.warn('API returned success but no trains found for this route');
                return [];
            }
        } else {
            console.error('API Search Error:', response.data?.message || 'Unknown error');
            throw new Error('API_ERROR');
        }
    } catch (err) {
        console.error('Failed to connect to backend:', err.message);
        throw err;
    }
}

async function fetchTrainStatus(trainNumber) {
    const cacheKey = `status_${trainNumber}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) {
        console.log('⚡ Returning cached train status (2m TTL)');
        return cached;
    }

    try {
        const response = await apiFetch(`/trains/${trainNumber}/status`);
        if (response.ok && response.data?.success) {
            CacheManager.set(cacheKey, response.data, 2); // 2 minutes TTL
            return response.data;
        } else {
            console.error('Status Error:', response.data?.message);
        }
    } catch (err) {
        console.error('Failed to connect to backend:', err.message);
    }
    return null;
}

async function fetchTrainRoute(trainNumber) {
    const cacheKey = `route_${trainNumber}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) {
        console.log('⚡ Returning cached train route (30d TTL)');
        return cached;
    }

    try {
        const response = await apiFetch(`/trains/${trainNumber}/route`);
        if (response.ok && response.data?.success) {
            CacheManager.set(cacheKey, response.data, 30 * 24 * 60); // 30 days TTL
            return response.data;
        } else {
            console.error('Route Error:', response.data?.message);
        }
    } catch (err) {
        console.error('Failed to connect to backend:', err.message);
    }
    return null;
}

async function fetchPNRStatus(pnrNumber) {
    const cacheKey = `pnr_${pnrNumber}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) {
        console.log('⚡ Returning cached PNR (5m TTL)');
        return cached;
    }

    try {
        const response = await apiFetch(`/pnr/${pnrNumber}`);
        if (response.ok && response.data?.success) {
            CacheManager.set(cacheKey, response.data.pnr, 5); // 5 minutes TTL
            return response.data.pnr;
        } else {
            console.error('PNR API Error:', response.data?.message || 'Unknown error');
        }
    } catch (err) {
        console.error('Failed to connect to backend:', err.message);
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

// Async Live Search Functions - Now powered by LOCAL DATA ONLY (0 API calls)
async function fuzzySearchTrains(query) {
    query = query.toLowerCase().trim();
    if (!query || query.length < 2) return [];
    
    // Fallback if localTrains didn't load for some reason
    if (!localTrains || localTrains.length === 0) return [];

    return localTrains.filter(t => 
        t.trainNumber.includes(query) || 
        t.trainName.toLowerCase().includes(query)
    ).map(t => ({
        trainNumber: t.trainNumber,
        trainName: t.trainName,
        from: t.source,
        to: t.destination
    })).slice(0, 10);
}

async function fuzzySearchStations(query) {
    query = query.toLowerCase().trim();
    if (!query || query.length < 2) return [];
    
    if (!localStations || localStations.length === 0) return [];

    return localStations.filter(s => 
        s.code.toLowerCase().includes(query) || 
        s.name.toLowerCase().includes(query) ||
        s.city.toLowerCase().includes(query)
    ).slice(0, 10);
}

// Seat Availability & Fare Enquiry APIs
async function fetchSeatAvailability(trainNo, from, to, date, classType) {
    const cacheKey = `seat_${trainNo}_${from}_${to}_${date}_${classType}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    try {
        const response = await apiFetch(`/seat-availability?trainNo=${trainNo}&from=${from}&to=${to}&date=${date}&classType=${classType}`);
        if (response.ok && response.data?.success) {
            if (response.data.dataSource === 'MOCK_DATA') throw new Error('API_LIMIT_EXCEEDED');
            CacheManager.set(cacheKey, response.data, 5); // 5m TTL
            return response.data;
        }
        throw new Error('API_ERROR');
    } catch(err) {
        console.error(err);
        throw err;
    }
}

async function fetchFareEnquiry(trainNo, from, to, classType) {
    const cacheKey = `fare_${trainNo}_${from}_${to}_${classType}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    try {
        const response = await apiFetch(`/fare-enquiry?trainNo=${trainNo}&from=${from}&to=${to}&classType=${classType}`);
        if (response.ok && response.data?.success) {
            if (response.data.dataSource === 'MOCK_DATA') throw new Error('API_LIMIT_EXCEEDED');
            CacheManager.set(cacheKey, response.data, 24 * 60); // 24h TTL
            return response.data;
        }
        throw new Error('API_ERROR');
    } catch(err) {
        console.error(err);
        throw err;
    }
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
    searchTrains: fetchTrains,
    fetchTrainStatus,
    fetchTrainRoute,
    fetchPNRStatus,
    fetchSearchHistory,
    addToSearchHistory,
    getStatusBadge,
    saveToLocalStorage,
    getFromLocalStorage,
    clearLocalStorage,
    fuzzySearchTrains,
    fuzzySearchStations,
    fetchSeatAvailability,
    fetchFareEnquiry
};

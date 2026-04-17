// ============================================
// Train Search Page - JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Set minimum date to today
    const dateInput = document.getElementById('searchDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;

    // Initialize autocomplete
    initializeSearchAutocomplete();

    // Handle form submission
    const searchForm = document.getElementById('trainSearchForm');
    searchForm.addEventListener('submit', handleTrainSearch);

    // Get URL parameters if available
    const params = new URLSearchParams(window.location.search);
    if (params.has('from')) {
        document.getElementById('searchFrom').value = params.get('from');
        document.getElementById('searchTo').value = params.get('to');
        document.getElementById('searchDate').value = params.get('date');
        handleTrainSearch(new Event('submit'));
    }
});

function initializeSearchAutocomplete() {
    const fromInput = document.getElementById('searchFrom');
    const toInput = document.getElementById('searchTo');

    fromInput.addEventListener('input', function() {
        handleStationAutocomplete(this, 'searchFromSuggestions');
    });

    fromInput.addEventListener('blur', function() {
        setTimeout(() => {
            const suggestions = document.getElementById('searchFromSuggestions');
            if (suggestions) suggestions.classList.remove('show');
        }, 200);
    });

    toInput.addEventListener('input', function() {
        handleStationAutocomplete(this, 'searchToSuggestions');
    });

    toInput.addEventListener('blur', function() {
        setTimeout(() => {
            const suggestions = document.getElementById('searchToSuggestions');
            if (suggestions) suggestions.classList.remove('show');
        }, 200);
    });
}

async function handleStationAutocomplete(input, suggestionsId) {
    const value = input.value.trim();
    if (value.length < 1) {
        const suggestions = document.getElementById(suggestionsId);
        if (suggestions) suggestions.classList.remove('show');
        return;
    }

    let filtered = [];
    try {
        const searchResult = await RailTrack.apiFetch(`/stations/search?query=${encodeURIComponent(value)}`);
        if (searchResult.ok && searchResult.data?.success) {
            filtered = searchResult.data.stations;
        }
    } catch (error) {
        console.error('Station autocomplete API error:', error);
    }

    if (!filtered.length) {
        filtered = RailTrack.mockStations.filter(station =>
            station.code.includes(value.toUpperCase()) || station.name.toUpperCase().includes(value.toUpperCase())
        );
    }

    displaySearchSuggestions(filtered, suggestionsId, input);
}

function displaySearchSuggestions(stations, suggestionsId, input) {
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
    } else {
        suggestionsList.classList.remove('show');
    }
}

async function handleTrainSearch(e) {
    if (e.type === 'submit') {
        e.preventDefault();
    }

    const from = document.getElementById('searchFrom').value.toUpperCase();
    const to = document.getElementById('searchTo').value.toUpperCase();
    const date = document.getElementById('searchDate').value;
    const classType = document.getElementById('classType').value;

    if (!from || !to || !date) {
        RailTrack.showError('Please fill all required fields');
        return;
    }

    if (from === to) {
        RailTrack.showError('From and To stations cannot be same');
        return;
    }

    showLoading(true);
    hideResults();

    try {
        const trains = await RailTrack.fetchTrains(from, to, date, classType);
        let filteredTrains = trains;

        if (!trains || trains.length === 0) {
            filteredTrains = RailTrack.getMockTrains(from, to, date);
        }

        if (classType) {
            filteredTrains = filteredTrains.filter(train => train.classes.includes(classType));
        }

        displayResults(from, to, date, filteredTrains);
        showLoading(false);

        RailTrack.addToSearchHistory({
            from,
            to,
            journeyDate: date,
            classType,
            searchTime: new Date().toISOString(),
            resultsCount: filteredTrains.length
        });
    } catch (error) {
        console.error('Error searching trains:', error);
        RailTrack.showError('Error searching trains. Please try again.');
        showLoading(false);
    }
}

function displayResults(from, to, date, trains) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsTitle = document.getElementById('resultsTitle');
    const trainsList = document.getElementById('trainsList');

    resultsTitle.textContent = `Trains from ${from} to ${to} on ${RailTrack.formatDate(date)}`;

    if (trains.length === 0) {
        const noResults = document.getElementById('noResultsSection');
        noResults.style.display = 'block';
        resultsSection.style.display = 'none';
        return;
    }

    trainsList.innerHTML = '';
    trains.forEach(train => {
        const card = createTrainCard(train);
        trainsList.appendChild(card);
    });

    resultsSection.style.display = 'block';
    document.getElementById('noResultsSection').style.display = 'none';
    document.getElementById('filterSection').style.display = 'block';

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createTrainCard(train) {
    const card = document.createElement('div');
    card.className = 'result-card';

    const statusBadge = RailTrack.getStatusBadge(train.status);
    const duration = RailTrack.calculateDuration(train.departureTime, train.arrivalTime);

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div>
                <h3>${train.trainName}</h3>
                <p style="color: #666; font-size: 0.9rem;">Train #${train.trainNumber}</p>
            </div>
            ${statusBadge}
        </div>

        <div class="result-info">
            <div class="info-item">
                <div class="info-label">Departure</div>
                <div class="info-value">${RailTrack.formatTime(train.departureTime)}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Arrival</div>
                <div class="info-value">${RailTrack.formatTime(train.arrivalTime)}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Duration</div>
                <div class="info-value">${duration}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Available Seats</div>
                <div class="info-value">${train.coachAvailability}</div>
            </div>
        </div>

        <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
            ${train.classes.map(cls => `<span style="background-color: #f0f0f0; padding: 5px 12px; border-radius: 5px; font-size: 0.85rem; color: #666;">${cls}</span>`).join('')}
        </div>

        <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button class="btn-view-route" onclick="viewTrainRoute('${train.trainNumber}', '${train.trainName}')" style="flex: 1; padding: 10px 15px; background-color: #003da5; color: white; border: none; border-radius: 5px; cursor: pointer; transition: all 0.3s ease;">
                <i class="fas fa-route"></i> View Route
            </button>
            <button class="btn-book" onclick="bookTrain('${train.trainNumber}')" style="flex: 1; padding: 10px 15px; background-color: #f39c12; color: white; border: none; border-radius: 5px; cursor: pointer; transition: all 0.3s ease;">
                <i class="fas fa-bookmark"></i> Book Now
            </button>
        </div>
    `;

    return card;
}

async function viewTrainRoute(trainNumber, trainName) {
    const routeData = await RailTrack.fetchTrainRoute(trainNumber);
    if (routeData) {
        RailTrack.showSuccess(`Loaded route details for ${trainName}`);
        console.log('Train route details:', routeData.route);
    } else {
        RailTrack.showError('Route details are currently unavailable');
    }
}

function bookTrain(trainNumber) {
    RailTrack.showSuccess(`Booking flow is not configured, but you selected Train #${trainNumber}`);
}

function showLoading(show) {
    const loading = document.getElementById('loadingSection');
    if (show) {
        loading.style.display = 'block';
    } else {
        loading.style.display = 'none';
    }
}

function hideResults() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('noResultsSection').style.display = 'none';
    document.getElementById('filterSection').style.display = 'none';
}

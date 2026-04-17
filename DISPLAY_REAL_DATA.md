# How to Display Real Train Data in Your Frontend

## Overview

Your backend is now ready to provide real IRCTC data. This guide shows you how to display that data beautifully in your frontend.

---

## 🎯 What You'll Build

A train search results table showing:
- Train Number & Name
- Departure & Arrival Times
- Duration
- Current Status
- Seat Availability
- Booking Button

---

## 📝 Update Your pages/train-search.html

Add this table structure to show search results:

```html
<!-- Add this after the search form in train-search.html -->

<section class="search-results">
    <div class="results-container">
        <h2 id="resultsTitle"></h2>
        
        <div id="noResults" class="no-results" style="display: none;">
            <p>❌ No trains found for the selected route and date.</p>
            <p>Try different dates or stations.</p>
        </div>

        <table id="trainTable" class="trains-table" style="display: none;">
            <thead>
                <tr>
                    <th>Train No.</th>
                    <th>Train Name</th>
                    <th>Route</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Availability</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="trainTableBody">
                <!-- Results will be inserted here -->
            </tbody>
        </table>

        <div id="loadingSpinner" class="loading-spinner">
            <div class="spinner"></div>
            <p>Searching trains...</p>
        </div>
    </div>
</section>

<style>
    .search-results {
        margin-top: 40px;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .trains-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }

    .trains-table thead {
        background: #2c3e50;
        color: white;
    }

    .trains-table th {
        padding: 15px;
        text-align: left;
        font-weight: 600;
    }

    .trains-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #ecf0f1;
    }

    .trains-table tbody tr:hover {
        background: #f8f9fa;
    }

    .status-on-time {
        color: #27ae60;
        font-weight: bold;
    }

    .status-delayed {
        color: #e74c3c;
        font-weight: bold;
    }

    .availability-high {
        color: #27ae60;
    }

    .availability-medium {
        color: #f39c12;
    }

    .availability-low {
        color: #e74c3c;
    }

    .book-btn {
        padding: 8px 16px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
    }

    .book-btn:hover {
        background: #2980b9;
    }

    .loading-spinner {
        text-align: center;
        padding: 40px;
    }

    .spinner {
        border: 4px solid #ecf0f1;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .no-results {
        text-align: center;
        padding: 40px;
        color: #7f8c8d;
    }
</style>
```

---

## 💻 Update Your pages/train-search.js

Replace or update the `handleTrainSearch` function:

```javascript
/**
 * Handle Train Search Form Submission
 */
async function handleTrainSearch(event) {
    event.preventDefault();

    const from = document.getElementById('searchFrom').value.trim();
    const to = document.getElementById('searchTo').value.trim();
    const date = document.getElementById('searchDate').value;

    if (!from || !to || !date) {
        alert('Please fill all fields');
        return;
    }

    // Show loading spinner
    showLoadingSpinner(true);

    try {
        // Call backend API
        const response = await RailTrack.apiFetch(
            `/trains/search?from=${from}&to=${to}&date=${date}`
        );

        if (response.ok && response.data?.success) {
            displayTrainSearchResults(response.data);
        } else {
            showNoResults('Error fetching trains. Please try again.');
        }
    } catch (error) {
        console.error('Search error:', error);
        showNoResults('Network error. Please check your connection.');
    } finally {
        showLoadingSpinner(false);
    }
}

/**
 * Display Train Search Results in Table
 */
function displayTrainSearchResults(data) {
    const { trains, source, destination, date, dataSource } = data;

    // Update title
    const resultsTitle = document.getElementById('resultsTitle');
    resultsTitle.innerHTML = `
        <span>Trains from ${source} to ${destination} on ${date}</span>
        <small class="data-source-badge">${dataSource}</small>
    `;

    if (!trains || trains.length === 0) {
        showNoResults('No trains found for this route and date.');
        return;
    }

    // Clear previous results
    const tableBody = document.getElementById('trainTableBody');
    tableBody.innerHTML = '';

    // Display each train in table
    trains.forEach((train, index) => {
        const row = createTrainRow(train, index);
        tableBody.appendChild(row);
    });

    // Show table, hide no-results
    document.getElementById('trainTable').style.display = 'table';
    document.getElementById('noResults').style.display = 'none';
}

/**
 * Create Table Row for Each Train
 */
function createTrainRow(train, index) {
    const row = document.createElement('tr');

    // Determine availability color
    const availability = train.availability?.secondClass || 0;
    let availabilityClass = 'availability-high';
    if (availability < 20) availabilityClass = 'availability-low';
    else if (availability < 50) availabilityClass = 'availability-medium';

    // Determine status color
    const statusClass = train.status === 'On Time' ? 'status-on-time' : 'status-delayed';

    row.innerHTML = `
        <td><strong>${train.trainNo}</strong></td>
        <td>${train.trainName}</td>
        <td>${train.source?.slice(0, 3).toUpperCase()} → ${train.destination?.slice(0, 3).toUpperCase()}</td>
        <td>${train.departure}</td>
        <td>${train.arrival}</td>
        <td>${train.duration || 'N/A'}</td>
        <td class="${statusClass}">${train.status}</td>
        <td class="${availabilityClass}">${availability} seats</td>
        <td>
            <button class="book-btn" onclick="bookTrain('${train.trainNo}', '${train.trainName}')">
                Book
            </button>
        </td>
    `;

    return row;
}

/**
 * Show/Hide Loading Spinner
 */
function showLoadingSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    const table = document.getElementById('trainTable');
    const noResults = document.getElementById('noResults');

    if (show) {
        spinner.style.display = 'block';
        table.style.display = 'none';
        noResults.style.display = 'none';
    } else {
        spinner.style.display = 'none';
    }
}

/**
 * Show No Results Message
 */
function showNoResults(message) {
    const noResults = document.getElementById('noResults');
    const table = document.getElementById('trainTable');
    const spinner = document.getElementById('loadingSpinner');

    noResults.querySelector('p').textContent = message;
    noResults.style.display = 'block';
    table.style.display = 'none';
    spinner.style.display = 'none';

    document.getElementById('resultsTitle').innerHTML = 'Search Results';
}

/**
 * Handle Train Booking
 */
function bookTrain(trainNo, trainName) {
    alert(`Booking train ${trainNo} (${trainName}). Redirecting to booking page...`);
    // Later: Redirect to booking page with train details
    // window.location.href = `booking.html?trainNo=${trainNo}&trainName=${trainName}`;
}
```

---

## 🎨 Add Status Badge Styling (in styles.css)

```css
.data-source-badge {
    display: inline-block;
    background: #2ecc71;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-left: 10px;
}

.data-source-badge.mock {
    background: #95a5a6;
}

.data-source-badge.real {
    background: #27ae60;
}
```

---

## 📊 Real Data Response Example

When your backend has RAPID_API_KEY set:

```json
{
  "success": true,
  "dataSource": "RAPID_API",
  "count": 5,
  "trains": [
    {
      "trainNo": "12015",
      "trainName": "Shatabdi Express",
      "source": "Delhi Jn",
      "destination": "Mumbai Central",
      "departure": "06:15",
      "arrival": "16:30",
      "duration": "10h 15m",
      "status": "On Time",
      "distance": 1448,
      "availability": {
        "firstClass": 45,
        "secondClass": 120,
        "sleeper": 200
      }
    },
    // ... more trains
  ]
}
```

---

## 🔄 Real-Time Updates (Optional)

Add this to refresh results automatically:

```javascript
/**
 * Auto-refresh results every 5 minutes
 */
let autoRefreshInterval;

function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        const from = document.getElementById('searchFrom').value;
        const to = document.getElementById('searchTo').value;
        const date = document.getElementById('searchDate').value;

        if (from && to && date) {
            console.log('Auto-refreshing train data...');
            handleTrainSearch(new Event('submit'));
        }
    }, 5 * 60 * 1000); // 5 minutes
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
}

// Start when page loads with search results
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('from')) {
        // Auto-refresh if we have search parameters
        startAutoRefresh();
    }
});
```

---

## 📱 Mobile Responsive

Make the table responsive for mobile:

```css
@media (max-width: 768px) {
    .trains-table {
        font-size: 12px;
    }

    .trains-table th,
    .trains-table td {
        padding: 8px 5px;
    }

    .book-btn {
        padding: 6px 12px;
        font-size: 11px;
    }
}

@media (max-width: 480px) {
    .trains-table {
        display: block;
        width: 100%;
    }

    .trains-table thead {
        display: none;
    }

    .trains-table tbody tr {
        display: block;
        margin-bottom: 15px;
        border: 1px solid #ecf0f1;
    }

    .trains-table td {
        display: block;
        text-align: right;
        padding-left: 50%;
        border: none;
        position: relative;
    }

    .trains-table td::before {
        content: attr(data-label);
        position: absolute;
        left: 6px;
        font-weight: bold;
    }
}
```

---

## ✅ Testing Checklist

- [ ] Backend running with `npm start`
- [ ] API returns data: http://localhost:5000/api/trains/search?from=NDLS&to=CSTM&date=2024-01-15
- [ ] Search form submits without error
- [ ] Table displays trains
- [ ] Status colors show correctly
- [ ] Booking button works
- [ ] Loads with test stations: NDLS to CSTM
- [ ] Works on mobile view

---

## 🎯 Next Steps

1. ✅ Add this HTML/CSS to train-search.html
2. ✅ Update train-search.js with new functions
3. ✅ Test with mock data (no API key needed)
4. ✅ Get RapidAPI key when ready
5. ✅ Add to .env and restart
6. ✅ See real IRCTC data!

---

## 💡 Pro Tips

### Show Data Source:
```javascript
// Shows user whether they're seeing real or mock data
console.log('Data Source:', data.dataSource); // RAPID_API, IRCTC_OFFICIAL, or MOCK_DATA
```

### Handle Different Availability Formats:
```javascript
// Different APIs return availability differently
const seats = train.availability?.secondClass 
           || train.seats 
           || train.availability 
           || 0;
```

### Add Filters:
```javascript
// Filter by price or stops
const affordable = trains.filter(t => t.fare < 2000);
const directTrains = trains.filter(t => !t.stops || t.stops === 0);
```

---

## 🚀 You're Ready!

Your frontend is now set up to display real IRCTC train data beautifully!

Next: Test it out and customize colors/styles to match your design.

Happy building! 🚂

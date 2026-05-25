/**
 * Data Handler
 * Manages API responses, caching, and local storage
 */

const STORAGE_KEYS = {
  PNR_HISTORY: 'tmr_pnr_history',
  TRAIN_HISTORY: 'tmr_train_history',
  API_KEY: 'tmr_api_key',
  LAST_SEARCH: 'tmr_last_search',
  CACHED_PNR: 'tmr_cached_pnr',
  CACHED_TRAIN: 'tmr_cached_train'
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Save data to local storage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
function saveToStorage(key, data) {
  try {
    const timestamp = new Date().getTime();
    const storageData = {
      data: data,
      timestamp: timestamp
    };
    localStorage.setItem(key, JSON.stringify(storageData));
    console.log(`Data saved to storage: ${key}`);
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
}

/**
 * Retrieve data from local storage
 * @param {string} key - Storage key
 * @returns {any} Stored data or null
 */
function getFromStorage(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    return parsed.data;
  } catch (error) {
    console.error('Error retrieving from storage:', error);
    return null;
  }
}

/**
 * Check if cached data is still valid
 * @param {string} key - Storage key
 * @returns {boolean} True if cache is valid
 */
function isCacheValid(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return false;
    
    const parsed = JSON.parse(item);
    const age = new Date().getTime() - parsed.timestamp;
    return age < CACHE_DURATION;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
}

/**
 * Store API key securely
 * @param {string} apiKey - API key to store
 */
function saveAPIKey(apiKey) {
  saveToStorage(STORAGE_KEYS.API_KEY, apiKey);
}

/**
 * Retrieve saved API key
 * @returns {string|null} Saved API key
 */
function getAPIKey() {
  return getFromStorage(STORAGE_KEYS.API_KEY);
}

/**
 * Add PNR search to history
 * @param {Object} pnrData - PNR search data
 */
function addPNRToHistory(pnrData) {
  try {
    let history = getFromStorage(STORAGE_KEYS.PNR_HISTORY) || [];
    if (!Array.isArray(history)) history = [];
    
    const entry = {
      pnrNumber: pnrData.pnrNumber,
      trainName: pnrData.trainName,
      journeyDate: pnrData.journeyDate,
      reservationStatus: pnrData.reservationStatus,
      timestamp: new Date().toISOString(),
      fullData: pnrData
    };
    
    history.unshift(entry); // Add to beginning
    history = history.slice(0, 50); // Keep last 50
    
    saveToStorage(STORAGE_KEYS.PNR_HISTORY, history);
  } catch (error) {
    console.error('Error adding to PNR history:', error);
  }
}

/**
 * Add train status search to history
 * @param {Object} trainData - Train status search data
 */
function addTrainToHistory(trainData) {
  try {
    let history = getFromStorage(STORAGE_KEYS.TRAIN_HISTORY) || [];
    if (!Array.isArray(history)) history = [];
    
    const entry = {
      trainNumber: trainData.trainNumber,
      trainName: trainData.trainName,
      stationName: trainData.stationName,
      status: trainData.status,
      timestamp: new Date().toISOString(),
      fullData: trainData
    };
    
    history.unshift(entry); // Add to beginning
    history = history.slice(0, 50); // Keep last 50
    
    saveToStorage(STORAGE_KEYS.TRAIN_HISTORY, history);
  } catch (error) {
    console.error('Error adding to train history:', error);
  }
}

/**
 * Get PNR search history
 * @returns {Array} Array of PNR search entries
 */
function getPNRHistory() {
  const history = getFromStorage(STORAGE_KEYS.PNR_HISTORY) || [];
  return Array.isArray(history) ? history : [];
}

/**
 * Get train status search history
 * @returns {Array} Array of train status search entries
 */
function getTrainHistory() {
  const history = getFromStorage(STORAGE_KEYS.TRAIN_HISTORY) || [];
  return Array.isArray(history) ? history : [];
}

/**
 * Clear all search history
 */
function clearAllHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.PNR_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.TRAIN_HISTORY);
    console.log('All history cleared');
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

/**
 * Cache PNR response
 * @param {string} pnrNumber - PNR number
 * @param {Object} data - PNR data to cache
 */
function cachePNRResponse(pnrNumber, data) {
  const cacheKey = `${STORAGE_KEYS.CACHED_PNR}_${pnrNumber}`;
  saveToStorage(cacheKey, data);
}

/**
 * Get cached PNR response
 * @param {string} pnrNumber - PNR number
 * @returns {Object|null} Cached PNR data
 */
function getCachedPNRResponse(pnrNumber) {
  const cacheKey = `${STORAGE_KEYS.CACHED_PNR}_${pnrNumber}`;
  if (isCacheValid(cacheKey)) {
    return getFromStorage(cacheKey);
  }
  return null;
}

/**
 * Cache train status response
 * @param {string} trainNumber - Train number
 * @param {string} date - Journey date
 * @param {Object} data - Train status data to cache
 */
function cacheTrainStatusResponse(trainNumber, date, data) {
  const cacheKey = `${STORAGE_KEYS.CACHED_TRAIN}_${trainNumber}_${date}`;
  saveToStorage(cacheKey, data);
}

/**
 * Get cached train status response
 * @param {string} trainNumber - Train number
 * @param {string} date - Journey date
 * @returns {Object|null} Cached train status data
 */
function getCachedTrainStatusResponse(trainNumber, date) {
  const cacheKey = `${STORAGE_KEYS.CACHED_TRAIN}_${trainNumber}_${date}`;
  if (isCacheValid(cacheKey)) {
    return getFromStorage(cacheKey);
  }
  return null;
}

/**
 * Export data as JSON
 * @returns {Object} All stored data
 */
function exportAllData() {
  return {
    pnrHistory: getPNRHistory(),
    trainHistory: getTrainHistory(),
    exportDate: new Date().toISOString()
  };
}

/**
 * Clear all data
 */
function clearAllData() {
  try {
    localStorage.clear();
    console.log('All data cleared from local storage');
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    saveToStorage,
    getFromStorage,
    isCacheValid,
    saveAPIKey,
    getAPIKey,
    addPNRToHistory,
    addTrainToHistory,
    getPNRHistory,
    getTrainHistory,
    clearAllHistory,
    cachePNRResponse,
    getCachedPNRResponse,
    cacheTrainStatusResponse,
    getCachedTrainStatusResponse,
    exportAllData,
    clearAllData,
    STORAGE_KEYS,
    CACHE_DURATION
  };
}

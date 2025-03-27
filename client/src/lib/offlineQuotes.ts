import { QuoteWithCategory } from '@shared/schema';

const LOCAL_STORAGE_KEYS = {
  DAILY_QUOTE: 'offline_daily_quote',
  FEATURED_QUOTES: 'offline_featured_quotes',
  FAVORITE_QUOTES: 'offline_favorite_quotes',
  LAST_SYNC: 'offline_last_sync'
};

/**
 * Saves the daily quote to local storage for offline use
 */
export const saveDailyQuoteOffline = (quote: QuoteWithCategory | null): void => {
  if (quote) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.DAILY_QUOTE, JSON.stringify(quote));
  }
};

/**
 * Retrieves the daily quote from local storage for offline use
 */
export const getDailyQuoteOffline = (): QuoteWithCategory | null => {
  const savedQuote = localStorage.getItem(LOCAL_STORAGE_KEYS.DAILY_QUOTE);
  if (savedQuote) {
    try {
      return JSON.parse(savedQuote);
    } catch (error) {
      console.error('Failed to parse offline daily quote:', error);
      return null;
    }
  }
  return null;
};

/**
 * Saves featured quotes to local storage for offline use
 */
export const saveFeaturedQuotesOffline = (quotes: QuoteWithCategory[]): void => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.FEATURED_QUOTES, JSON.stringify(quotes));
};

/**
 * Retrieves featured quotes from local storage for offline use
 */
export const getFeaturedQuotesOffline = (): QuoteWithCategory[] => {
  const savedQuotes = localStorage.getItem(LOCAL_STORAGE_KEYS.FEATURED_QUOTES);
  if (savedQuotes) {
    try {
      return JSON.parse(savedQuotes);
    } catch (error) {
      console.error('Failed to parse offline featured quotes:', error);
      return [];
    }
  }
  return [];
};

/**
 * Saves favorite quotes to local storage for offline use
 */
export const saveFavoriteQuotesOffline = (quotes: QuoteWithCategory[]): void => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITE_QUOTES, JSON.stringify(quotes));
};

/**
 * Retrieves favorite quotes from local storage for offline use
 */
export const getFavoriteQuotesOffline = (): QuoteWithCategory[] => {
  const savedQuotes = localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITE_QUOTES);
  if (savedQuotes) {
    try {
      return JSON.parse(savedQuotes);
    } catch (error) {
      console.error('Failed to parse offline favorite quotes:', error);
      return [];
    }
  }
  return [];
};

/**
 * Updates the last sync timestamp
 */
export const updateLastSync = (): void => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_SYNC, Date.now().toString());
};

/**
 * Checks if we should sync offline data
 * Returns true if it's been more than a day since last sync or no sync has occurred
 */
export const shouldSync = (): boolean => {
  const lastSync = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SYNC);
  if (!lastSync) {
    return true;
  }
  
  const lastSyncTime = parseInt(lastSync, 10);
  const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  return Date.now() - lastSyncTime > oneDayMs;
};

/**
 * Detects if the app is running in offline mode
 */
export const isOffline = (): boolean => {
  return !navigator.onLine;
};

/**
 * Register offline event listeners
 * @param onOffline Function to call when going offline
 * @param onOnline Function to call when coming back online
 */
export const registerOfflineListeners = (
  onOffline: () => void, 
  onOnline: () => void
): () => void => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};
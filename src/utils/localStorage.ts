/**
 * Safely parse JSON from localStorage
 * @param key - localStorage key
 * @param fallback - fallback value if parsing fails
 * @returns parsed value or fallback
 */
export const safeParseJSON = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to parse localStorage key: ${key}`, error);
    // Clean up corrupted data
    localStorage.removeItem(key);
    return fallback;
  }
};

/**
 * Safely set JSON to localStorage
 * @param key - localStorage key
 * @param value - value to store
 * @returns true if successful, false otherwise
 */
export const safeSetJSON = <T,>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set localStorage key: ${key}`, error);
    return false;
  }
};

/**
 * Safely remove item from localStorage
 * @param key - localStorage key
 */
export const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage key: ${key}`, error);
  }
};

/**
 * Safely clear all localStorage
 */
export const safeClearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear localStorage', error);
  }
};

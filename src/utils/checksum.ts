/**
 * Checksum Utilities
 * Prevent tampering with checkout data in localStorage
 */

import CryptoJS from 'crypto-js';

export interface CheckoutItem {
  productId: number;
  name: string;
  sku: string;
  price: number;
  image: string;
  quantity: number;
  size?: string | number;
}

/**
 * Create checksum for checkout items
 * Only includes critical fields: productId, quantity, price
 * @param items - Array of checkout items
 * @returns SHA256 checksum string
 */
export const createCheckoutChecksum = (items: CheckoutItem[]): string => {
  // Only include fields that affect order validity
  const criticalData = items.map(item => ({
    id: item.productId,
    qty: item.quantity,
    price: item.price,
    size: item.size || null,
  }));

  // Sort by productId to ensure consistent ordering
  criticalData.sort((a, b) => a.id - b.id);

  const dataString = JSON.stringify(criticalData);
  return CryptoJS.SHA256(dataString).toString();
};

/**
 * Verify checkout items integrity
 * @param items - Current checkout items
 * @param storedChecksum - Checksum stored in localStorage
 * @returns True if data is valid, false if tampered
 */
export const verifyCheckoutIntegrity = (
  items: CheckoutItem[],
  storedChecksum: string | null
): boolean => {
  if (!storedChecksum) {
    return false;
  }

  const currentChecksum = createCheckoutChecksum(items);
  return currentChecksum === storedChecksum;
};

/**
 * Save checkout items with checksum to localStorage
 * @param items - Checkout items to save
 * @param storageKey - localStorage key for items
 * @param checksumKey - localStorage key for checksum
 */
export const saveCheckoutWithChecksum = (
  items: CheckoutItem[],
  storageKey: string = 'checkoutItems',
  checksumKey: string = 'checkoutChecksum'
): void => {
  const checksum = createCheckoutChecksum(items);
  localStorage.setItem(storageKey, JSON.stringify(items));
  localStorage.setItem(checksumKey, checksum);
};

/**
 * Load and verify checkout items from localStorage
 * @param storageKey - localStorage key for items
 * @param checksumKey - localStorage key for checksum
 * @returns Checkout items if valid, null if tampered or not found
 */
export const loadCheckoutWithVerification = (
  storageKey: string = 'checkoutItems',
  checksumKey: string = 'checkoutChecksum'
): CheckoutItem[] | null => {
  try {
    const itemsStr = localStorage.getItem(storageKey);
    const storedChecksum = localStorage.getItem(checksumKey);

    if (!itemsStr) {
      return null;
    }

    const items: CheckoutItem[] = JSON.parse(itemsStr);

    // Verify integrity
    if (!verifyCheckoutIntegrity(items, storedChecksum)) {
      console.warn('⚠️ Checkout data integrity check failed - possible tampering detected');
      return null;
    }

    return items;
  } catch (error) {
    console.error('Error loading checkout items:', error);
    return null;
  }
};

/**
 * Clear checkout data and checksum from localStorage
 * @param storageKey - localStorage key for items
 * @param checksumKey - localStorage key for checksum
 */
export const clearCheckoutData = (
  storageKey: string = 'checkoutItems',
  checksumKey: string = 'checkoutChecksum'
): void => {
  localStorage.removeItem(storageKey);
  localStorage.removeItem(checksumKey);
};

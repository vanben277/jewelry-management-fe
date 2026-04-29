/**
 * Application Constants
 * Centralized constants to avoid magic numbers and strings
 */

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PRODUCT_PAGE_SIZE: 12,
  ORDER_PAGE_SIZE: 20,
  ADMIN_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Account Status
export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  BANNED: 'BANNED',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MANAGER: 'MANAGER',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'COD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  ZALOPAY: 'ZALOPAY',
  MOMO: 'MOMO',
  VNPAY: 'VNPAY',
} as const;

// Product Status
export const PRODUCT_STATUS = {
  IN_STOCK: 'IN_STOCK',
  SOLD_OUT: 'SOLD_OUT',
  DISCONTINUED: 'DISCONTINUED',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

// Gold Types
export const GOLD_TYPES = {
  GOLD_24K: 'GOLD_24K',
  GOLD_18K: 'GOLD_18K',
  GOLD_14K: 'GOLD_14K',
  GOLD_10K: 'GOLD_10K',
} as const;

// Gender
export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER_INFO: 'userInfo',
  USER_ID: 'userId',
  AUTH: 'auth',
  CART: 'cart',
  CHECKOUT_ITEMS: 'checkoutItems',
  LAST_ORDER: 'lastOrder',
  SELECTED_CATEGORY: 'selectedCategory',
} as const;

// API Timeouts
export const TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 60000,  // 60 seconds for file uploads
  LONG: 120000,   // 2 minutes for heavy operations
} as const;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 50,
  MIN_USERNAME_LENGTH: 4,
  MAX_USERNAME_LENGTH: 30,
  PHONE_REGEX: /^(0[3|5|7|8|9])+([0-9]{8})$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Toast Duration
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Price Ranges (in VND)
export const PRICE_RANGES = {
  UNDER_1M: { min: 0, max: 1000000, label: 'Dưới 1 triệu' },
  FROM_1M_TO_3M: { min: 1000000, max: 3000000, label: '1 - 3 triệu' },
  FROM_3M_TO_5M: { min: 3000000, max: 5000000, label: '3 - 5 triệu' },
  FROM_5M_TO_10M: { min: 5000000, max: 10000000, label: '5 - 10 triệu' },
  OVER_10M: { min: 10000000, max: 999999999, label: 'Trên 10 triệu' },
} as const;

// Sort Options
export const SORT_OPTIONS = {
  NEWEST: { field: 'dateOfEntry', direction: 'desc', label: 'Sản phẩm mới nhất' },
  PRICE_DESC: { field: 'price', direction: 'desc', label: 'Giá từ cao đến thấp' },
  PRICE_ASC: { field: 'price', direction: 'asc', label: 'Giá từ thấp đến cao' },
} as const;

// Image Settings
export const IMAGE_SETTINGS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_IMAGES_PER_PRODUCT: 10,
} as const;

// Default Values
export const DEFAULTS = {
  BANNER_URL: 'https://cdn.pnj.io/images/promo/235/1200x450-nhan-t01-25.jpg',
  AVATAR_URL: '/img/default-avatar.jpg',
  PRODUCT_IMAGE_URL: '/img/default-product.jpg',
} as const;

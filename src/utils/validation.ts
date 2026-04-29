import { VALIDATION } from '../constants/app';

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate phone number (Vietnamese format)
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Số điện thoại không được để trống' };
  }

  if (!VALIDATION.PHONE_REGEX.test(phone)) {
    return { isValid: false, error: 'Số điện thoại không hợp lệ' };
  }

  return { isValid: true };
};

/**
 * Validate email
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email không được để trống' };
  }

  if (!VALIDATION.EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Email không hợp lệ' };
  }

  return { isValid: true };
};

/**
 * Validate password
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Mật khẩu không được để trống' };
  }

  if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      error: `Mật khẩu phải có ít nhất ${VALIDATION.MIN_PASSWORD_LENGTH} ký tự`,
    };
  }

  if (password.length > VALIDATION.MAX_PASSWORD_LENGTH) {
    return {
      isValid: false,
      error: `Mật khẩu không được vượt quá ${VALIDATION.MAX_PASSWORD_LENGTH} ký tự`,
    };
  }

  return { isValid: true };
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string,
): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Vui lòng xác nhận mật khẩu' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Mật khẩu xác nhận không khớp' };
  }

  return { isValid: true };
};

/**
 * Validate username
 */
export const validateUsername = (username: string): ValidationResult => {
  if (!username || !username.trim()) {
    return { isValid: false, error: 'Tên đăng nhập không được để trống' };
  }

  if (username.length < VALIDATION.MIN_USERNAME_LENGTH) {
    return {
      isValid: false,
      error: `Tên đăng nhập phải có ít nhất ${VALIDATION.MIN_USERNAME_LENGTH} ký tự`,
    };
  }

  if (username.length > VALIDATION.MAX_USERNAME_LENGTH) {
    return {
      isValid: false,
      error: `Tên đăng nhập không được vượt quá ${VALIDATION.MAX_USERNAME_LENGTH} ký tự`,
    };
  }

  return { isValid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (
  value: string,
  fieldName: string,
): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} không được để trống` };
  }

  return { isValid: true };
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): ValidationResult => {
  const { MAX_SIZE, ALLOWED_TYPES } = {
    MAX_SIZE: 5 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  };

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Chỉ chấp nhận file ảnh định dạng JPG, PNG, WEBP',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: `Kích thước file không được vượt quá ${MAX_SIZE / 1024 / 1024}MB`,
    };
  }

  return { isValid: true };
};

/**
 * Helper: Check if phone is valid (simple boolean return)
 */
export const isValidPhone = (phone: string): boolean => {
  return validatePhone(phone).isValid;
};

/**
 * Helper: Check if email is valid (simple boolean return)
 */
export const isValidEmail = (email: string): boolean => {
  return validateEmail(email).isValid;
};

/**
 * Helper: Check if password is valid (simple boolean return)
 */
export const isValidPassword = (password: string): boolean => {
  return validatePassword(password).isValid;
};

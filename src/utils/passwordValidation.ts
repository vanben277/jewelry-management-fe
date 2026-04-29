/**
 * Password Validation Utilities
 * Centralized password strength and validation logic
 */

export interface PasswordRequirements {
  length: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
}

/**
 * Get password requirements status
 * @param password - Password string to validate
 * @returns Object with boolean status for each requirement
 */
export const getPasswordRequirements = (password: string): PasswordRequirements => ({
  length: password.length >= 8 && password.length <= 16,
  lowercase: /[a-z]/.test(password),
  uppercase: /[A-Z]/.test(password),
  number: /\d/.test(password),
  special: /[@$!%*?&]/.test(password),
});

/**
 * Calculate password strength score (0-5)
 * @param password - Password string to evaluate
 * @returns Strength score from 0 to 5
 */
export const getPasswordStrength = (password: string): number => {
  const reqs = getPasswordRequirements(password);
  return Object.values(reqs).filter(Boolean).length;
};

/**
 * Check if password meets all security requirements
 * @param password - Password string to validate
 * @returns True if password meets all requirements, false otherwise
 */
export const isStrongPassword = (password: string): boolean => {
  const reqs = getPasswordRequirements(password);
  return Object.values(reqs).every(Boolean);
};

/**
 * Get password strength label in Vietnamese
 * @param password - Password string to evaluate
 * @returns Strength label: "Yếu", "Trung bình", or "Mạnh"
 */
export const getPasswordStrengthLabel = (password: string): string => {
  const strength = getPasswordStrength(password);
  if (strength <= 2) return "Yếu";
  if (strength <= 4) return "Trung bình";
  return "Mạnh";
};

/**
 * Get password strength CSS class
 * @param password - Password string to evaluate
 * @returns CSS class name for strength indicator
 */
export const getPasswordStrengthClass = (password: string): string => {
  const strength = getPasswordStrength(password);
  if (strength <= 2) return "bg-red-500";
  if (strength <= 4) return "bg-yellow-500";
  return "bg-green-500";
};

/**
 * Get password strength color class (for text)
 * @param password - Password string to evaluate
 * @returns CSS class name for text color
 */
export const getPasswordStrengthTextClass = (password: string): string => {
  const strength = getPasswordStrength(password);
  if (strength <= 2) return "text-red-500";
  if (strength <= 4) return "text-yellow-600";
  return "text-green-600";
};

/**
 * Validate password using regex (alternative method)
 * @param password - Password string to validate
 * @returns True if password matches regex pattern
 */
export const validatePasswordRegex = (password: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/.test(password);
};

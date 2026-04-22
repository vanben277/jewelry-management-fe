export const ERROR_CODES = {
  INVALID_CREDENTIALS: "400021",
  ACCOUNT_DISABLED: "400022",
  ACCOUNT_BANNED: "400023",
  ACCOUNT_UNVERIFIED: "400024",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.INVALID_CREDENTIALS]:
    "Tài Khoản hoặc Mật Khẩu không đúng. Vui lòng thử lại!",
  [ERROR_CODES.ACCOUNT_DISABLED]: "Tài khoản đã bị vô hiệu hóa!",
  [ERROR_CODES.ACCOUNT_BANNED]: "Tài khoản đã bị khóa!",
  [ERROR_CODES.ACCOUNT_UNVERIFIED]: "Tài khoản chưa được xác thực!",
};

export const AUTH_BLOCKING_CODES = new Set<string>([
  ERROR_CODES.ACCOUNT_DISABLED,
  ERROR_CODES.ACCOUNT_BANNED,
  ERROR_CODES.ACCOUNT_UNVERIFIED,
]);

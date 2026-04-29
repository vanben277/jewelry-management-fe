// Generic API Response
export interface ApiResponse<T> {
  message: string;
  data: T;
  errorMessage?: string;
}

// API Error Types
export interface ApiErrorResponse {
  errorCode?: string;
  errorMessage?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  response?: {
    status?: number;
    statusText?: string;
    data?: ApiErrorResponse;
  };
  message?: string;
  code?: string;
}

// Authentication
export interface LoginResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  avatar: string;
  status: AccountStatus;
  role: UserRole;
  accessToken: string;
}

export interface PageResponse<T> {
  content: T[];
  number: number;
  totalPages: number;
  totalElements: number;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  gender: string;
  phone: string;
  address: string;
  userName: string;
  password: string;
  avatar?: File;
}

// Account
export interface Account {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  avatar: string;
  status: AccountStatus;
  role: UserRole;
  lastLoginAt: string | null;
  createAt?: string;
  updateAt?: string;
}

export type AccountStatus = "ACTIVE" | "BANNED" | "INACTIVE" | "PENDING";
export type UserRole = "ADMIN" | "STAFF" | "USER";
export type PaymentMethod = "COD" | "BANK_TRANSFER" | "ZALOPAY";

// Product
export interface Product {
  id: number;
  name: string;
  displayName: string;
  sku: string;
  price: number;
  costPrice: number;
  quantity: number;
  description: string;
  status: ProductStatus;
  goldType: string;
  categoryId: number;
  categoryName: string;
  primaryImageUrl: string;
  isDeleted: boolean;
  dateOfEntry: string;
  createAt: string;
  updateAt: string;
  images: ProductImage[];
  sizes?: ProductSize[];
  soldQuantity?: number;
  categoryBannerUrl?: string;
}

export interface ProductImage {
  imageUrl: string;
  isPrimary: boolean;
}

export interface ProductSize {
  size: number;
  quantity: number;
}

export type ProductStatus = "IN_STOCK" | "SOLD_OUT";

export interface ProductFilterParams {
  name?: string;
  sku?: string;
  goldType?: string;
  categoryId?: string;
  status?: string;
  isDeleted?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Category
export interface Category {
  id: number;
  name: string;
  description: string;
  bannerUrl: string;
  parentId: number | null;
  isDeleted: boolean;
  createAt: string;
  updateAt: string;
  children?: Category[];
}

export interface CategoryFilterParams {
  name?: string;
  isDeleted?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Order
export interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: string;
  items: OrderItem[];
  totalPrice: number;
  createAt: string;
  updateAt?: string;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  size?: number | string | null;
  price?: number;
  productName?: string;
  image?: string;
  sku?: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
}

export interface OrderFilterParams {
  customerName?: string;
  customerPhone?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

// AI Chat
export interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

export interface ChatHistory {
  id: number;
  userQuery: string;
  aiResponse: string;
  chatType: string;
  imageUrl?: string;
  sessionId: string;
  createdAt: string;
}

export interface ChatSession {
  sessionId: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  accountId: number;
  fullName: string;
  avatar: string;
}

export interface ChatRequest {
  query: string;
  sessionId?: string;
}

// Payment
export interface PaymentRequest {
  orderId: number;
  amount: number;
}

export interface PaymentResponse {
  paymentUrl: string;
  orderId: string;
  amount: number;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  sku: string;
  size?: string;
  goldType?: string;
  quantity: number;
}

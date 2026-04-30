/**
 * AI Response Types
 * Định nghĩa TypeScript interfaces cho AI JSON responses từ backend
 */

export type AiResponseType = 'text' | 'products' | 'orders' | 'confirmation' | 'error';

export interface AiResponse {
  type: AiResponseType;
  message: string;
  products?: ProductInfo[];
  orders?: OrderInfo[];
  confirmation?: ConfirmationInfo;
  meta?: MetaInfo;
}

export interface ProductInfo {
  id: number;
  name: string;
  price: string;
  status: string;
  sku: string;
  imageUrl: string;
  goldType?: string;
  description?: string;
}

export interface OrderInfo {
  id: number;
  status: string;
  totalPrice: string;
  createAt: string;
  customerName: string;
  paymentMethod: string;
  itemCount: number;
}

export interface ConfirmationInfo {
  action: string;
  targetId: number;
  targetName: string;
  question: string;
}

export interface MetaInfo {
  totalCount?: number;
  requiresLogin?: boolean;
  requiresConfirmation?: boolean;
  nextAction?: string;
}

/**
 * Helper function để parse AI response
 * Nếu backend trả về JSON string → parse
 * Nếu backend trả về text thuần → wrap vào format JSON
 */
export const parseAiResponse = (data: string): AiResponse => {
  try {
    // Remove markdown code blocks if present
    let cleanData = data.trim();
    
    // Check for markdown code block: ```json ... ``` or ``` ... ```
    const codeBlockMatch = cleanData.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
    if (codeBlockMatch) {
      cleanData = codeBlockMatch[1].trim();
    }
    
    // Try parse as JSON
    const parsed = JSON.parse(cleanData);
    
    // Validate có đúng structure không
    if (parsed && typeof parsed === 'object' && 'type' in parsed && 'message' in parsed) {
      return parsed as AiResponse;
    }
    
    // Nếu không đúng structure → wrap as text
    return {
      type: 'text',
      message: typeof parsed === 'string' ? parsed : JSON.stringify(parsed)
    };
  } catch (error) {
    // Parse failed → wrap as text response
    return {
      type: 'text',
      message: data || 'Lỗi xử lý phản hồi từ AI'
    };
  }
};

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiResponse, ProductInfo, OrderInfo } from '../../types/ai.types';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaShoppingBag, FaBox } from 'react-icons/fa';
import { MdLogin } from 'react-icons/md';

interface AiMessageRendererProps {
  response: AiResponse;
  onConfirm?: (action: string, targetId: number) => void;
  onCancel?: () => void;
}

/**
 * Component để render AI responses theo type
 */
export const AiMessageRenderer: React.FC<AiMessageRendererProps> = ({
  response,
  onConfirm,
  onCancel
}) => {
  const navigate = useNavigate();

  // Helper để render text với bold formatting
  const renderText = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Render text response
  const renderTextResponse = () => (
    <div className="jm-bot-text">{renderText(response.message)}</div>
  );

  // Render products response
  const renderProductsResponse = () => (
    <div className="jm-bot-product-wrap">
      {response.message && (
        <p className="jm-bot-product-intro">
          <FaShoppingBag style={{ marginRight: '8px', color: 'var(--gold)', verticalAlign: 'middle' }} />
          {renderText(response.message)}
        </p>
      )}
      {response.products && response.products.length > 0 && (
        <div className="jm-product-grid">
          {response.products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
      {response.meta?.totalCount && (
        <p className="jm-bot-product-outro">
          ✨ Tổng cộng: {response.meta.totalCount} sản phẩm
        </p>
      )}
    </div>
  );

  // Render orders response
  const renderOrdersResponse = () => (
    <div className="jm-bot-product-wrap">
      {response.message && (
        <p className="jm-bot-product-intro">
          <FaBox style={{ marginRight: '8px', color: 'var(--gold)', verticalAlign: 'middle' }} />
          {renderText(response.message)}
        </p>
      )}
      {response.orders && response.orders.length > 0 && (
        <div className="jm-product-grid">
          {response.orders.map((order, index) => (
            <OrderCard key={order.id} order={order} index={index} />
          ))}
        </div>
      )}
      {response.meta?.totalCount && (
        <p className="jm-bot-product-outro">
          📦 Tổng cộng: {response.meta.totalCount} đơn hàng
        </p>
      )}
    </div>
  );

  // Render confirmation response
  const renderConfirmationResponse = () => (
    <div className="jm-confirmation-wrap">
      <p className="jm-confirmation-message">
        <FaExclamationTriangle style={{ marginRight: '8px', color: '#ff9800', verticalAlign: 'middle' }} />
        {renderText(response.message)}
      </p>
      {response.confirmation && (
        <div className="jm-confirmation-buttons">
          <button
            className=" flex items-center justify-center jm-confirm-btn jm-confirm-btn--yes"
            onClick={() => {
              if (onConfirm) {
                onConfirm(response.confirmation!.action, response.confirmation!.targetId);
              }
            }}
          >
            <FaCheckCircle style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Xác nhận
          </button>
          <button
            className="flex items-center justify-center jm-confirm-btn jm-confirm-btn--no"
            onClick={onCancel}
          >
            <FaTimesCircle style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Hủy
          </button>
        </div>
      )}
    </div>
  );

  // Render error response
  const renderErrorResponse = () => (
    <div className="jm-error-wrap">
      <p className="jm-error-message">{renderText(response.message)}</p>
      {response.meta?.requiresLogin && (
        <button
          className="jm-login-btn"
          onClick={() => navigate('/login')}
        >
          <MdLogin style={{ marginRight: '6px', fontSize: '16px', verticalAlign: 'middle' }} />
          Đăng nhập
        </button>
      )}
    </div>
  );

  // Main render switch
  switch (response.type) {
    case 'products':
      return renderProductsResponse();
    case 'orders':
      return renderOrdersResponse();
    case 'confirmation':
      return renderConfirmationResponse();
    case 'error':
      return renderErrorResponse();
    case 'text':
    default:
      return renderTextResponse();
  }
};

/**
 * Product Card Component
 */
const ProductCard: React.FC<{ product: ProductInfo; index: number }> = ({ product, index }) => (
  <div
    className="jm-product-card"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    <div className="jm-product-img-wrap">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="jm-product-img"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="jm-product-img-placeholder">💎</div>
      )}
      {product.status && (
        <span
          className={`jm-product-badge ${
            product.status.toLowerCase().includes('hàng')
              ? 'badge-in-stock'
              : 'badge-out'
          }`}
        >
          {product.status}
        </span>
      )}
    </div>
    <div className="jm-product-info">
      <p className="jm-product-name">{product.name}</p>
      {product.price && <p className="jm-product-price">{product.price}</p>}
      {product.sku && (
        <p className="jm-product-sku">Mã sản phẩm: {product.sku}</p>
      )}
      {product.goldType && (
        <p className="jm-product-gold-type">{product.goldType}</p>
      )}
      <Link
        to={`/product-detailed/${product.id}`}
        className="jm-product-detail-link"
      >
        Xem chi tiết →
      </Link>
    </div>
  </div>
);

/**
 * Order Card Component
 */
const OrderCard: React.FC<{ order: OrderInfo; index: number }> = ({ order, index }) => {
  const dateObj = new Date(order.createAt);
  const formattedDate = isNaN(dateObj.getTime())
    ? order.createAt
    : dateObj.toLocaleDateString('vi-VN') + ' ' + dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const getStatusClass = (status: string) => {
    const st = status.toUpperCase();
    if (st === 'PENDING' || st === 'CONFIRMED' || st === 'DELIVERED' || st === 'COMPLETED') {
      return 'badge-in-stock';
    }
    return 'badge-out';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ xử lý',
      'CONFIRMED': 'Đã xác nhận',
      'PROCESSING': 'Đang xử lý',
      'SHIPPING': 'Đang giao',
      'DELIVERED': 'Đã giao',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status.toUpperCase()] || status;
  };

  return (
    <div
      className="jm-product-card jm-order-card"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="jm-product-info" style={{ padding: '12px', width: '100%' }}>
        <p className="jm-product-name" style={{ marginBottom: '8px' }}>
          Đơn hàng #{order.id}
        </p>
        <p className="jm-product-price" style={{ fontSize: '14px', color: 'var(--gold)' }}>
          {order.totalPrice}
        </p>
        <p className="jm-product-sku" style={{ marginTop: '4px' }}>
          Ngày đặt: {formattedDate}
        </p>
        {order.itemCount > 0 && (
          <p className="jm-product-sku">
            Số lượng: {order.itemCount} sản phẩm
          </p>
        )}
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            className={`jm-product-badge ${getStatusClass(order.status)}`}
            style={{ position: 'relative', bottom: 'auto', left: 'auto' }}
          >
            {getStatusText(order.status)}
          </span>
          <Link
            to={`/bill-order/${order.id}`}
            className="jm-product-detail-link"
            style={{ marginTop: 0 }}
          >
            Chi tiết →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AiMessageRenderer;

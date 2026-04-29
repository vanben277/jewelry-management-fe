import React from 'react';

interface BankTransferQRProps {
  qrCodeUrl: string;
  orderId: number;
  amount: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

const BankTransferQR: React.FC<BankTransferQRProps> = ({
  qrCodeUrl,
  orderId,
  amount,
  bankName = 'Techcombank',
  accountNumber = '19038861761019',
  accountName = 'JewelryStore',
}) => {
  return (
    <div className="bank-transfer-qr-container">
      <h4 className="qr-title">
        <i className="fa-solid fa-building-columns"></i> Thanh toán chuyển khoản
      </h4>
      
      <div className="qr-code-wrapper">
        <img 
          src={qrCodeUrl} 
          alt="QR Code thanh toán" 
          className="qr-code-image"
          loading="lazy"
        />
      </div>
      
      <div className="bank-info">
        <div className="info-row">
          <span className="info-label">Ngân hàng:</span>
          <span className="info-value">{bankName}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Số tài khoản:</span>
          <span className="info-value">{accountNumber}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Tên tài khoản:</span>
          <span className="info-value">{accountName}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Số tiền:</span>
          <span className="info-value amount">{amount.toLocaleString('vi-VN')} VNĐ</span>
        </div>
        <div className="info-row">
          <span className="info-label">Nội dung:</span>
          <span className="info-value">DH{orderId} Thanh toan don hang</span>
        </div>
      </div>
      
      <div className="payment-note">
        <i className="fa-solid fa-circle-info"></i>
        <span>
          Vui lòng quét mã QR hoặc chuyển khoản với <strong>nội dung chính xác</strong> để đơn hàng được xử lý nhanh chóng.
        </span>
      </div>

      <style>{`
        .bank-transfer-qr-container {
          background: #f9f9f9;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          text-align: center;
        }

        .qr-title {
          color: #252B61;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 600;
        }

        .qr-title i {
          margin-right: 8px;
        }

        .qr-code-wrapper {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }

        .qr-code-image {
          max-width: 350px;
          width: 100%;
          height: auto;
          border: 2px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }

        .qr-code-image:hover {
          transform: scale(1.02);
        }

        .bank-info {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin: 20px auto;
          max-width: 500px;
          text-align: left;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          font-weight: 600;
          color: #666;
          font-size: 14px;
        }

        .info-value {
          font-size: 14px;
          color: #333;
          text-align: right;
        }

        .info-value.amount {
          color: #b84b54;
          font-weight: bold;
          font-size: 16px;
        }

        .payment-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 6px;
          padding: 12px 15px;
          margin-top: 15px;
          font-size: 13px;
          color: #856404;
          text-align: left;
        }

        .payment-note i {
          margin-top: 2px;
          flex-shrink: 0;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .bank-transfer-qr-container {
            padding: 20px 15px;
          }

          .qr-code-image {
            max-width: 280px;
          }

          .bank-info {
            padding: 15px;
          }

          .info-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }

          .info-value {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default BankTransferQR;

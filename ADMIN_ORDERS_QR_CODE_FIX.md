# Fix: AdminOrders Detail Modal Missing QR Code Display

## Vấn đề
Trang **AdminOrders** (Quản lý đơn hàng) - Modal chi tiết đơn hàng không hiển thị mã QR cho đơn hàng thanh toán bằng **BANK_TRANSFER**.

**URL:** `/admin/orders` (Admin panel)

---

## Giải Pháp

### File: `react-jewelry/src/pages/admin/AdminOrders.tsx`

#### 1. Import BankTransferQR Component

**Thêm dòng 18:**
```tsx
import BankTransferQR from "../../components/user/BankTransferQR";
```

#### 2. Thêm Section QR Code trong Modal

**Thêm sau "Danh sách sản phẩm" (dòng 465-477):**
```tsx
{/* QR Code Section for Bank Transfer */}
{selectedOrder.paymentMethod === "BANK_TRANSFER" && selectedOrder.qrCodeUrl && (
  <div className="mt-4">
    <h6 className="text-[1.5rem] font-bold border-bottom pb-2 mb-3">
      Thông tin thanh toán
    </h6>
    <BankTransferQR
      qrCodeUrl={selectedOrder.qrCodeUrl}
      orderId={selectedOrder.id}
      amount={selectedOrder.totalPrice}
    />
  </div>
)}
```

---

## Logic Hiển Thị

### Điều Kiện
```tsx
selectedOrder.paymentMethod === "BANK_TRANSFER" && selectedOrder.qrCodeUrl
```

**Chỉ hiển thị QR code khi:**
1. ✅ Phương thức thanh toán là `BANK_TRANSFER`
2. ✅ `qrCodeUrl` có giá trị (không null/undefined)

### Use Case cho Admin

| Scenario | Hiển thị QR? | Lý do |
|----------|--------------|-------|
| Admin xem đơn BANK_TRANSFER chưa thanh toán | ✅ Có | Để hỗ trợ khách hàng |
| Admin xem đơn BANK_TRANSFER đã thanh toán | ✅ Có | Để kiểm tra lịch sử |
| Admin xem đơn COD | ❌ Không | Không cần QR |
| Admin xem đơn ZALOPAY | ❌ Không | Không cần QR |

---

## UI Layout - Modal Chi Tiết

### Before (Cũ)
```
┌─────────────────────────────────────┐
│ Chi tiết đơn hàng #123              │
├─────────────────────────────────────┤
│ Thông tin khách hàng                │
│  - Tên: Nguyễn Văn A                │
│  - SĐT: 0123456789                  │
│  - Địa chỉ: 123 ABC                 │
├─────────────────────────────────────┤
│ Danh sách sản phẩm                  │
│  - Nhẫn vàng x1                     │
│  - Tổng: 5,000,000đ                 │
├─────────────────────────────────────┤
│ Tổng thanh toán: 5,000,000đ        │
└─────────────────────────────────────┘
```

### After (Mới)
```
┌─────────────────────────────────────┐
│ Chi tiết đơn hàng #123              │
├─────────────────────────────────────┤
│ Thông tin khách hàng                │
│  - Tên: Nguyễn Văn A                │
│  - SĐT: 0123456789                  │
│  - Địa chỉ: 123 ABC                 │
├─────────────────────────────────────┤
│ Danh sách sản phẩm                  │
│  - Nhẫn vàng x1                     │
│  - Tổng: 5,000,000đ                 │
├─────────────────────────────────────┤
│ Thông tin thanh toán (NEW)          │ ← Thêm mới
│  ┌───────────────────────────────┐  │
│  │   [QR Code Image]             │  │
│  │                               │  │
│  │   Ngân hàng: Techcombank      │  │
│  │   STK: 19038861761019         │  │
│  │   Số tiền: 5,000,000đ         │  │
│  │   Nội dung: Thanh toan don... │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│ Tổng thanh toán: 5,000,000đ        │
└─────────────────────────────────────┘
```

---

## Admin Workflow

### Scenario 1: Khách hàng gọi hỏi về thanh toán
```
1. Khách: "Em chưa biết chuyển khoản như thế nào?"
   ↓
2. Admin: Vào AdminOrders → Click "Xem chi tiết" đơn hàng
   ↓
3. Modal hiển thị QR code
   ↓
4. Admin: "Anh/chị quét mã QR này để thanh toán nhé"
   ↓
5. Admin có thể screenshot QR gửi cho khách qua Zalo/Email
```

### Scenario 2: Kiểm tra đơn hàng đã thanh toán
```
1. Admin cần verify đơn hàng đã thanh toán
   ↓
2. Xem chi tiết đơn → Thấy QR code
   ↓
3. Check nội dung chuyển khoản: "Thanh toan don hang 123"
   ↓
4. Đối chiếu với sao kê ngân hàng
   ↓
5. Xác nhận đơn hàng
```

---

## Data Flow

### 1. Admin Opens Order Detail
```
Admin clicks "Xem chi tiết" button
  ↓
openDetailModal(orderId) is called
  ↓
Fetch order data: orderApi.getById(orderId)
  ↓
setSelectedOrder(data.data)
  ↓
setIsModalOpen(true)
```

### 2. Modal Renders with QR Code
```tsx
{isModalOpen && selectedOrder && (
  <div className="modal-custom-overlay">
    {/* Customer info */}
    {/* Product list */}
    
    {/* QR Code Section */}
    {selectedOrder.paymentMethod === "BANK_TRANSFER" && selectedOrder.qrCodeUrl && (
      <BankTransferQR
        qrCodeUrl={selectedOrder.qrCodeUrl}
        orderId={selectedOrder.id}
        amount={selectedOrder.totalPrice}
      />
    )}
    
    {/* Total */}
  </div>
)}
```

---

## Component Reusability

### BankTransferQR Component
**Location:** `src/components/user/BankTransferQR.tsx`

**Used In:**
1. ✅ `OrderSuccess.tsx` - User: Sau khi đặt hàng
2. ✅ `BillOrder.tsx` - User: Chi tiết đơn hàng
3. ✅ `AdminOrders.tsx` - Admin: Modal chi tiết (this fix)

**Props:**
```tsx
interface BankTransferQRProps {
  qrCodeUrl: string;
  orderId: number;
  amount: number;
}
```

**Benefits:**
- ✅ Reusable across User & Admin pages
- ✅ Consistent UI/UX
- ✅ Single source of truth
- ✅ Easy maintenance

---

## Modal Styling

### Modal Structure
```tsx
<div className="modal-custom-overlay">
  <div className="modal-custom-content">
    <div className="modal-header">
      {/* Header with close button */}
    </div>
    
    <div className="p-4 overflow-y-auto max-h-[80vh]">
      {/* Customer info */}
      {/* Product list */}
      {/* QR Code (NEW) */}
      {/* Total */}
    </div>
  </div>
</div>
```

### CSS Classes
```css
.modal-custom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 2000;
}

.modal-custom-content {
  background: white;
  width: 90%;
  max-width: 800px;
  border-radius: 12px;
}
```

**QR Section** sử dụng CSS từ `BankTransferQR` component (scoped).

---

## Verification

### Build Status
✅ **Build thành công**
```bash
npm run build
✓ 283 modules transformed
✓ built in 10.44s

# AdminOrders bundle size increased (added QR code)
Before: dist/assets/AdminOrders-CzkWjcK4.js    12.55 kB
After:  dist/assets/AdminOrders-BVyiBHvD.js    12.87 kB
Diff:   +0.32 kB (QR code logic)
```

### Expected Behavior
- ✅ Admin vào trang Orders
- ✅ Click "Xem chi tiết" đơn hàng
- ✅ Modal hiển thị đầy đủ thông tin
- ✅ Nếu `paymentMethod = BANK_TRANSFER` và có `qrCodeUrl` → Hiển thị QR code
- ✅ QR code section nằm giữa "Danh sách sản phẩm" và "Tổng thanh toán"
- ✅ Modal có scroll nếu nội dung dài

---

## Testing Checklist

- [x] Build không có lỗi
- [x] Import BankTransferQR component
- [x] Thêm conditional rendering trong modal
- [ ] Test trên browser: Login as Admin
- [ ] Navigate to `/admin/orders`
- [ ] Click "Xem chi tiết" đơn hàng BANK_TRANSFER
- [ ] Verify: QR code hiển thị trong modal
- [ ] Verify: QR code KHÔNG hiển thị cho COD/ZALOPAY
- [ ] Verify: Modal scroll hoạt động tốt
- [ ] Test: Screenshot QR code để gửi khách hàng

---

## Admin Features

### Current Features
- ✅ View all orders with filters
- ✅ Filter by customer name, phone, address, status
- ✅ Update order status (with validation)
- ✅ View order details in modal
- ✅ **Display QR code for BANK_TRANSFER orders** (NEW)

### Status Workflow
```
PENDING → CONFIRMED → SHIPPED → DELIVERED
   ↓
CANCELLED (can cancel from PENDING/CONFIRMED)
```

### QR Code Use Cases
1. **Customer Support** - Gửi QR cho khách hàng qua Zalo/Email
2. **Payment Verification** - Đối chiếu với sao kê ngân hàng
3. **Order Tracking** - Xem lịch sử thanh toán
4. **Troubleshooting** - Debug payment issues

---

## Security Considerations

### Admin Access
- ✅ Only Admin/Staff can access `/admin/orders`
- ✅ Protected by authentication middleware
- ✅ QR code URL is public (VietQR service)
- ✅ No sensitive data exposed in QR

### QR Code URL
```
https://img.vietqr.io/image/970407-19038861761019-compact.png
  ?amount=5000000
  &addInfo=Thanh%20toan%20don%20hang%20123
  &accountName=JewelryStore
```

**Public Info Only:**
- ✅ Bank ID (public)
- ✅ Account number (public)
- ✅ Amount (order info)
- ✅ Order ID (order info)

**No Sensitive Data:**
- ❌ No customer personal info
- ❌ No authentication tokens
- ❌ No internal system data

---

## Date: 2026-04-29
**Status:** ✅ FIXED
**Next:** Test on browser with Admin account

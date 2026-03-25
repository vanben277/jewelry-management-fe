import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { CartItem } from "../types";

interface CartContextType {
  cart: CartItem[];
  // 2. Sửa any thành kiểu dữ liệu cụ thể
  addToCart: (item: CartItem) => void;
  updateCart: (newCart: CartItem[]) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  totalQuantity: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("cart");
    try {
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
  }, [cart]);

  const notifySuccess = (message: string) => {
    toast.success(
      (t) => (
        <div className="flex items-center justify-between w-full gap-3 min-w-[200px]">
          <span className="text-[1.4rem] font-medium">{message}</span>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="p-1 hover:bg-black/5 rounded-full"
          >
            <IoClose size={18} className="text-gray-500" />
          </button>
        </div>
      ),
      { duration: 3000, position: "top-right" },
    );
  };

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (prevItem) =>
          prevItem.productId === item.productId &&
          prevItem.size === item.size &&
          prevItem.goldType === item.goldType,
      );

      if (existingIndex !== -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += item.quantity || 1;
        notifySuccess(`Cập nhật số lượng thành công`);
        return newCart;
      }

      notifySuccess("Thêm vào giỏ hàng thành công");
      return [...prevCart, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const updateCart = (newCart: CartItem[]) => setCart(newCart);
  const removeFromCart = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
    notifySuccess("Đã xóa sản phẩm");
  };
  const clearCart = () => setCart([]);

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCart,
        removeFromCart,
        clearCart,
        totalQuantity,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

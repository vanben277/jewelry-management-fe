import React, { createContext, useContext, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { CartItem } from "../types";
import useLocalStorage from "../hooks/useLocalStorage";

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCart: (newCart: CartItem[]) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  totalQuantity: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const isCartItemArray = (value: unknown): value is CartItem[] => {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as CartItem).productId === "number" &&
      typeof (item as CartItem).name === "string" &&
      typeof (item as CartItem).price === "number" &&
      typeof (item as CartItem).quantity === "number",
  );
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useLocalStorage<CartItem[]>(
    "cart",
    [],
    isCartItemArray,
  );

  // Thông báo cho các tab khác khi giỏ hàng thay đổi
  useEffect(() => {
    window.dispatchEvent(new Event("storage"));
  }, [cart]);

  // Memoize notification function để tránh re-create
  const notifySuccess = useCallback((message: string) => {
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
  }, []);

  // Memoize addToCart function
  const addToCart = useCallback((item: CartItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (prevItem) =>
          prevItem.productId === item.productId &&
          prevItem.size === item.size &&
          prevItem.goldType === item.goldType,
      );

      if (existingIndex !== -1) {
        const newCart = [...prevCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + (item.quantity || 1),
        };
        toast.success(
          (t) => (
            <div className="flex items-center justify-between w-full gap-3 min-w-[200px]">
              <span className="text-[1.4rem] font-medium">Cập nhật số lượng thành công</span>
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
        return newCart;
      }

      toast.success(
        (t) => (
          <div className="flex items-center justify-between w-full gap-3 min-w-[200px]">
            <span className="text-[1.4rem] font-medium">Thêm vào giỏ hàng thành công</span>
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
      return [...prevCart, { ...item, quantity: item.quantity || 1 }];
    });
  }, [setCart]);

  // Memoize updateCart function
  const updateCart = useCallback((newCart: CartItem[]) => {
    setCart(newCart);
  }, [setCart]);

  // Memoize removeFromCart function
  const removeFromCart = useCallback((index: number) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
    toast.success(
      (t) => (
        <div className="flex items-center justify-between w-full gap-3 min-w-[200px]">
          <span className="text-[1.4rem] font-medium">Đã xóa sản phẩm</span>
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
  }, [setCart]);

  // Memoize clearCart function
  const clearCart = useCallback(() => {
    setCart([]);
  }, [setCart]);

  const totalQuantity = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  // Memoize context value để tránh re-render không cần thiết
  const contextValue = useMemo(
    () => ({
      cart,
      addToCart,
      updateCart,
      removeFromCart,
      clearCart,
      totalQuantity,
      totalPrice,
    }),
    [cart, addToCart, updateCart, removeFromCart, clearCart, totalQuantity, totalPrice],
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

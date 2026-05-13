import React, { createContext, useContext, useState, useEffect } from 'react';

// Khởi tạo Context
const CartContext = createContext();

// Custom hook để các component khác dễ dàng sử dụng
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// Provider bọc ngoài ứng dụng
export const CartProvider = ({ children }) => {
    // Khởi tạo state giỏ hàng từ LocalStorage (nếu có)
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Mỗi khi giỏ hàng thay đổi, lưu lại vào LocalStorage
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // Hàm thêm vào giỏ hàng thông minh
    const addToCart = (productToAdd) => {
        setCartItems((prevItems) => {
            // Đảm bảo số lượng luôn là 1 số hợp lệ
            const qtyToAdd = Number(productToAdd.cart_quantity) || Number(productToAdd.quantity) || 1;

            // Kiểm tra xem sản phẩm (cùng ID, cùng Màu, cùng Dung lượng) đã có trong giỏ chưa
            const existingItemIndex = prevItems.findIndex(item => 
                item.id === productToAdd.id &&
                item.selected_color === productToAdd.selected_color &&
                item.selected_storage === productToAdd.selected_storage
            );

            if (existingItemIndex >= 0) {
                // NẾU ĐÃ CÓ: Copy mảng cũ ra và cộng dồn số lượng
                const newItems = [...prevItems];
                const currentQty = Number(newItems[existingItemIndex].quantity) || 1;
                newItems[existingItemIndex].quantity = currentQty + qtyToAdd;
                return newItems;
            } else {
                // NẾU CHƯA CÓ: Thêm mới hoàn toàn, ép tên biến thành 'quantity'
                const newItem = { ...productToAdd, quantity: qtyToAdd };
                delete newItem.cart_quantity; // Xóa biến thừa
                return [...prevItems, newItem];
            }
        });
    };

    // Hàm xóa sản phẩm khỏi giỏ
    const removeFromCart = (productId, color, storage) => {
        setCartItems((prevItems) => 
            prevItems.filter((item) => 
                // Giữ lại những sản phẩm KHÔNG trùng khớp hoàn toàn 3 yếu tố này
                !(item.id === productId && item.selected_color === color && item.selected_storage === storage)
            )
        );
    };
    // Hàm cập nhật số lượng (+ / -)
    const updateQuantity = (productId, color, storage, newQuantity) => {
        if (newQuantity < 1) return; // Không cho số lượng rớt xuống dưới 1
        
        setCartItems((prevItems) => 
            prevItems.map((item) => {
                if (item.id === productId && item.selected_color === color && item.selected_storage === storage) {
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    // Hàm tính tổng tiền giỏ hàng
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Hàm làm sạch giỏ hàng (sau khi đặt hàng thành công)
    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            getCartTotal, 
            clearCart 
        }}>
            {children}
        </CartContext.Provider>
    );
};
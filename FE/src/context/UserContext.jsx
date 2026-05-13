import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    // Khởi tạo state user từ localStorage nếu có
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Đồng bộ user vào localStorage mỗi khi có sự thay đổi (đăng nhập/đăng xuất)
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token'); // Xóa luôn token khi không có user
        }
    }, [user]);

    // Hàm tiện ích để đăng xuất khỏi Context
    const logoutContext = () => {
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, logout: logoutContext }}>
            {children}
        </UserContext.Provider>
    );
};
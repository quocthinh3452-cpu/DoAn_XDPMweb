import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { logout as apiLogout } from '../../../services/authService';

function UserMenu() {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Xử lý click ra ngoài để đóng menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await apiLogout(); // Gọi API báo backend xóa token
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        } finally {
            logout(); // Xóa state user & localStorage
            setIsOpen(false);
            navigate('/'); // Đá về trang chủ
        }
    };

    // Nếu chưa đăng nhập -> Hiện nút Đăng nhập
    if (!user) {
        return (
            <Link to="/auth" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-full border border-gray-200 hover:bg-blue-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
        );
    }

    // Lấy chữ cái đầu tiên của tên để làm Avatar
    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    // Nếu đã đăng nhập -> Hiện Menu User
    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none"
            >
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                    {initial}
                </div>
                <span className="font-medium hidden md:block max-w-[120px] truncate text-sm">
                    {user.name}
                </span>
            </button>

            {/* Bảng Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tài khoản</p>
                        <p className="text-sm font-bold text-gray-900 truncate mt-1">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <Link to="/orders" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        Đơn hàng của tôi
                    </Link>
                    
                    {/* Nút vào trang Admin (Chỉ hiện nếu role là admin) */}
                    {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-purple-700 hover:bg-purple-50 transition-colors border-t border-gray-50 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Quản trị viên
                        </Link>
                    )}

                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 mt-1 border-t border-gray-100 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserMenu;
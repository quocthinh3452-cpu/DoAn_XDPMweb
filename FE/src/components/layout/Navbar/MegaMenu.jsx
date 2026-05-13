/**
 * MegaMenu.jsx
 * Cập nhật: Lấy dữ liệu thật từ API và sửa lỗi hiển thị
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { CAT_ICONS, FallbackCatIcon } from "./NavbarIcons";
import apiClient from "../../../services/apiClient"; // Nhớ kiểm tra đường dẫn này

// Bảng màu mặc định cho các danh mục (vì DB không có cột màu)
const ACCENT_COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];

const CLOSE_DELAY = 180;

export function MegaMenu({ isActive }) {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState([]); // State lưu danh mục thật
    const timer = useRef(null);
    const triggerRef = useRef(null);

    // 1. Lấy danh mục từ Database khi component load
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const response = await apiClient.get('/categories');
                setCategories(response.data);
            } catch (error) {
                console.error("Lỗi lấy danh mục menu:", error);
            }
        };
        fetchCats();
        return () => clearTimeout(timer.current);
    }, []);

    const handleOpen = useCallback(() => { clearTimeout(timer.current); setOpen(true); }, []);
    const handleClose = useCallback(() => { timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY); }, []);
    
    const handleKeyDown = useCallback((e) => {
        if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    }, []);

    const navLink = "text-sm font-medium text-muted hover:text-text transition-colors duration-200";
    const activeLink = "text-text";

    return (
        <>
            <style>{`
                @keyframes megaMenuIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                .mega-menu-shadow {
                    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3);
                }
            `}</style>

            <div
                className="relative"
                onMouseEnter={handleOpen}
                onMouseLeave={handleClose}
                onKeyDown={handleKeyDown}
            >
                <Link
                    ref={triggerRef}
                    to="/products"
                    className={`${navLink} ${isActive ? activeLink : ""} flex items-center gap-1 py-4 select-none`}
                    aria-haspopup="true"
                    aria-expanded={open}
                >
                    Sản phẩm
                    <svg
                        width="10" height="10" viewBox="0 0 12 12" fill="none"
                        style={{ transition: "transform 250ms ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>

                {open && (
                    <div
                        className="absolute left-1/2 w-[320px] bg-white border border-gray-100 rounded-3xl overflow-hidden z-[999] mega-menu-shadow"
                        style={{
                            top: "100%",
                            animation: "megaMenuIn 250ms ease-out both",
                        }}
                        onMouseEnter={handleOpen}
                        onMouseLeave={handleClose}
                        role="menu"
                    >
                        {/* Header */}
                        <div className="px-5 pt-5 pb-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                KHÁM PHÁ DANH MỤC
                            </p>
                        </div>

                        {/* Category List */}
                        <div className="p-2.5">
                            <div className="grid grid-cols-1 gap-1">
                                {categories.length > 0 ? (
                                    categories.map((cat, index) => {
                                        const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
                                        return (
                                            <Link
                                                key={cat.id}
                                                to={`/products?category=${cat.slug}`}
                                                className="group flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-all"
                                                onClick={() => setOpen(false)}
                                            >
                                                <div 
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                                    style={{ background: `${accent}15`, color: accent }}
                                                >
                                                    <div className="w-5 h-5">
                                                        {/* Dùng slug để map icon hoặc chữ cái đầu nếu không có icon */}
                                                        {CAT_ICONS[cat.slug] ?? <span className="font-bold text-sm">{cat.name.charAt(0)}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                                                        {cat.name}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })
                                ) : (
                                    <p className="p-4 text-xs text-gray-400 italic">Đang tải danh mục...</p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-2.5 bg-gray-50/50">
                            <Link
                                to="/products"
                                className="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                                onClick={() => setOpen(false)}
                            >
                                <span className="text-xs font-bold text-gray-600">Xem tất cả sản phẩm</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600 transition-transform group-hover:translate-x-1">
                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
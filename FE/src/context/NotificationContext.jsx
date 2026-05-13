/**
 * NotificationContext.jsx
 * Notification bell state — mock data, dễ swap với API sau.
 * Export: useNotifications() → { notifications, unreadCount, markRead, markAllRead, dismiss }
 */
import { createContext, useContext, useState, useCallback, useMemo } from "react";

const NotificationContext = createContext(null);

const MOCK_NOTIFICATIONS = [
  {
    id: "n1",
    type: "order",
    title: "Đơn hàng đã xác nhận",
    message: "Đơn #TS-2847 đang được chuẩn bị.",
    time: "2 phút trước",
    read: false,
  },
  {
    id: "n2",
    type: "sale",
    title: "Flash Sale bắt đầu!",
    message: "iPhone 15 Pro giảm 15% — còn 2 giờ.",
    time: "1 giờ trước",
    read: false,
  },
  {
    id: "n3",
    type: "order",
    title: "Đơn hàng đã giao",
    message: "Đơn #TS-2801 đã giao thành công.",
    time: "Hôm qua",
    read: true,
  },
  {
    id: "n4",
    type: "promo",
    title: "Ưu đãi riêng cho bạn",
    message: "Dùng mã TECH10 giảm thêm 10%.",
    time: "2 ngày trước",
    read: true,
  },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Thêm notification mới (dùng khi có API real-time)
  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [
      { id: `n_${Date.now()}`, read: false, time: "Vừa xong", ...notif },
      ...prev,
    ]);
  }, []);

  const value = useMemo(
    () => ({ notifications, unreadCount, markRead, markAllRead, dismiss, addNotification }),
    [notifications, unreadCount, markRead, markAllRead, dismiss, addNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within <NotificationProvider>");
  return ctx;
}

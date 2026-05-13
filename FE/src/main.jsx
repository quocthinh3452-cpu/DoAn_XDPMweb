import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import './styles/global.css';

import { ThemeProvider } from './context/ThemeContext.jsx';
import { LocaleProvider } from './context/LocaleContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
// Thêm NotificationProvider
import { NotificationProvider } from './context/NotificationContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LocaleProvider>
        <ToastProvider>
          {/* Bọc thêm NotificationProvider vào đây */}
          <NotificationProvider>
            <UserProvider>
              <WishlistProvider>
                <CartProvider>
                  
                  <App />
                  
                </CartProvider>
              </WishlistProvider>
            </UserProvider>
          </NotificationProvider>
        </ToastProvider>
      </LocaleProvider>
    </ThemeProvider>
  </React.StrictMode>
);
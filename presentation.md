# Bài thuyết trình FE Tech Store

## 1. Tổng quan dự án

Đây là phần front-end của một cửa hàng thương mại điện tử hiện đại mang tên **Tech Store**. Ứng dụng được xây dựng bằng React và Vite, cung cấp trải nghiệm mua sắm mượt mà cho khách hàng cùng bảng điều khiển admin cho người quản lý.

FE tập trung vào:
- Khám phá và duyệt sản phẩm
- Giỏ hàng và luồng thanh toán
- Quản lý đơn hàng và đánh giá
- Quản lý tài khoản và hồ sơ người dùng
- Danh sách yêu thích và thông báo
- Bảng điều khiển admin cho đơn hàng, sản phẩm và người dùng

## 2. Công nghệ chính

- **React 18** với component hàm và hooks
- **Vite** để phát triển và build nhanh
- **Tailwind CSS** cho kiểu dáng tiện ích
- **React Router v6** cho định tuyến phía client

## 3. Trải nghiệm người dùng chính

### Storefront khách hàng
- Trang chủ với:
  - Hero slider
  - Banner khuyến mãi
  - Mục thể loại
  - Các phân đoạn sản phẩm như nổi bật, mới về, đánh giá cao, và khuyến mãi
  - Dải thương hiệu và điểm nổi bật
- Danh sách sản phẩm và tìm kiếm
- Trang chi tiết sản phẩm với thông tin và tuỳ chọn mua
- Quản lý wishlist
- Quản lý giỏ hàng: cập nhật số lượng, xóa sản phẩm, xoá toàn bộ giỏ
- Luồng thanh toán với:
  - Thu thập địa chỉ giao hàng
  - Hỗ trợ phí vận chuyển và đơn vị giao hàng
  - Chọn phương thức thanh toán (COD, VietQR, MoMo, ZaloPay)
  - Xử lý mã giảm giá và tổng đơn hàng
- Trang thanh toán cho đơn hàng cần thanh toán ngoài
- Trang hoàn tất đơn hàng sau khi thanh toán xong
- Quản lý lịch sử đơn hàng và chi tiết đơn hàng
  - Dòng thời gian trạng thái đơn hàng
  - Luồng huỷ đơn
  - Gửi đánh giá sản phẩm

### Tính năng tài khoản người dùng
- Trang xác thực đăng nhập/đăng ký
- Định tuyến bảo vệ cho các trang riêng tư
- Trang hồ sơ người dùng để quản lý thông tin
- Thông báo toast cho thành công, lỗi, cập nhật giỏ hàng và hệ thống
- Chuyển đổi chủ đề và lưu cài đặt vùng/language

## 4. Bảng điều khiển Admin

Phần admin nằm ở `/admin/*` và bao gồm:
- Tổng quan dashboard
- Quản lý đơn hàng với tìm kiếm, lọc và điều khiển trạng thái
- Quản lý sản phẩm với tìm kiếm, lọc, sắp xếp, chỉnh sửa và CRUD
- Quản lý người dùng với trạng thái, sắp xếp và xem chi tiết

## 5. Kiến trúc và quản lý trạng thái

### Quản lý trạng thái bằng Context
- `UserContext` cho xác thực và session người dùng
- `CartContext` cho dữ liệu giỏ hàng và tương tác thanh toán
- `OrderContext` cho trạng thái đơn hàng hiện tại và cập nhật trạng thái
- `WishlistContext` cho sản phẩm lưu yêu thích
- `ThemeContext` cho chế độ sáng/tối/hệ thống
- `LocaleContext` cho định dạng ngôn ngữ và tiền tệ
- `ToastContext` cho phản hồi toast
- `NotificationContext` cho thông báo trong ứng dụng

### Cấu trúc định tuyến
- Storefront:
  - `/` → Trang chủ
  - `/products` → Danh sách sản phẩm
  - `/products/:id` → Chi tiết sản phẩm
  - `/wishlist` → Danh sách yêu thích
  - `/cart` → Giỏ hàng và checkout adapter
  - `/payment/:orderId` → Luồng thanh toán
  - `/order-success` → Trang thành công
  - `/orders` → Danh sách đơn hàng
  - `/profile` → Hồ sơ người dùng
- Admin:
  - `/admin` → Dashboard
  - `/admin/orders` → Quản lý đơn hàng
  - `/admin/products` → Quản lý sản phẩm
  - `/admin/users` → Quản lý người dùng

## 6. Tích hợp backend và dịch vụ giả lập

FE được thiết kế để làm việc với backend Laravel, hiện tại sử dụng dịch vụ mô phỏng (mock) cho:
- Xác thực (`/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`)
- Dữ liệu trang chủ (`/api/home`)
- Chu trình đơn hàng và yêu cầu thanh toán
- Vận chuyển và giao hàng qua GHN giả lập

Điều này giúp FE dễ dàng kết nối với API thực sau này và vẫn cung cấp bản demo tương tác đầy đủ.

## 7. Chi tiết triển khai nổi bật

- Luồng thanh toán dùng `CartCheckoutAdapter` riêng để tính tổng và điều hướng sau khi tạo đơn
- Ứng dụng hỗ trợ cả khách và người dùng đã đăng nhập
- `LocaleContext` định dạng giá VND hoặc USD và lưu lựa chọn
- `ThemeContext` hỗ trợ chủ đề tối, sáng và hệ thống bằng `data-theme` trên `<html>`
- Ứng dụng được thiết kế với các component tái sử dụng cho layout, form và UI checkout

## 8. Giá trị mang lại

FE này cung cấp hành trình thương mại điện tử hoàn chỉnh với:
- UI hiện đại và phản hồi nhanh
- Luồng khám phá sản phẩm đến chuyển đổi
- Bảo mật tài khoản và lịch sử đơn hàng cá nhân hóa
- Công cụ quản lý admin cho người bán
- Hỗ trợ địa phương hóa và chủ đề

## 9. Hướng nâng cấp tiếp theo

Các cải tiến có thể triển khai sau:
- Kết nối backend thực qua Laravel API
- Tích hợp cổng thanh toán QR / ví trực tiếp
- Mở rộng hỗ trợ ngôn ngữ ngoài tiếng Việt và tiếng Anh
- Widget phân tích và báo cáo admin
- Quản lý tồn kho và số lượng
- Tối ưu hiệu năng và SEO

import { Icons } from "./icons.jsx";

export default function EmptyCart({ onBack }) {
  return (
    <div className="cc-page">
      <div className="cc-header">
        <button type="button" className="cc-back-btn" onClick={onBack}>
          <Icons.ChevronLeft />
        </button>
        <h1 className="cc-page-title">Đặt hàng</h1>
      </div>
      <div className="cc-empty-full">
        <Icons.Package />
        <h2>Giỏ hàng trống</h2>
        <p>Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <button type="button" className="cc-place-btn" onClick={onBack}>
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
}

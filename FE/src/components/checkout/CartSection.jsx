import { cn } from "./utils.js";
import { fmt } from "./utils.js";
import { Icons } from "./icons.jsx";
import { SectionTitle } from "./primitives.jsx";

export default function CartSection({ items, onQtyChange, onRemove, onClear, removingIds }) {
  if (!items.length) {
    return (
      <div className="cc-card cc-empty">
        <Icons.Package />
        <p>Giỏ hàng trống</p>
      </div>
    );
  }

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="cc-card">
      <div className="cc-section-header">
        <SectionTitle number="1" title="Giỏ hàng" subtitle={`${totalQty} sản phẩm`} />
        <button type="button" className="cc-clear-btn" onClick={onClear}>
          Xóa tất cả
        </button>
      </div>

      <div className="cc-cart-list">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn("cc-cart-item", removingIds.has(item.id) && "cc-cart-item--removing")}
          >
            <div className="cc-cart-thumb">
              {item.thumbnail
                ? <img src={item.thumbnail} alt={item.name} />
                : <Icons.Package />}
            </div>

            <div className="cc-cart-detail">
              <div className="cc-cart-name">{item.name}</div>
              {item.variant && <div className="cc-cart-variant">{item.variant}</div>}
              <div className="cc-cart-price">{fmt(item.price)}</div>
            </div>

            <div className="cc-cart-actions">
              <div className="cc-qty">
                <button
                  type="button"
                  className="cc-qty-btn"
                  onClick={() => onQtyChange(item.id, -1)}
                  disabled={item.quantity <= 1}
                  aria-label="Giảm số lượng"
                >
                  <Icons.Minus />
                </button>
                <span className="cc-qty-num">{item.quantity}</span>
                <button
                  type="button"
                  className="cc-qty-btn"
                  onClick={() => onQtyChange(item.id, 1)}
                  aria-label="Tăng số lượng"
                >
                  <Icons.Plus />
                </button>
              </div>
              <div className="cc-cart-total">{fmt(item.price * item.quantity)}</div>
              <button
                type="button"
                className="cc-remove-btn"
                onClick={() => onRemove(item.id)}
                aria-label={`Xóa ${item.name}`}
              >
                <Icons.Trash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

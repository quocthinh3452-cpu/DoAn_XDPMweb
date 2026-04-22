import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById, getProducts } from "../services/productService";
import { useCart } from "../context/CartContext";
import Button from "../components/common/Button";
import ImageGallery from "../components/product/ImageGallery";
import WishlistButton from "../components/common/WishlistButton";
import ProductCard from "../components/product/ProductCard";
import { formatPrice, calcDiscount } from "../utils/helpers";
import "./ProductDetailPage.css";

/* ─── Mock reviews ────────────────── */
const MOCK_REVIEWS = [
  { id: 1, author: "Minh T.", avatar: "MT", rating: 5, date: "Mar 2025", title: "Absolutely love it", body: "Build quality is incredible. Fast, responsive, and looks stunning on my desk." },
  { id: 2, author: "Linh P.", avatar: "LP", rating: 4, date: "Feb 2025", title: "Great but pricey", body: "Performance is top-notch." },
];

/* ─── Icons ───────────────────────────────────────────────── */
const StarIcon = ({ filled, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke={filled ? "#f59e0b" : "rgba(255,255,255,.2)"} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const CheckIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
);
const CartPlusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
);

/* ─── UI Helpers ─────────────────────────────────────────── */
function Stars({ rating, size = 14 }) {
  return (
    <span className="pdp-stars">
      {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= Math.round(rating)} size={size} />)}
    </span>
  );
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="pdp-rbar">
      <span className="pdp-rbar-label">{label}</span>
      <div className="pdp-rbar-track"><div className="pdp-rbar-fill" style={{ width: `${pct}%` }} /></div>
      <span className="pdp-rbar-count">{count}</span>
    </div>
  );
}

/* ─── Sub-Components ────────────────────────────────────── */
function StickyBar({ product, selectedColor, selectedStorage, qty, onAdd, added, show }) {
  return (
    <div className={`pdp-sticky-bar${show ? " pdp-sticky-bar--visible" : ""}`}>
      <div className="pdp-sticky-inner">
        <div className="pdp-sticky-info">
          <img src={product.image} alt={product.name} className="pdp-sticky-thumb" />
          <div>
            <p className="pdp-sticky-name">{product.name}</p>
            <p className="pdp-sticky-price">{formatPrice(product.price)}</p>
          </div>
        </div>
        <div className="pdp-sticky-chips">
          {selectedColor && <span className="pdp-sticky-chip">{selectedColor}</span>}
          {selectedStorage && <span className="pdp-sticky-chip">{selectedStorage}</span>}
          <span className="pdp-sticky-chip">Qty: {qty}</span>
        </div>
        <button className={`pdp-sticky-cta${added ? " pdp-sticky-cta--added" : ""}`} onClick={onAdd} disabled={product.stock === 0 || added}>
          {added ? <><CheckIcon size={14} /> Added!</> : <><CartPlusIcon size={14} /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return <div className="pdp-page"><div className="skeleton pdp-skel-img" style={{ height: 500 }} /></div>;
}

/* ─── Main Component ─────────────────────────────────────── */
export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [data, setData] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [reviewSort, setReviewSort] = useState("recent");

  const ctaRef = useRef(null);
  const tabsRef = useRef(null);

  // Load Product Detail từ Laravel
  useEffect(() => {
    setLoading(true);
    setAdded(false);
    getProductById(id)
      .then(res => {
        const serverData = res.data; // Cấu trúc: { product, images, related }
        setData(serverData);
        setRelated(serverData.related || []);
        setSelectedColor(serverData.product.colors?.[0] || null);
        setSelectedStorage(serverData.product.storage?.[0] || null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Scroll handler cho Sticky Bar
  useEffect(() => {
    const handler = () => {
      if (!ctaRef.current) return;
      setShowSticky(ctaRef.current.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [loading]);

  const handleAddToCart = useCallback(() => {
    if (!data?.product) return;
    const { product, images } = data;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.sale_price || product.regular_price,
      image: images?.[0]?.url || product.image_url,
      quantity: qty,
      color: selectedColor,
      storage: selectedStorage,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }, [data, qty, selectedColor, selectedStorage, addItem]);

  if (loading) return <ProductSkeleton />;
  if (error) return <div className="pdp-page">⚠️ Error: {error}</div>;
  if (!data) return null;

  // --- MAPPING DATA ---
  const { product, images } = data;
  const displayProduct = {
    ...product,
    price: product.sale_price || product.regular_price,
    originalPrice: product.regular_price,
    image: images?.[0]?.url || product.image_url,
    stock: product.stock_quantity
  };

  const discount = calcDiscount(displayProduct.originalPrice, displayProduct.price);
  const imageList = images?.length ? images.map(img => img.url) : [displayProduct.image];

  // ĐỊNH NGHĨA TABS (Cần thiết để sửa lỗi 'tabs is not defined')
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "specs", label: "Specifications" },
    { key: "reviews", label: `Reviews (${MOCK_REVIEWS.length})` },
  ];

  return (
    <>
      <StickyBar
        product={displayProduct}
        selectedColor={selectedColor}
        selectedStorage={selectedStorage}
        qty={qty}
        onAdd={handleAddToCart}
        added={added}
        show={showSticky}
      />

      <div className="pdp-page">
        <nav className="pdp-breadcrumb">
          <Link to="/products">Products</Link>
          <span className="pdp-breadcrumb-sep">/</span>
          <span>{displayProduct.brand}</span>
          <span className="pdp-breadcrumb-sep">/</span>
          <span className="pdp-breadcrumb-cur">{displayProduct.name}</span>
        </nav>

        <div className="pdp-grid">
          <div className="pdp-gallery-col">
            <ImageGallery images={imageList} alt={displayProduct.name} discount={discount} />
          </div>

          <div className="pdp-info-col">
            <div className="pdp-brand-row">
              <span className="pdp-brand">{displayProduct.brand}</span>
              {discount > 0 && <span className="pdp-badge pdp-badge--sale">−{discount}%</span>}
            </div>

            <h1 className="pdp-title">{displayProduct.name}</h1>

            <div className="pdp-rating-row">
              <Stars rating={displayProduct.rating || 5} size={15} />
              <span className="pdp-stock-badge">
                {displayProduct.stock === 0 ? "Out of Stock" : "In Stock"}
              </span>
            </div>

            <div className="pdp-price-row">
              <span className="pdp-price">{formatPrice(displayProduct.price)}</span>
              {discount > 0 && <span className="pdp-price-orig">{formatPrice(displayProduct.originalPrice)}</span>}
            </div>

            <p className="pdp-desc">{displayProduct.description}</p>
            {/* --- PHẦN CHỌN OPTION MỚI CẬP NHẬT --- */}

            {/* 1. Chọn Màu Sắc */}
            {displayProduct.colors?.length > 0 && (
              <div className="pdp-option-group" style={{ marginTop: '24px' }}>
                <p className="pdp-option-label" style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--color-muted)' }}>
                  Màu sắc: <strong style={{ color: 'var(--color-text)', marginLeft: '4px' }}>{selectedColor}</strong>
                </p>
                <div className="pdp-chips" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {displayProduct.colors.map((color) => (
                    <button
                      key={color}
                      className={`pdp-chip ${selectedColor === color ? "pdp-chip--active" : ""}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Chọn Dung Lượng */}
            {displayProduct.storage?.length > 0 && (
              <div className="pdp-option-group" style={{ marginTop: '24px' }}>
                <p className="pdp-option-label" style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--color-muted)' }}>
                  Dung lượng: <strong style={{ color: 'var(--color-text)', marginLeft: '4px' }}>{selectedStorage}</strong>
                </p>
                <div className="pdp-chips" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {displayProduct.storage.map((size) => (
                    <button
                      key={size}
                      className={`pdp-chip ${selectedStorage === size ? "pdp-chip--active" : ""}`}
                      onClick={() => setSelectedStorage(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Chọn Số Lượng */}
            <div className="pdp-option-group" style={{ marginTop: '24px' }}>
              <p className="pdp-option-label" style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--color-muted)' }}>Số lượng</p>
              <div className="pdp-qty-wrap" style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface2)', width: 'fit-content', borderRadius: '12px', padding: '4px' }}>
                <button className="pdp-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '40px', height: '40px', border: 'none', background: 'none', color: 'var(--color-text)', cursor: 'pointer', fontSize: '18px' }}>−</button>
                <span className="pdp-qty-val" style={{ width: '40px', textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                <button className="pdp-qty-btn" onClick={() => setQty(q => Math.min(displayProduct.stock || 99, q + 1))} style={{ width: '40px', height: '40px', border: 'none', background: 'none', color: 'var(--color-text)', cursor: 'pointer', fontSize: '18px' }}>+</button>
              </div>
            </div>

            {/* --- HẾT PHẦN OPTION --- */}
            <div className="pdp-divider" />

            {/* CTAs */}
            <div className="pdp-cta-row" ref={ctaRef}>
              <button
                className={`pdp-cta-primary${added ? " pdp-cta-primary--added" : ""}`}
                onClick={handleAddToCart}
                disabled={displayProduct.stock === 0}
              >
                {added ? <><CheckIcon size={16} /> Added!</> : <><CartPlusIcon size={16} /> Add to Cart</>}
              </button>
              <WishlistButton product={displayProduct} size="md" variant="inline" />
            </div>
          </div>
        </div>

        {/* TABS SECTION */}
        <div ref={tabsRef} className="pdp-tabs-wrap">
          <div className="pdp-tabs" role="tablist">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                className={`pdp-tab${activeTab === key ? " pdp-tab--active" : ""}`}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="pdp-tab-content">
            {activeTab === "overview" && (
              <div className="pdp-tab-panel">{displayProduct.description}</div>
            )}
            {activeTab === "specs" && (
              <div className="pdp-tab-panel pdp-specs">
                {displayProduct.specs ? (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {Object.entries(displayProduct.specs).map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                        <span style={{ color: 'var(--color-muted)', fontWeight: 500 }}>{key}</span>
                        <span style={{ fontWeight: 600 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Thông số kỹ thuật đang được cập nhật...</p>
                )}
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="pdp-tab-panel">
                <p>Đánh giá từ khách hàng ({MOCK_REVIEWS.length})</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
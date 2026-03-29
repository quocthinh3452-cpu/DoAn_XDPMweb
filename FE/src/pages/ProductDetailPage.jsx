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

/* ─── Mock reviews (replace with real API) ────────────────── */
const MOCK_REVIEWS = [
  { id: 1, author: "Minh T.",  avatar: "MT", rating: 5, date: "Mar 2025", title: "Absolutely love it",         body: "Build quality is incredible. Fast, responsive, and looks stunning on my desk. Worth every penny." },
  { id: 2, author: "Linh P.",  avatar: "LP", rating: 4, date: "Feb 2025", title: "Great but pricey",           body: "Performance is top-notch. Knocked off one star because the box could be sturdier for the price point." },
  { id: 3, author: "David K.", avatar: "DK", rating: 5, date: "Feb 2025", title: "Best purchase this year",   body: "Switched from a competitor and the difference is night and day. Display quality alone justifies the cost." },
  { id: 4, author: "Sarah M.", avatar: "SM", rating: 3, date: "Jan 2025", title: "Good, some caveats",        body: "Works as advertised. Setup took longer than expected and the manual is sparse. Still a solid product." },
  { id: 5, author: "Huy N.",   avatar: "HN", rating: 5, date: "Jan 2025", title: "Exceeded my expectations", body: "Fast shipping, perfect condition. Using it daily for work — battery life is genuinely impressive." },
];

/* ─── Icons ───────────────────────────────────────────────── */
function StarIcon({ filled, size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "var(--color-border, rgba(255,255,255,.2))"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function CheckIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function CartPlusIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
      <line x1="12" y1="11" x2="12" y2="17"/>
      <line x1="9" y1="14" x2="15" y2="14"/>
    </svg>
  );
}

function ShieldIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function TruckIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
}

function RotateIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
    </svg>
  );
}

/* ─── Stars ───────────────────────────────────────────────── */
function Stars({ rating, size = 14 }) {
  return (
    <span className="pdp-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <StarIcon key={i} filled={i <= Math.round(rating)} size={size} />
      ))}
    </span>
  );
}

/* ─── Rating bar ──────────────────────────────────────────── */
function RatingBar({ label, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="pdp-rbar">
      <span className="pdp-rbar-label">{label}</span>
      <div className="pdp-rbar-track">
        <div className="pdp-rbar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="pdp-rbar-count">{count}</span>
    </div>
  );
}

/* ─── Sticky bar ──────────────────────────────────────────── */
function StickyBar({ product, selectedColor, selectedStorage, qty, onAdd, added, show }) {
  return (
    <div className={`pdp-sticky-bar${show ? " pdp-sticky-bar--visible" : ""}`} aria-hidden={!show}>
      <div className="pdp-sticky-inner">
        <div className="pdp-sticky-info">
          <img src={product.image} alt={product.name} className="pdp-sticky-thumb" />
          <div>
            <p className="pdp-sticky-name">{product.name}</p>
            <p className="pdp-sticky-price">{formatPrice(product.price)}</p>
          </div>
        </div>

        <div className="pdp-sticky-chips">
          {selectedColor   && <span className="pdp-sticky-chip">{selectedColor}</span>}
          {selectedStorage && <span className="pdp-sticky-chip">{selectedStorage}</span>}
          <span className="pdp-sticky-chip">Qty: {qty}</span>
        </div>

        <button
          className={`pdp-sticky-cta${added ? " pdp-sticky-cta--added" : ""}`}
          onClick={onAdd}
          disabled={product.stock === 0 || added}
        >
          {added ? (
            <><CheckIcon size={14} /> Added!</>
          ) : (
            <><CartPlusIcon size={14} /> Add to Cart</>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Loading skeleton ────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="pdp-page">
      <div className="pdp-grid">
        <div>
          <div className="skeleton pdp-skel-img" />
          <div className="pdp-skel-thumbs">
            {[0, 1, 2].map(i => <div key={i} className="skeleton pdp-skel-thumb" />)}
          </div>
        </div>
        <div className="pdp-skel-info">
          {[40, 260, 120, 160, 90, 220, 64].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 16, width: w, borderRadius: 6 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Tab panels ──────────────────────────────────────────── */
function OverviewPanel({ product }) {
  return (
    <div className="pdp-tab-panel pdp-overview">
      <p className="pdp-overview-body">{product.description}</p>
      {product.features?.map((f, i) => (
        <div key={i} className="pdp-feature-item">
          <span className="pdp-feature-dot"><CheckIcon size={12} /></span>
          <span>{f}</span>
        </div>
      ))}
    </div>
  );
}

function SpecsPanel({ specs }) {
  return (
    <div className="pdp-tab-panel">
      <div className="pdp-specs-grid">
        {Object.entries(specs).map(([k, v]) => (
          <div key={k} className="pdp-spec-row">
            <span className="pdp-spec-key">{k}</span>
            <span className="pdp-spec-val">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsPanel({ reviews, reviewSort, onSortChange }) {
  const reviewAvg  = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  const sortedReviews = [...reviews].sort((a, b) =>
    reviewSort === "highest" ? b.rating - a.rating :
    reviewSort === "lowest"  ? a.rating - b.rating : 0
  );

  return (
    <div className="pdp-tab-panel">
      {/* Summary */}
      <div className="pdp-review-summary">
        <div className="pdp-review-avg-col">
          <span className="pdp-review-big-num">{reviewAvg.toFixed(1)}</span>
          <Stars rating={reviewAvg} size={20} />
          <span className="pdp-review-total">{reviews.length} reviews</span>
        </div>
        <div className="pdp-review-dist">
          {ratingDist.map(({ star, count }) => (
            <RatingBar key={star} label={`${star}★`} count={count} total={reviews.length} />
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="pdp-review-sort-row">
        <span className="pdp-review-sort-label">Sort by:</span>
        {[["recent", "Most recent"], ["highest", "Highest rated"], ["lowest", "Lowest rated"]].map(([val, label]) => (
          <button
            key={val}
            className={`pdp-sort-chip${reviewSort === val ? " pdp-sort-chip--active" : ""}`}
            onClick={() => onSortChange(val)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="pdp-review-list">
        {sortedReviews.map(r => (
          <div key={r.id} className="pdp-review-card">
            <div className="pdp-review-header">
              <div className="pdp-review-avatar">{r.avatar}</div>
              <div>
                <p className="pdp-review-author">{r.author}</p>
                <p className="pdp-review-date">{r.date}</p>
              </div>
              <div className="pdp-review-stars-right">
                <Stars rating={r.rating} size={13} />
              </div>
            </div>
            <p className="pdp-review-title">{r.title}</p>
            <p className="pdp-review-body">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Trust badges data ───────────────────────────────────── */
const TRUST_BADGES = [
  { icon: <TruckIcon />,  label: "Free shipping over $500" },
  { icon: <ShieldIcon />, label: "2-year warranty"         },
  { icon: <RotateIcon />, label: "30-day returns"          },
];

/* ─── Main page ───────────────────────────────────────────── */
export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [product,         setProduct]         = useState(null);
  const [related,         setRelated]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [selectedColor,   setSelectedColor]   = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [qty,             setQty]             = useState(1);
  const [added,           setAdded]           = useState(false);
  const [showSticky,      setShowSticky]      = useState(false);
  const [activeTab,       setActiveTab]       = useState("overview");
  const [reviewSort,      setReviewSort]      = useState("recent");

  const ctaRef  = useRef(null);
  const tabsRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setAdded(false);
    getProductById(id)
      .then(r => {
        setProduct(r.data);
        setSelectedColor(r.data.colors?.[0] || null);
        setSelectedStorage(r.data.storage?.[0] || null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product) return;
    getProducts({ category: product.category, limit: 4 })
      .then(r => setRelated((r.data || []).filter(p => p.id !== product.id).slice(0, 4)))
      .catch(() => {});
  }, [product]);

  useEffect(() => {
    const handler = () => {
      if (!ctaRef.current) return;
      setShowSticky(ctaRef.current.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addItem({
      productId: product.id,
      name:      product.name,
      price:     product.price,
      image:     product.image,
      quantity:  qty,
      color:     selectedColor,
      storage:   selectedStorage,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }, [product, qty, selectedColor, selectedStorage, addItem]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chipCls = (active) => `pdp-chip${active ? " pdp-chip--active" : ""}`;

  if (loading) return <ProductSkeleton />;

  if (error) return (
    <div className="pdp-page pdp-page--error">
      <p className="pdp-error-msg">⚠️ {error}</p>
      <Link to="/products" className="pdp-back-link">← Back to Products</Link>
    </div>
  );

  if (!product) return null;

  const discount = calcDiscount(product.originalPrice, product.price);
  const images   = product.images?.length ? product.images : [product.image];

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "specs",    label: "Specifications" },
    { key: "reviews",  label: `Reviews (${MOCK_REVIEWS.length})` },
  ];

  return (
    <>
      <StickyBar
        product={product}
        selectedColor={selectedColor}
        selectedStorage={selectedStorage}
        qty={qty}
        onAdd={handleAddToCart}
        added={added}
        show={showSticky}
      />

      <div className="pdp-page">
        {/* Breadcrumb */}
        <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
          <Link to="/products" className="pdp-breadcrumb-link">Products</Link>
          <span className="pdp-breadcrumb-sep" aria-hidden="true">/</span>
          <span className="pdp-breadcrumb-link">{product.brand}</span>
          <span className="pdp-breadcrumb-sep" aria-hidden="true">/</span>
          <span className="pdp-breadcrumb-cur">{product.name}</span>
        </nav>

        {/* Hero grid */}
        <div className="pdp-grid">
          {/* Gallery */}
          <div className="pdp-gallery-col">
            <ImageGallery images={images} alt={product.name} discount={discount} />
          </div>

          {/* Info */}
          <div className="pdp-info-col">
            {/* Brand + badges */}
            <div className="pdp-brand-row">
              <span className="pdp-brand">{product.brand}</span>
              {product.isNew  && <span className="pdp-badge pdp-badge--new">New</span>}
              {discount > 0   && <span className="pdp-badge pdp-badge--sale">−{discount}%</span>}
            </div>

            <h1 className="pdp-title">{product.name}</h1>

            {/* Rating row */}
            <div className="pdp-rating-row">
              <Stars rating={product.rating} size={15} />
              <span className="pdp-rating-val">{product.rating}</span>
              <button
                className="pdp-rating-link"
                onClick={() => handleTabChange("reviews")}
              >
                {product.reviewCount?.toLocaleString()} reviews
              </button>
              <span className={[
                "pdp-stock-badge",
                product.stock === 0         ? "pdp-stock-badge--out" :
                product.stock < 5           ? "pdp-stock-badge--low" : "",
              ].join(" ").trim()}>
                {product.stock === 0     ? "Out of Stock"           :
                 product.stock < 5      ? `Only ${product.stock} left` : "In Stock"}
              </span>
            </div>

            {/* Price */}
            <div className="pdp-price-row">
              <span className="pdp-price">{formatPrice(product.price)}</span>
              {discount > 0 && (
                <>
                  <span className="pdp-price-orig">{formatPrice(product.originalPrice)}</span>
                  <span className="pdp-save-badge">Save {formatPrice(product.originalPrice - product.price)}</span>
                </>
              )}
            </div>

            <p className="pdp-desc">{product.description}</p>

            <div className="pdp-divider" />

            {/* Color */}
            {product.colors?.length > 0 && (
              <div className="pdp-option-group">
                <p className="pdp-option-label">
                  Color <strong className="pdp-option-val">{selectedColor}</strong>
                </p>
                <div className="pdp-chips">
                  {product.colors.map(c => (
                    <button key={c} className={chipCls(selectedColor === c)} onClick={() => setSelectedColor(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Storage */}
            {product.storage?.length > 0 && (
              <div className="pdp-option-group">
                <p className="pdp-option-label">
                  Storage <strong className="pdp-option-val">{selectedStorage}</strong>
                </p>
                <div className="pdp-chips">
                  {product.storage.map(s => (
                    <button key={s} className={chipCls(selectedStorage === s)} onClick={() => setSelectedStorage(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="pdp-option-group">
              <p className="pdp-option-label">Quantity</p>
              <div className="pdp-qty-wrap">
                <button className="pdp-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                <span className="pdp-qty-val">{qty}</span>
                <button className="pdp-qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))} aria-label="Increase quantity">+</button>
              </div>
            </div>

            {/* CTAs */}
            <div className="pdp-cta-row" ref={ctaRef}>
              <button
                className={`pdp-cta-primary${added ? " pdp-cta-primary--added" : ""}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {added
                  ? <><CheckIcon size={16} /> Added to Cart!</>
                  : <><CartPlusIcon size={16} /> Add to Cart</>
                }
              </button>
              <WishlistButton
                product={{ id: product.id, name: product.name, price: product.price, image: product.image, brand: product.brand }}
                size="md"
                variant="inline"
              />
            </div>

            {/* Trust badges */}
            <div className="pdp-trust-row">
              {TRUST_BADGES.map(({ icon, label }) => (
                <div key={label} className="pdp-trust-item">
                  <span className="pdp-trust-icon">{icon}</span>
                  <span className="pdp-trust-label">{label}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="pdp-tags">
                {product.tags.map(t => <span key={t} className="pdp-tag">{t}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
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

          {activeTab === "overview" && <OverviewPanel product={product} />}
          {activeTab === "specs"    && product.specs && <SpecsPanel specs={product.specs} />}
          {activeTab === "reviews"  && (
            <ReviewsPanel
              reviews={MOCK_REVIEWS}
              reviewSort={reviewSort}
              onSortChange={setReviewSort}
            />
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="pdp-related">
            <div className="pdp-related-header">
              <h2 className="pdp-related-title">You might also like</h2>
              <Link to="/products" className="pdp-related-all">View all →</Link>
            </div>
            <div className="pdp-related-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

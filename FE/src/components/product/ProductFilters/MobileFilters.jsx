/**
 * MobileFilters.jsx
 *
 * 2 thành phần:
 *  1. MobileFilterBar  — sticky bar dưới header, hiện active pills + nút "Lọc"
 *  2. MobileFilterSheet — bottom sheet full filter (slide up từ dưới)
 *
 * Body scroll lock khi sheet mở.
 * Swipe down để đóng sheet.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  countActiveFilters,
  makeDefaultFilters,
  getFilterLabels,
  SORT_OPTIONS,
} from "./FilterContext";
import DualRangeSlider from "./DualRangeSlider";
import SortDropdown    from "./SortDropdown";
import {
  Toggle, RadioGroup, Chip,
  CategoryBtn, BrandCheckbox,
} from "./FilterAtoms";

/* ═══════════════════════════════════════════════════════════
   MobileFilterBar — sticky, selalu terlihat
═══════════════════════════════════════════════════════════ */
export function MobileFilterBar({
  filters,
  onChange,
  onOpenSheet,
  priceRange = { min: 0, max: 50_000_000 },
  brands     = [],
  categories = [],
}) {
  const activeCount = countActiveFilters(filters, priceRange);
  const labels      = getFilterLabels(filters, { brands, categories });

  const removeLabel = (key) => {
    // Parse key và reset filter tương ứng
    if (key === "category")    onChange({ ...filters, category: null });
    else if (key.startsWith("brand-")) {
      const id = key.replace("brand-", "");
      onChange({ ...filters, brands: (filters.brands ?? []).filter(b => b !== id) });
    }
    else if (key === "condition")   onChange({ ...filters, condition: null });
    else if (key === "preOrder")    onChange({ ...filters, preOrder: false });
    else if (key === "flashSale")   onChange({ ...filters, flashSale: false });
    else if (key === "warranty")    onChange({ ...filters, warranty: null });
    else if (key === "version")     onChange({ ...filters, version: null });
    else if (key === "installment") onChange({ ...filters, installment: false });
    else if (key === "storages")    onChange({ ...filters, storages: [] });
    else if (key === "rams")        onChange({ ...filters, rams: [] });
    else if (key === "battery")     onChange({ ...filters, batteryMin: 0 });
  };

  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      gap:            8,
      padding:        "10px 0",
      overflowX:      "auto",
      scrollbarWidth: "none",
      WebkitOverflowScrolling: "touch",
    }}>
      {/* Filter button */}
      <button
        onClick={onOpenSheet}
        style={{
          display:     "inline-flex",
          alignItems:  "center",
          gap:         6,
          padding:     "7px 14px",
          borderRadius: 99,
          border:      `1px solid ${activeCount > 0 ? "var(--color-accent)" : "var(--color-border)"}`,
          background:  activeCount > 0 ? "rgba(124,111,247,0.10)" : "var(--color-surface)",
          color:       activeCount > 0 ? "var(--color-accent)" : "var(--color-text2)",
          fontFamily:  "var(--font-display)",
          fontWeight:  600,
          fontSize:    13,
          cursor:      "pointer",
          flexShrink:  0,
          whiteSpace:  "nowrap",
          transition:  "border-color 150ms, background 150ms, color 150ms",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
          <line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
        Lọc
        {activeCount > 0 && (
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 10, padding: "1px 5px", borderRadius: 99,
            background: "var(--color-accent)", color: "#fff", lineHeight: 1.6,
          }}>
            {activeCount}
          </span>
        )}
      </button>

      {/* Sort quick select */}
      <select
        value={filters.sort}
        onChange={e => onChange({ ...filters, sort: e.target.value })}
        style={{
          padding:      "7px 28px 7px 12px",
          borderRadius: 99,
          border:       `1px solid ${filters.sort !== "default" ? "var(--color-accent)" : "var(--color-border)"}`,
          background:   "var(--color-surface)",
          color:        filters.sort !== "default" ? "var(--color-accent)" : "var(--color-text2)",
          fontFamily:   "var(--font-body)",
          fontSize:     13,
          cursor:       "pointer",
          flexShrink:   0,
          appearance:   "none",
          WebkitAppearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238888a8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
          whiteSpace:   "nowrap",
        }}
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Active filter pills */}
      {labels.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => removeLabel(key)}
          style={{
            display:     "inline-flex",
            alignItems:  "center",
            gap:         5,
            padding:     "6px 10px",
            borderRadius: 99,
            border:      "1px solid rgba(124,111,247,0.35)",
            background:  "rgba(124,111,247,0.10)",
            color:       "var(--color-accent)",
            fontFamily:  "var(--font-body)",
            fontSize:    12,
            cursor:      "pointer",
            flexShrink:  0,
            whiteSpace:  "nowrap",
          }}
        >
          {label}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MobileFilterSheet — bottom sheet
═══════════════════════════════════════════════════════════ */
export function MobileFilterSheet({
  open,
  onClose,
  filters,
  onChange,
  categories     = [],
  brands         = [],
  storageOptions = [],
  ramOptions     = [],
  chipOptions    = [],
  colorOptions   = [],
  priceRange     = { min: 0, max: 50_000_000 },
}) {
  const sheetRef   = useRef(null);
  const dragRef    = useRef({ startY: null, currentY: 0 });
  const [translateY, setTranslateY] = useState(0);

  const update = useCallback(
    (key, val) => onChange({ ...filters, [key]: val }),
    [filters, onChange],
  );

  const toggleArr = useCallback((key, id) => {
    const curr = filters[key] ?? [];
    update(key, curr.includes(id) ? curr.filter(x => x !== id) : [...curr, id]);
  }, [filters, update]);

  const resetAll = useCallback(
    () => onChange(makeDefaultFilters(priceRange)),
    [onChange, priceRange],
  );

  const activeCount = countActiveFilters(filters, priceRange);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Swipe down to close
  const handleDragStart = (e) => {
    dragRef.current.startY = e.touches[0].clientY;
  };
  const handleDragMove = (e) => {
    if (dragRef.current.startY === null) return;
    const dy = e.touches[0].clientY - dragRef.current.startY;
    if (dy > 0) setTranslateY(dy);
  };
  const handleDragEnd = () => {
    if (translateY > 100) onClose();
    else setTranslateY(0);
    dragRef.current.startY = null;
  };

  if (!open) return null;

  return (
    <>
      <style>{`@keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }`}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.6)",
          animation: "fadeIn 200ms ease",
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={{
          position:     "fixed",
          bottom:       0,
          left:         0,
          right:        0,
          zIndex:       101,
          background:   "var(--color-surface)",
          borderRadius: "20px 20px 0 0",
          border:       "1px solid var(--color-border2)",
          borderBottom: "none",
          maxHeight:    "90dvh",
          display:      "flex",
          flexDirection:"column",
          transform:    `translateY(${translateY}px)`,
          transition:   translateY === 0 ? "transform 200ms ease" : "none",
          animation:    "slideUp 280ms cubic-bezier(0.16,1,0.3,1)",
          boxShadow:    "var(--shadow-modal)",
        }}
      >
        {/* Drag handle */}
        <div
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          style={{ padding: "12px 0 6px", cursor: "grab", flexShrink: 0 }}
        >
          <div style={{
            width: 36, height: 4, borderRadius: 99,
            background: "var(--color-border2)",
            margin: "0 auto",
          }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 20px 14px", flexShrink: 0,
          borderBottom: "1px solid var(--color-border)",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 16, color: "var(--color-text)", letterSpacing: "-0.01em",
            }}>
              Bộ lọc
            </span>
            {activeCount > 0 && (
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: 11, padding: "2px 8px", borderRadius: 99,
                background: "var(--color-accent)", color: "#fff", lineHeight: 1.6,
              }}>
                {activeCount}
              </span>
            )}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {activeCount > 0 && (
              <button onClick={resetAll} style={{
                fontFamily: "var(--font-body)", fontSize: 13,
                color: "var(--color-accent-hl)", background: "none",
                border: "none", cursor: "pointer", padding: 0,
              }}>
                Xoá tất cả
              </button>
            )}
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--color-surface2)",
              border: "1px solid var(--color-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-muted)" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "16px 20px",
          WebkitOverflowScrolling: "touch",
        }}>

          {/* Sort */}
          <SheetSection title="Sắp xếp">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update("sort", opt.value)}
                  style={{
                    padding: "7px 14px", borderRadius: 99,
                    border: `1px solid ${filters.sort === opt.value ? "var(--color-accent)" : "var(--color-border)"}`,
                    background: filters.sort === opt.value ? "rgba(124,111,247,0.12)" : "var(--color-surface2)",
                    color: filters.sort === opt.value ? "var(--color-accent)" : "var(--color-text2)",
                    fontFamily: "var(--font-body)", fontWeight: filters.sort === opt.value ? 600 : 400,
                    fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                    transition: "border-color 150ms, background 150ms, color 150ms",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </SheetSection>

          {/* Brands */}
          {brands.length > 0 && (
            <SheetSection title="Thương hiệu">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {brands.map(brand => {
                  const active = (filters.brands ?? []).includes(brand.id);
                  return (
                    <button key={brand.id} onClick={() => toggleArr("brands", brand.id)} style={{
                      padding: "7px 14px", borderRadius: 99,
                      border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
                      background: active ? "rgba(124,111,247,0.12)" : "var(--color-surface2)",
                      color: active ? "var(--color-accent)" : "var(--color-text2)",
                      fontFamily: "var(--font-body)", fontWeight: active ? 600 : 400,
                      fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                      transition: "border-color 150ms, background 150ms, color 150ms",
                    }}>
                      {brand.name}{brand.count !== undefined ? ` (${brand.count})` : ""}
                    </button>
                  );
                })}
              </div>
            </SheetSection>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <SheetSection title="Danh mục">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <PillBtn
                  label="Tất cả"
                  active={!filters.category}
                  onClick={() => update("category", null)}
                />
                {categories.filter(c => c.id !== "all").map(cat => (
                  <PillBtn key={cat.id} label={cat.label}
                    active={filters.category === cat.id}
                    onClick={() => update("category", filters.category === cat.id ? null : cat.id)}
                  />
                ))}
              </div>
            </SheetSection>
          )}

          {/* Price */}
          <SheetSection title="Khoảng giá">
            <DualRangeSlider
              bounds={priceRange}
              value={{ min: filters.minPrice ?? priceRange.min, max: filters.maxPrice ?? priceRange.max }}
              onChange={({ min, max }) => onChange({ ...filters, minPrice: min, maxPrice: max })}
            />
          </SheetSection>

          {/* Tình trạng */}
          <SheetSection title="Tình trạng hàng">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {[
                { value: "new",         label: "Mới 100%" },
                { value: "refurbished", label: "Trưng bày" },
              ].map(opt => (
                <PillBtn key={opt.value} label={opt.label}
                  active={filters.condition === opt.value}
                  onClick={() => update("condition", filters.condition === opt.value ? null : opt.value)}
                />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Toggle checked={filters.preOrder ?? false} onChange={v => update("preOrder", v)}
                label="Pre-order" sublabel="Giao 7–14 ngày" />
              <Toggle checked={filters.flashSale ?? false} onChange={v => update("flashSale", v)}
                label="Flash sale" sublabel="Đang khuyến mãi" />
              <Toggle checked={filters.installment ?? false} onChange={v => update("installment", v)}
                label="Trả góp 0%" />
            </div>
          </SheetSection>

          {/* Bảo hành */}
          <SheetSection title="Bảo hành">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { value: "official", label: "Chính hãng" },
                { value: "shop",     label: "Bảo hành shop" },
              ].map(opt => (
                <PillBtn key={opt.value} label={opt.label}
                  active={filters.warranty === opt.value}
                  onClick={() => update("warranty", filters.warranty === opt.value ? null : opt.value)}
                />
              ))}
            </div>
          </SheetSection>

          {/* Phiên bản */}
          <SheetSection title="Phiên bản">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { value: "vna",           label: "VN/A" },
                { value: "international", label: "Quốc tế" },
              ].map(opt => (
                <PillBtn key={opt.value} label={opt.label}
                  active={filters.version === opt.value}
                  onClick={() => update("version", filters.version === opt.value ? null : opt.value)}
                />
              ))}
            </div>
          </SheetSection>

          {/* Storage */}
          {storageOptions.length > 0 && (
            <SheetSection title="Dung lượng">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {storageOptions.map(s => (
                  <Chip key={s} label={s}
                    active={(filters.storages ?? []).includes(s)}
                    onClick={() => toggleArr("storages", s)}
                  />
                ))}
              </div>
            </SheetSection>
          )}

          {/* RAM */}
          {ramOptions.length > 0 && (
            <SheetSection title="RAM">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ramOptions.map(r => (
                  <Chip key={r} label={r}
                    active={(filters.rams ?? []).includes(r)}
                    onClick={() => toggleArr("rams", r)}
                  />
                ))}
              </div>
            </SheetSection>
          )}

          {/* Pin */}
          <SheetSection title="Pin tối thiểu">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { value: 4000, label: "4.000 mAh" },
                { value: 5000, label: "5.000 mAh" },
                { value: 6000, label: "6.000 mAh" },
              ].map(opt => (
                <PillBtn key={opt.value} label={opt.label}
                  active={(filters.batteryMin ?? 0) === opt.value}
                  onClick={() => update("batteryMin", (filters.batteryMin ?? 0) === opt.value ? 0 : opt.value)}
                />
              ))}
            </div>
          </SheetSection>

          {/* Màu */}
          {colorOptions.length > 0 && (
            <SheetSection title="Màu sắc">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {colorOptions.map(c => (
                  <Chip key={c.value} label={c.label} color={c.value}
                    active={(filters.colors ?? []).includes(c.value)}
                    onClick={() => toggleArr("colors", c.value)}
                  />
                ))}
              </div>
            </SheetSection>
          )}

          {/* Phụ kiện */}
          <SheetSection title="Sạc kèm">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { value: "yes", label: "Có sạc kèm" },
                { value: "no",  label: "Không kèm sạc" },
              ].map(opt => {
                const cur = filters.hasCharger === true ? "yes" : filters.hasCharger === false ? "no" : null;
                return (
                  <PillBtn key={opt.value} label={opt.label}
                    active={cur === opt.value}
                    onClick={() => update("hasCharger", cur === opt.value ? null : opt.value === "yes" ? true : false)}
                  />
                );
              })}
            </div>
          </SheetSection>

          {/* Còn hàng */}
          <div style={{ paddingBottom: 16 }}>
            <Toggle
              checked={filters.inStockOnly ?? false}
              onChange={v => update("inStockOnly", v)}
              label="Chỉ hiện hàng còn"
            />
          </div>

        </div>

        {/* Footer CTA */}
        <div style={{
          padding: "12px 20px 28px",
          borderTop: "1px solid var(--color-border)",
          flexShrink: 0,
          background: "var(--color-surface)",
        }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{
              width: "100%", padding: "13px",
              borderRadius: 12, border: "none",
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 15, cursor: "pointer",
            }}
          >
            Xem kết quả{activeCount > 0 ? ` (${activeCount} bộ lọc)` : ""}
          </button>
        </div>

      </div>
    </>
  );
}

/* ── Sheet section helper ─────────────────────────────── */
function SheetSection({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontFamily: "var(--font-display)", fontWeight: 700,
        fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em",
        color: "var(--color-muted)", marginBottom: 10,
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

/* ── Pill button for mobile sheet ─────────────────────── */
function PillBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 14px", borderRadius: 99, cursor: "pointer",
      border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
      background: active ? "rgba(124,111,247,0.12)" : "var(--color-surface2)",
      color: active ? "var(--color-accent)" : "var(--color-text2)",
      fontFamily: "var(--font-body)", fontWeight: active ? 600 : 400,
      fontSize: 13, whiteSpace: "nowrap",
      transition: "border-color 150ms, background 150ms, color 150ms",
    }}>
      {label}
    </button>
  );
}

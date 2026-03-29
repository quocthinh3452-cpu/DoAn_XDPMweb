/**
 * DesktopFilters.jsx — sidebar 220px
 * Hiển thị trên md+ breakpoint.
 */
import { useCallback } from "react";
import {
  countActiveFilters,
  makeDefaultFilters,
  SORT_OPTIONS,
} from "./FilterContext";
import FilterSection     from "./FilterSection";
import DualRangeSlider   from "./DualRangeSlider";
import SortDropdown      from "./SortDropdown";
import {
  Toggle, RadioGroup, Chip,
  CategoryBtn, BrandCheckbox,
} from "./FilterAtoms";

export default function DesktopFilters({
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

  return (
    <aside style={{ width: 220, flexShrink: 0 }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 18,
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 13, color: "var(--color-text)", letterSpacing: "-0.01em",
          }}>
            Bộ lọc
          </span>
          {activeCount > 0 && (
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 10, padding: "2px 7px", borderRadius: 99,
              background: "var(--color-accent)", color: "#fff", lineHeight: 1.6,
              animation: "popIn 200ms cubic-bezier(0.34,1.56,0.64,1)",
            }}>
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button onClick={resetAll} style={{
            fontFamily: "var(--font-body)", fontSize: 12,
            color: "var(--color-accent-hl)", background: "none",
            border: "none", cursor: "pointer", padding: 0, transition: "opacity 150ms",
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = ".7"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            Xoá tất cả
          </button>
        )}
      </div>

      {/* Sort */}
      <FilterSection title="Sắp xếp" badge={filters.sort !== "default" ? 1 : 0}>
        <SortDropdown value={filters.sort} onChange={v => update("sort", v)} />
      </FilterSection>

      {/* Brand */}
      {brands.length > 0 && (
        <FilterSection title="Thương hiệu" badge={filters.brands?.length ?? 0}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {brands.map(brand => (
              <BrandCheckbox
                key={brand.id} brand={brand}
                checked={(filters.brands ?? []).includes(brand.id)}
                onToggle={() => toggleArr("brands", brand.id)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Category */}
      {categories.length > 0 && (
        <FilterSection title="Danh mục" badge={filters.category ? 1 : 0}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {!categories.some(c => c.id === "all") && (
              <CategoryBtn
                label="Tất cả" active={!filters.category}
                count={categories.reduce((s, c) => s + (c.count ?? 0), 0) || undefined}
                onClick={() => update("category", null)}
              />
            )}
            {categories.map(cat => (
              <CategoryBtn
                key={cat.id} label={cat.label}
                active={cat.id === "all" ? !filters.category : filters.category === cat.id}
                count={cat.count}
                onClick={() =>
                  cat.id === "all"
                    ? update("category", null)
                    : update("category", cat.id === filters.category ? null : cat.id)
                }
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price */}
      <FilterSection
        title="Khoảng giá"
        badge={(filters.minPrice > priceRange.min || filters.maxPrice < priceRange.max) ? 1 : 0}
      >
        <DualRangeSlider
          bounds={priceRange}
          value={{ min: filters.minPrice ?? priceRange.min, max: filters.maxPrice ?? priceRange.max }}
          onChange={({ min, max }) => onChange({ ...filters, minPrice: min, maxPrice: max })}
        />
      </FilterSection>

      {/* Tình trạng */}
      <FilterSection
        title="Tình trạng"
        badge={[filters.condition, filters.preOrder, filters.flashSale, filters.installment].filter(Boolean).length}
      >
        <RadioGroup
          value={filters.condition}
          onChange={v => update("condition", v)}
          options={[
            { value: "new",         label: "Hàng mới 100%" },
            { value: "refurbished", label: "Hàng trưng bày", sublabel: "Đã qua sử dụng" },
          ]}
        />
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 0 }}>
          <Toggle
            checked={filters.preOrder ?? false}
            onChange={v => update("preOrder", v)}
            label="Đặt trước / Pre-order"
            sublabel="Giao 7–14 ngày"
          />
          <Toggle
            checked={filters.flashSale ?? false}
            onChange={v => update("flashSale", v)}
            label="Flash sale"
            sublabel="Đang khuyến mãi"
          />
          <Toggle
            checked={filters.installment ?? false}
            onChange={v => update("installment", v)}
            label="Trả góp 0%"
            sublabel="Hỗ trợ trả góp"
          />
        </div>
      </FilterSection>

      {/* Bảo hành */}
      <FilterSection title="Bảo hành" badge={filters.warranty ? 1 : 0}>
        <RadioGroup
          value={filters.warranty}
          onChange={v => update("warranty", v)}
          options={[
            { value: "official", label: "Chính hãng",   sublabel: "12–24 tháng" },
            { value: "shop",     label: "Bảo hành shop", sublabel: "6–12 tháng" },
          ]}
        />
      </FilterSection>

      {/* Phiên bản */}
      <FilterSection title="Phiên bản" badge={filters.version ? 1 : 0}>
        <RadioGroup
          value={filters.version}
          onChange={v => update("version", v)}
          options={[
            { value: "vna",           label: "VN/A",        sublabel: "Chính hãng VN" },
            { value: "international", label: "Quốc tế",     sublabel: "LL/A, ZA/A..." },
          ]}
        />
      </FilterSection>

      {/* Storage */}
      {storageOptions.length > 0 && (
        <FilterSection title="Dung lượng" badge={filters.storages?.length ?? 0}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {storageOptions.map(s => (
              <Chip key={s} label={s}
                active={(filters.storages ?? []).includes(s)}
                onClick={() => toggleArr("storages", s)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* RAM */}
      {ramOptions.length > 0 && (
        <FilterSection title="RAM" badge={filters.rams?.length ?? 0}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ramOptions.map(r => (
              <Chip key={r} label={r}
                active={(filters.rams ?? []).includes(r)}
                onClick={() => toggleArr("rams", r)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Chip */}
      {chipOptions.length > 0 && (
        <FilterSection title="Chip" badge={filters.chips?.length ?? 0}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {chipOptions.map(c => (
              <Chip key={c} label={c}
                active={(filters.chips ?? []).includes(c)}
                onClick={() => toggleArr("chips", c)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Pin */}
      <FilterSection title="Dung lượng pin" badge={(filters.batteryMin ?? 0) > 0 ? 1 : 0}>
        <RadioGroup
          value={filters.batteryMin > 0 ? String(filters.batteryMin) : null}
          onChange={v => update("batteryMin", v ? Number(v) : 0)}
          options={[
            { value: "4000", label: "Từ 4.000 mAh" },
            { value: "5000", label: "Từ 5.000 mAh" },
            { value: "6000", label: "Từ 6.000 mAh" },
          ]}
        />
      </FilterSection>

      {/* Màu sắc */}
      {colorOptions.length > 0 && (
        <FilterSection title="Màu sắc" badge={filters.colors?.length ?? 0}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {colorOptions.map(c => (
              <Chip key={c.value} label={c.label} color={c.value}
                active={(filters.colors ?? []).includes(c.value)}
                onClick={() => toggleArr("colors", c.value)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Sạc kèm */}
      <FilterSection
        title="Phụ kiện"
        badge={filters.hasCharger !== null && filters.hasCharger !== undefined ? 1 : 0}
      >
        <RadioGroup
          value={filters.hasCharger === true ? "yes" : filters.hasCharger === false ? "no" : null}
          onChange={v => update("hasCharger", v === "yes" ? true : v === "no" ? false : null)}
          options={[
            { value: "yes", label: "Có sạc kèm" },
            { value: "no",  label: "Không kèm sạc" },
          ]}
        />
      </FilterSection>

      {/* Còn hàng */}
      <div style={{ paddingBottom: 8 }}>
        <Toggle
          checked={filters.inStockOnly ?? false}
          onChange={v => update("inStockOnly", v)}
          label="Chỉ còn hàng"
        />
      </div>

    </aside>
  );
}

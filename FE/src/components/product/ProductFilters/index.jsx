/**
 * filters/index.jsx — main entry point
 *
 * Auto-switch giữa Desktop sidebar và Mobile bottom sheet
 * dựa vào window width. Không cần truyền thêm prop.
 *
 * Usage:
 *   import ProductFilters from "@/components/filters";
 *
 *   <ProductFilters
 *     filters={filters}
 *     onChange={setFilters}
 *     brands={brands}
 *     categories={categories}
 *     storageOptions={["128GB","256GB","512GB"]}
 *     ramOptions={["8GB","12GB","16GB"]}
 *     chipOptions={["A18 Pro","Snapdragon 8 Gen 3"]}
 *     colorOptions={[{ value:"#1a1a1a", label:"Đen" }]}
 *     priceRange={{ min:0, max:50_000_000 }}
 *   />
 *
 * Re-exports:
 *   DEFAULT_FILTERS, countActiveFilters, makeDefaultFilters
 *   SORT_OPTIONS, getFilterLabels
 */
import { useState, useEffect } from "react";
import DesktopFilters from "./DesktopFilters";
import { MobileFilterBar, MobileFilterSheet } from "./MobileFilters";

export {
  DEFAULT_FILTERS,
  countActiveFilters,
  makeDefaultFilters,
  SORT_OPTIONS,
  getFilterLabels,
} from "./FilterContext";

const MOBILE_BREAKPOINT = 768;

export default function ProductFilters(props) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const fn = () => setIsMobile(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  if (isMobile) {
    return (
      <>
        <MobileFilterBar
          {...props}
          onOpenSheet={() => setSheetOpen(true)}
        />
        <MobileFilterSheet
          {...props}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      </>
    );
  }

  return <DesktopFilters {...props} />;
}

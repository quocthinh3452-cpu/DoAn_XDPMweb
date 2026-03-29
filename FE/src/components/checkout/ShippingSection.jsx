/**
 * ShippingSection.jsx
 *
 * Luôn hiện trên layout.
 * Làm mờ + disabled khi chưa chọn đủ địa chỉ (districtId + wardCode).
 */

import { SectionTitle } from "./primitives.jsx";
import { useShippingServices } from "../../hooks/useShippingServices.js";
import "./ShippingSection.css";
const SERVICE_LABEL = {
  2: { name: "Hàng nhanh",      desc: "Giao trong 1–2 ngày" },
  5: { name: "Hàng tiêu chuẩn", desc: "Giao trong 3–5 ngày" },
};

function fmt(amount) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function fmtEta(isoString) {
  if (!isoString) return null;
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "short", day: "numeric", month: "numeric",
    }).format(new Date(isoString));
  } catch {
    return null;
  }
}

export default function ShippingSection({
  districtId,
  wardCode,
  selectedServiceTypeId,
  onSelect,
  shippingFee,
  eta,
  feeLoading,
  error,
}) {
  const hasDistrict = !!districtId;
  const hasWard     = !!wardCode;
  const isReady     = hasDistrict && hasWard;

  const {
    services,
    loading: servicesLoading,
    error:   servicesError,
  } = useShippingServices(districtId);

  // Trạng thái lock — chưa đủ địa chỉ
  const locked = !isReady;

  return (
    <div className={`cc-card cc-ship-card ${locked ? "cc-ship-card--locked" : ""}`}>
      <SectionTitle
        number="3"
        title="Phương thức vận chuyển"
        subtitle={locked ? "Vui lòng điền địa chỉ giao hàng trước" : "Chọn dịch vụ phù hợp"}
      />

      {/* ── Locked overlay hint ── */}
      {locked && (
        <div className="cc-ship-locked-hint">
          <span>
            {!hasDistrict
              ? "Chọn Tỉnh/Thành và Quận/Huyện để xem dịch vụ vận chuyển"
              : "Chọn Phường/Xã để xem dịch vụ vận chuyển"}
          </span>
        </div>
      )}

      {/* ── Nội dung — mờ khi locked ── */}
      <div className={`cc-ship-body ${locked ? "cc-ship-body--dim" : ""}`}
           aria-disabled={locked}
           style={{ pointerEvents: locked ? "none" : "auto" }}
      >
        {/* Đang load danh sách services */}
        {isReady && servicesLoading && (
          <div className="cc-ship-loading">
            <span className="cc-spinner-sm" /> Đang tải dịch vụ vận chuyển…
          </div>
        )}

        {/* Lỗi load services */}
        {isReady && servicesError && (
          <p className="cc-ship-err">Không thể tải dịch vụ: {servicesError}</p>
        )}

        {/* Placeholder cards khi chưa ready hoặc đang load */}
        {(!isReady || servicesLoading) && (
          <div className="cc-ship-list cc-ship-list--placeholder">
            {[0, 1].map((i) => (
              <div key={i} className="cc-ship-option cc-ship-option--placeholder">
                <span className="cc-ship-radio" />
                <span className="cc-ship-info">
                  <span className="cc-ship-placeholder-bar cc-ship-placeholder-bar--name" />
                  <span className="cc-ship-placeholder-bar cc-ship-placeholder-bar--desc" />
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Danh sách services thật */}
        {isReady && !servicesLoading && services.length > 0 && (
          <div className="cc-ship-list">
            {services.map((svc) => {
              const label    = SERVICE_LABEL[svc.typeId] ?? { name: svc.name, desc: null };
              const selected = selectedServiceTypeId === svc.typeId;

              return (
                <button
                  key={svc.id}
                  type="button"
                  className={`cc-ship-option ${selected ? "cc-ship-option--active" : ""}`}
                  onClick={() => onSelect(svc.typeId)}
                >
                  <span className="cc-ship-radio">
                    {selected && <span className="cc-ship-radio-dot" />}
                  </span>

                  <span className="cc-ship-info">
                    <span className="cc-ship-name">{label.name}</span>
                    {label.desc && <span className="cc-ship-desc">{label.desc}</span>}

                    {selected && (
                      <span className="cc-ship-fee-row">
                        {feeLoading ? (
                          <span className="cc-ship-fee-loading">Đang tính phí…</span>
                        ) : shippingFee === 0 ? (
                          <span className="cc-ship-fee cc-ship-fee--free">Miễn phí vận chuyển 🎉</span>
                        ) : shippingFee != null ? (
                          <>
                            <span className="cc-ship-fee">{fmt(shippingFee)}</span>
                            {eta && <span className="cc-ship-eta">· Dự kiến {fmtEta(eta)}</span>}
                          </>
                        ) : null}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Lỗi tính phí */}
        {isReady && error && <p className="cc-ship-err">{error}</p>}
      </div>
    </div>
  );
}

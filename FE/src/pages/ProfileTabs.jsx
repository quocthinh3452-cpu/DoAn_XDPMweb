import { useState, useEffect } from "react";
import { Link }               from "react-router-dom";
import { useUser }            from "../context/UserContext";
import { useOrder }           from "../context/OrderContext";
import { useToast }           from "../context/ToastContext";
import { updateProfile, changePassword } from "../services/profileService";
import { getProvinces, getDistricts, getWards } from "../services/ghnService";
import { formatPrice }        from "../utils/helpers";
import Button                 from "../components/common/Button";

/* ─── Icons ───────────────────────────────────────────────── */
const Icons = {
  eye: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
      <circle cx="8" cy="8" r="2"/>
    </svg>
  ),
  eyeOff: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M5.2 4.2C3.3 5.2 1.8 6.9 1 8c1.1 1.8 3.8 5 7 5 1.2 0 2.3-.4 3.3-1M8 3c3.2 0 5.9 3.2 7 5a13 13 0 0 1-1.6 2.4"/>
    </svg>
  ),
  arrowRight: (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  chevronRight: (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3l5 5-5 5"/>
    </svg>
  ),
  chevronDown: (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6l4 4 4-4"/>
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5L1 14h14L8 1.5z"/>
      <path d="M8 6v4M8 11.5v.5"/>
    </svg>
  ),
  mapPin: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3.5-4.5 8.5-4.5 8.5S3.5 9.5 3.5 6A4.5 4.5 0 0 1 8 1.5z"/>
      <circle cx="8" cy="6" r="1.5"/>
    </svg>
  ),
  phone: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2h3l1.5 3.5-2 1.5A9 9 0 0 0 9 10.5l1.5-2L14 10v3a1 1 0 0 1-1 1A12 12 0 0 1 2 3a1 1 0 0 1 1-1z"/>
    </svg>
  ),
  user: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5.5" r="2.5"/>
      <path d="M2.5 14c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5"/>
    </svg>
  ),
  shoppingBag: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6h20l-2 18H8L6 6z"/>
      <path d="M11 6a5 5 0 0 1 10 0"/>
    </svg>
  ),
  inbox: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h24l-4-12H8L4 20z"/>
      <path d="M4 20v5a1 1 0 0 0 1 1h22a1 1 0 0 0 1-1v-5"/>
      <path d="M11 24h10"/>
    </svg>
  ),
};

/* ─── Status config ───────────────────────────────────────── */
const STATUS_CONFIG = {
  confirmed:      { label: "Đã xác nhận",  badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",          dot: "#60a5fa" },
  pending:        { label: "Chờ xác nhận", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",       dot: "#fb923c" },
  shipping:       { label: "Đang giao",    badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",    dot: "#a78bfa" },
  delivered:      { label: "Đã giao",      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "#34d399" },
  cancelled:      { label: "Đã hủy",       badge: "bg-red-500/10 text-red-400 border-red-500/20",             dot: "#f87171" },
  pending_refund: { label: "Chờ hoàn tiền",badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",   dot: "#fb923c" },
  refunded:       { label: "Đã hoàn tiền", badge: "bg-teal-500/10 text-teal-400 border-teal-500/20",          dot: "#2dd4bf" },
};

/* ─── Password strength ───────────────────────────────────── */
function getStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6)           s++;
  if (pw.length >= 10)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH_LABELS = [null, "Yếu", "Trung bình", "Khá", "Mạnh", "Rất mạnh"];
const STRENGTH_COLORS = [null, "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];
const STRENGTH_BGS    = [null, "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"];

/* ─── Shared styles ───────────────────────────────────────── */
const inputCls = [
  "w-full px-3.5 py-2.5 text-[13.5px]",
  "bg-surface2 border border-border rounded-xl",
  "text-text placeholder:text-muted/30 outline-none",
  "transition-all duration-200",
  "focus:border-accent focus:bg-surface",
  "focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_10%,transparent)]",
].join(" ");

const labelCls = "block text-[11px] font-bold uppercase tracking-[0.07em] text-muted/55";

/* ─── Atoms ───────────────────────────────────────────────── */
function SectionHeader({ title, description }) {
  return (
    <div className="mb-7">
      <h2 className="font-display text-[17px] font-bold tracking-tight">{title}</h2>
      {description && <p className="text-[12.5px] text-muted mt-0.5">{description}</p>}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className={labelCls}>{label}</label>
        {hint && <span className="text-[10.5px] text-muted/40 font-medium">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SaveBar({ loading, onSave, dirty }) {
  return (
    <div
      className="flex items-center justify-between pt-5 mt-6 border-t border-border transition-all duration-300"
      style={{ opacity: dirty ? 1 : 0.3, pointerEvents: dirty ? "auto" : "none" }}
    >
      <p className="text-[12px] text-muted/50">{dirty ? "Chưa lưu thay đổi" : ""}</p>
      <Button variant="primary" size="sm" loading={loading} onClick={onSave}>
        Lưu thay đổi
      </Button>
    </div>
  );
}

function InfoPill({ icon, text }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface2 border border-border text-[12px] text-muted">
      <span className="opacity-50">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function SelectWrap({ children }) {
  return (
    <div className="relative">
      {children}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted/40">
        {Icons.chevronDown}
      </span>
    </div>
  );
}

function PasswordField({ label, hint, value, onChange, show, onToggle, borderClass }) {
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className={[inputCls, "pr-10", borderClass].filter(Boolean).join(" ")}
        />
        <button
          type="button" tabIndex={-1} onClick={onToggle}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 hover:text-muted transition-colors"
        >
          {show ? Icons.eyeOff : Icons.eye}
        </button>
      </div>
    </Field>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* TabInfo                                                    */
/* ═══════════════════════════════════════════════════════════ */
export function TabInfo() {
  const { user, updateUser } = useUser();
  const { success, error }   = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:  user?.name  || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const dirty = form.name  !== (user?.name  || "")
             || form.email !== (user?.email || "")
             || form.phone !== (user?.phone || "");

  const handleSave = async () => {
    setLoading(true);
    try {
      const r = await updateProfile(form);
      updateUser(r.data);
      success("Đã cập nhật thông tin");
    } catch (err) {
      error("Cập nhật thất bại", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader title="Thông tin cá nhân" description="Tên, email liên hệ và số điện thoại của bạn." />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-[3fr_2fr] gap-3">
          <Field label="Họ và tên">
            <input value={form.name} onChange={e => set("name", e.target.value)}
              placeholder="Nguyễn Văn A" className={inputCls} />
          </Field>
          <Field label="Số điện thoại" hint="Tùy chọn">
            <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
              placeholder="0901 234 567" className={inputCls} />
          </Field>
        </div>
        <Field label="Email" hint="Dùng để đăng nhập & nhận hóa đơn">
          <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
            placeholder="you@example.com" className={inputCls} />
        </Field>
        {!dirty && (user?.name || user?.phone) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {user?.name  && <InfoPill icon={Icons.user}  text={user.name} />}
            {user?.phone && <InfoPill icon={Icons.phone} text={user.phone} />}
          </div>
        )}
      </div>
      <SaveBar loading={loading} onSave={handleSave} dirty={dirty} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* TabAddress — GHN dropdown động                            */
/* ═══════════════════════════════════════════════════════════ */
export function TabAddress() {
  const { user, updateUser } = useUser();
  const { success, error }   = useToast();
  const [loading, setLoading] = useState(false);

  // ── GHN data ──
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards,     setWards]     = useState([]);
  const [loadingP,  setLoadingP]  = useState(false);
  const [loadingD,  setLoadingD]  = useState(false);
  const [loadingW,  setLoadingW]  = useState(false);

  // ── Form — dùng ID-based cho GHN ──
  const [form, setForm] = useState({
    address:      user?.address      || "",
    provinceId:   user?.provinceId   || "",
    provinceName: user?.provinceName || "",
    districtId:   user?.districtId   || "",
    districtName: user?.districtName || "",
    wardCode:     user?.wardCode     || "",
    wardName:     user?.wardName     || "",
    note:         user?.note         || "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const dirty =
    form.address      !== (user?.address      || "") ||
    form.provinceId   !== (user?.provinceId   || "") ||
    form.districtId   !== (user?.districtId   || "") ||
    form.wardCode     !== (user?.wardCode     || "") ||
    form.note         !== (user?.note         || "");

  // Load tỉnh khi mount
  useEffect(() => {
    setLoadingP(true);
    getProvinces()
      .then(setProvinces)
      .finally(() => setLoadingP(false));
  }, []);

  // Load quận khi chọn tỉnh
  useEffect(() => {
    if (!form.provinceId) { setDistricts([]); setWards([]); return; }
    setLoadingD(true);
    setDistricts([]); setWards([]);
    getDistricts(form.provinceId)
      .then(setDistricts)
      .finally(() => setLoadingD(false));
  }, [form.provinceId]);

  // Load phường khi chọn quận
  useEffect(() => {
    if (!form.districtId) { setWards([]); return; }
    setLoadingW(true);
    setWards([]);
    getWards(form.districtId)
      .then(setWards)
      .finally(() => setLoadingW(false));
  }, [form.districtId]);

  const handleProvince = (e) => {
    const opt = e.target.options[e.target.selectedIndex];
    set("provinceId",   Number(e.target.value));
    set("provinceName", opt.text);
    set("districtId",   "");
    set("districtName", "");
    set("wardCode",     "");
    set("wardName",     "");
  };

  const handleDistrict = (e) => {
    const opt = e.target.options[e.target.selectedIndex];
    set("districtId",   Number(e.target.value));
    set("districtName", opt.text);
    set("wardCode",     "");
    set("wardName",     "");
  };

  const handleWard = (e) => {
    const opt = e.target.options[e.target.selectedIndex];
    set("wardCode", e.target.value);
    set("wardName", opt.text);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const r = await updateProfile({ ...user, ...form });
      updateUser(r.data);
      success("Đã lưu địa chỉ giao hàng");
    } catch (err) {
      error("Lưu thất bại", err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasPreview = form.address && form.provinceName;
  const previewAddr = [form.address, form.wardName, form.districtName, form.provinceName].filter(Boolean).join(", ");

  return (
    <div>
      <SectionHeader
        title="Địa chỉ giao hàng"
        description="Địa chỉ này sẽ được tự động điền khi thanh toán."
      />

      <div className="flex flex-col gap-4">
        {/* Tỉnh / Quận / Phường */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Tỉnh / Thành phố">
            <SelectWrap>
              <select
                value={form.provinceId ?? ""}
                onChange={handleProvince}
                disabled={loadingP}
                className={`${inputCls} appearance-none pr-9`}
              >
                <option value="">{loadingP ? "Đang tải…" : "Chọn tỉnh/thành…"}</option>
                {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </SelectWrap>
          </Field>

          <Field label="Quận / Huyện">
            <SelectWrap>
              <select
                value={form.districtId ?? ""}
                onChange={handleDistrict}
                disabled={!form.provinceId || loadingD}
                className={`${inputCls} appearance-none pr-9`}
              >
                <option value="">
                  {!form.provinceId ? "Chọn tỉnh trước" : loadingD ? "Đang tải…" : "Chọn quận/huyện…"}
                </option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </SelectWrap>
          </Field>

          <Field label="Phường / Xã">
            <SelectWrap>
              <select
                value={form.wardCode ?? ""}
                onChange={handleWard}
                disabled={!form.districtId || loadingW}
                className={`${inputCls} appearance-none pr-9`}
              >
                <option value="">
                  {!form.districtId ? "Chọn quận trước" : loadingW ? "Đang tải…" : "Chọn phường/xã…"}
                </option>
                {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
              </select>
            </SelectWrap>
          </Field>
        </div>

        {/* Địa chỉ cụ thể */}
        <Field label="Địa chỉ cụ thể">
          <input
            value={form.address}
            onChange={e => set("address", e.target.value)}
            placeholder="Số nhà, tên đường"
            className={inputCls}
          />
        </Field>

        {/* Ghi chú */}
        <Field label="Ghi chú giao hàng" hint="Tùy chọn">
          <input
            value={form.note}
            onChange={e => set("note", e.target.value)}
            placeholder="Gọi trước khi giao, để trước cửa…"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Preview */}
      <div
        className="mt-4 overflow-hidden transition-all duration-300"
        style={{ maxHeight: hasPreview ? "80px" : "0", opacity: hasPreview ? 1 : 0 }}
      >
        <div className="px-4 py-3 bg-accent/5 border border-accent/15 rounded-xl text-[13px] text-text flex items-center gap-3">
          <span className="text-accent/60 shrink-0">{Icons.mapPin}</span>
          <p className="font-medium leading-snug">{previewAddr}</p>
        </div>
      </div>

      <SaveBar loading={loading} onSave={handleSave} dirty={dirty} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* TabPassword                                                */
/* ═══════════════════════════════════════════════════════════ */
export function TabPassword() {
  const { success, error }    = useToast();
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [show, setShow]       = useState({ current: false, new: false, confirm: false });
  const [form, setForm]       = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const set    = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErr(""); };
  const toggle = (k)    => setShow(s => ({ ...s, [k]: !s[k] }));

  const strength = getStrength(form.newPassword);
  const passwordsMatch = form.newPassword && form.confirmPassword
                      && form.newPassword === form.confirmPassword;

  const confirmBorderClass = form.confirmPassword.length > 0
    ? (passwordsMatch ? "border-emerald-500/50" : "border-red-500/30")
    : "";

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) { setErr("Mật khẩu không khớp."); return; }
    if (form.newPassword.length < 6)               { setErr("Tối thiểu 6 ký tự."); return; }
    setLoading(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      success("Đã đổi mật khẩu");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      error("Thất bại", e.message);
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader title="Đổi mật khẩu" description="Dùng tối thiểu 6 ký tự gồm chữ, số và ký tự đặc biệt." />
      <div className="flex flex-col gap-4">
        <PasswordField label="Mật khẩu hiện tại" hint="Bắt buộc"
          value={form.currentPassword} onChange={e => set("currentPassword", e.target.value)}
          show={show.current} onToggle={() => toggle("current")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PasswordField label="Mật khẩu mới"
            value={form.newPassword} onChange={e => set("newPassword", e.target.value)}
            show={show.new} onToggle={() => toggle("new")} />
          <PasswordField label="Xác nhận mật khẩu"
            value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
            show={show.confirm} onToggle={() => toggle("confirm")}
            borderClass={confirmBorderClass} />
        </div>
        {form.newPassword.length > 0 && (
          <div className="space-y-2 pt-0.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= strength ? STRENGTH_BGS[strength] : "bg-border"
                }`} style={{ opacity: i <= strength ? (0.6 + (i / strength) * 0.4) : 1 }} />
              ))}
            </div>
            <p className="text-[12px] font-semibold" style={{ color: STRENGTH_COLORS[strength] }}>
              {STRENGTH_LABELS[strength]}
              {strength <= 2 && form.newPassword.length < 10 && (
                <span className="text-muted/50 font-normal ml-2">· Thêm chữ hoa hoặc số để mạnh hơn</span>
              )}
            </p>
          </div>
        )}
      </div>
      {err && (
        <div className="mt-4 px-3.5 py-3 bg-red-500/8 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-[13px] text-red-400">
          <span className="shrink-0">{Icons.warning}</span>
          <span>{err}</span>
        </div>
      )}
      <SaveBar loading={loading} onSave={handleSave} dirty={!!form.currentPassword} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* TabOrders                                                  */
/* ═══════════════════════════════════════════════════════════ */
function OrderRow({ order }) {
  const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.confirmed;
  return (
    <div className="flex items-center justify-between px-4 py-3.5
                    bg-surface2 border border-border rounded-xl
                    hover:border-accent/25 hover:bg-surface2/80
                    transition-all duration-150 group">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full shrink-0"
          style={{ background: s.dot, boxShadow: `0 0 6px ${s.dot}60` }} />
        <div>
          <p className="text-[13px] font-semibold text-accent font-mono">#{order.id}</p>
          <p className="text-[11.5px] text-muted mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
              month: "short", day: "numeric", year: "numeric",
            })}
            {order.items?.length > 0 && (
              <span className="ml-1.5 text-muted/50">
                · {order.items.length} sản phẩm
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full border ${s.badge}`}>
          {s.label}
        </span>
        <span className="text-[13.5px] font-bold tabular-nums">{formatPrice(order.total)}</span>
        <span className="text-muted/30 group-hover:text-muted/60 transition-colors">{Icons.chevronRight}</span>
      </div>
    </div>
  );
}

export function TabOrders() {
  const { orders, loadOrders } = useOrder();
  const { user }               = useUser();
  const [loaded,  setLoaded]   = useState(false);
  const [loading, setLoading]  = useState(false);

  const load = async () => {
    setLoading(true);
    await loadOrders(user?.id);
    setLoaded(true);
    setLoading(false);
  };

  if (!loaded) return (
    <div>
      <SectionHeader title="Lịch sử đơn hàng" description="5 đơn hàng gần nhất của bạn." />
      <div className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface2 border border-border flex items-center justify-center text-muted/30 mb-1">
          {Icons.inbox}
        </div>
        <div>
          <p className="text-[14px] font-medium">Xem đơn hàng của bạn</p>
          <p className="text-[12.5px] text-muted mt-0.5">Tải lịch sử mua hàng gần đây</p>
        </div>
        <Button variant="secondary" size="sm" loading={loading} onClick={load}>Tải đơn hàng</Button>
      </div>
    </div>
  );

  if (orders.length === 0) return (
    <div>
      <SectionHeader title="Lịch sử đơn hàng" description="5 đơn hàng gần nhất của bạn." />
      <div className="flex flex-col items-center gap-3 py-14 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface2 border border-border flex items-center justify-center text-muted/30 mb-1">
          {Icons.shoppingBag}
        </div>
        <div>
          <p className="text-[14px] font-medium">Chưa có đơn hàng nào</p>
          <p className="text-[13px] text-muted mt-0.5">Hãy tìm sản phẩm bạn yêu thích</p>
        </div>
        <Link to="/products" className="mt-1">
          <Button variant="primary" size="sm">Mua sắm ngay</Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div>
      <SectionHeader title="Lịch sử đơn hàng" description="5 đơn hàng gần nhất của bạn." />
      <div className="flex flex-col gap-2">
        {orders.slice(0, 5).map(order => (
          <OrderRow key={order.id} order={order} />
        ))}
        {orders.length > 5 && (
          <Link to="/orders"
            className="flex items-center justify-center gap-1.5 py-3 mt-1
                       text-[13px] font-medium text-muted hover:text-accent
                       border border-dashed border-border hover:border-accent/30
                       rounded-xl transition-all duration-200">
            Xem tất cả {orders.length} đơn hàng
            <span>{Icons.arrowRight}</span>
          </Link>
        )}
      </div>
    </div>
  );
}

// File: src/admin/pages/AdminProducts.jsx
import { useState, useEffect, useCallback } from "react";
import { adminService } from "../services/adminService";
import { useToast } from "../../context/ToastContext";
import { formatPrice, calcDiscount } from "../../utils/helpers";
import { PageHeader, SearchBar, FilterSelect, AdminTable, Pagination, ConfirmDialog, MetricRow, useDebounce, Spinner } from "../components/ui/AdminUI";

// [MỚI THÊM] Import đồ nghề - Bạn nhớ kiểm tra đường dẫn file này nhé
import TagInput from "../../components/admin/TagInput";
import SpecsInput from "../../components/admin/SpecsInput";

const CAT_OPTIONS = [
  { value: "all", label: "Tất cả danh mục" },
  { value: "dien-thoai", label: "Điện thoại" },
  { value: "laptop", label: "Laptop" },
  { value: "phu-kien", label: "Phụ kiện" },
];

const STOCK_OPTIONS = [
  { value: "all", label: "All Stock" },
  { value: "out", label: "Out of Stock" },
  { value: "low", label: "Low (< 5)" },
  { value: "ok", label: "In Stock" },
];

const EMPTY_FORM = {
  name: "", brand: "", category: "dien-thoai", price: "",
  originalPrice: "", stock: "", description: "",
  imagePreview: null, imageFile: null,
  // [MỚI THÊM]
  colors: [], storage: [], specs: []
};

const inputCls = "w-full px-4 py-3 bg-surface2 border border-border rounded-xl text-text text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(124,111,247,0.12)] transition-all placeholder:text-muted/40 font-medium";

const CAT_STYLE = {
  "dien-thoai": "bg-accent/10 text-[var(--color-accent-hl)] border-accent/20",
  "laptop": "bg-purple-400/10 text-purple-300 border-purple-400/20",
  "phu-kien": "bg-blue-400/10 text-blue-300 border-blue-400/20",
};

function CatBadge({ cat }) {
  const label = CAT_OPTIONS.find((o) => o.value === cat)?.label?.replace("Tất cả danh mục", "") ?? cat;
  return (
    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${CAT_STYLE[cat] ?? "bg-surface3 text-muted border-border"}`}>
      {label}
    </span>
  );
}

function StockBadge({ stock }) {
  if (stock === 0) return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-red/10 text-red border border-red/20">
      <span className="w-1.5 h-1.5 rounded-full bg-red" />Out
    </span>
  );
  if (stock < 5) return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-yellow/10 text-yellow border border-yellow/20">
      <span className="w-1.5 h-1.5 rounded-full bg-yellow" />Low ({stock})
    </span>
  );
  if (stock < 20) return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-400/10 text-blue-300 border border-blue-400/20">
      {stock}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-green/10 text-green border border-green/20">
      <span className="w-1.5 h-1.5 rounded-full bg-green" />✓ {stock}
    </span>
  );
}

function ProductModal({ modal, form, onChange, saving, onSave, onClose }) {
  const set = (k, v) => onChange((f) => ({ ...f, [k]: v }));

  const discountPct = form.price && form.originalPrice && Number(form.originalPrice) > Number(form.price)
    ? Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100)
    : null;

  const FIELDS = [
    { k: "name", label: "Product Name", ph: "iPhone 15 Pro Max", span: 2, req: true },
    { k: "brand", label: "Brand", ph: "Apple", span: 1, req: true },
    { k: "price", label: "Sale Price ($)", ph: "999", type: "number", span: 1, req: true },
    { k: "originalPrice", label: "Original Price ($)", ph: "1099", type: "number", span: 1 },
    { k: "stock", label: "Stock Qty", ph: "20", type: "number", span: 1 },
    { k: "description", label: "Description", ph: "Short description…", span: 2, ta: true },
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[500] flex items-center justify-center p-5"
      style={{ animation: "fadeIn 120ms ease" }} onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-full max-w-[660px] max-h-[92vh] flex flex-col shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
        style={{ animation: "slideUp 200ms cubic-bezier(0.16,1,0.3,1)" }} onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-7 py-5 border-b border-border shrink-0">
          <div>
            <h2 className="font-display text-xl font-extrabold">{modal === "create" ? "Add New Product" : "Edit Product"}</h2>
            <p className="text-xs text-muted mt-0.5 font-medium">
              {modal === "create" ? "Fill in the details below to create a new listing." : "Update product information below."}
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-xl text-muted hover:border-red/40 hover:text-red hover:bg-red/5 transition-all text-sm font-bold">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-7">
          {form.imagePreview && (
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img src={form.imagePreview} alt="preview"
                  className="h-28 w-28 object-cover rounded-2xl border-2 border-border shadow-lg"
                  onError={(e) => { e.target.style.display = "none"; }} />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-[0.5px] text-muted">Product Image</label>
              <input type="file" accept="image/jpeg, image/png, image/webp"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) { set("imageFile", file); set("imagePreview", URL.createObjectURL(file)); }
                }}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
              />
            </div>

            {FIELDS.map(({ k, label, ph, type, span, req, ta }) => (
              <div key={k} className={`flex flex-col gap-2 ${span === 2 ? "col-span-2" : ""}`}>
                <label className="text-xs font-bold uppercase tracking-[0.5px] text-muted">{label}{req && <span className="text-red ml-0.5">*</span>}</label>
                {ta
                  ? <textarea rows={3} value={form[k]} onChange={(e) => set(k, e.target.value)} placeholder={ph} className={`${inputCls} resize-y`} />
                  : <input type={type || "text"} value={form[k]} onChange={(e) => set(k, e.target.value)} placeholder={ph} className={inputCls} />
                }
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-[0.5px] text-muted">Category<span className="text-red ml-0.5">*</span></label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238888a8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 40 }}>
                {CAT_OPTIONS.filter((c) => c.value !== "all").map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* [MỚI THÊM] CHÈN VÀO CUỐI FORM MODAL */}
            <div className="col-span-2 space-y-6 mt-4 pt-4 border-t border-border">
              <TagInput label="Colors" tags={form.colors || []} setTags={(val) => set("colors", val)} />
              <TagInput label="Storage" tags={form.storage || []} setTags={(val) => set("storage", val)} />
              <SpecsInput specs={form.specs || []} setSpecs={(val) => set("specs", val)} />
            </div>

            {discountPct !== null && discountPct > 0 && (
              <div className="col-span-2 flex items-center gap-4 px-5 py-4 bg-green/5 border border-green/20 rounded-xl">
                <span className="text-xs font-display font-bold text-muted">Discount preview</span>
                <span className="font-display font-extrabold text-green text-base">{discountPct}% OFF</span>
                <span className="text-xs text-muted line-through">{formatPrice(form.originalPrice)}</span>
                <span className="text-xs text-muted">→</span>
                <span className="text-sm font-bold text-text">{formatPrice(form.price)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-7 py-5 border-t border-border shrink-0 bg-surface2/50">
          <button onClick={onClose} className="px-5 py-2.5 bg-surface border border-border text-text rounded-xl font-display font-bold text-sm hover:border-border2 transition-all">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-6 py-2.5 bg-accent text-white rounded-xl font-display font-bold text-sm hover:bg-[var(--color-accent-hl)] transition-colors disabled:opacity-40 min-w-[150px] inline-flex items-center justify-center gap-2 shadow-[0_2px_14px_rgba(108,95,255,0.4)]">
            {saving && <Spinner className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : modal === "create" ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const { success, error } = useToast();
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 350);
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getProducts({ search, category, page, sortKey, sortDir, stockFilter });
      setProducts(res.data); setTotal(res.total); setTotalPages(res.totalPages);
    } catch (e) { error("Load failed", e.message); }
    finally { setLoading(false); }
  }, [search, category, page, sortKey, sortDir, stockFilter, error]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, category, stockFilter]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setModal("create"); };

  const openEdit = (p) => {
    // [MỚI THÊM] Xử lý specs từ Object sang Array
    const formattedSpecs = p.specs && typeof p.specs === 'object'
      ? Object.entries(p.specs).map(([key, value]) => ({ key, value }))
      : [];

    setForm({
      name: p.name, brand: p.brand, category: p.category?.slug || "dien-thoai",
      price: p.sale_price || p.regular_price, originalPrice: p.regular_price,
      stock: p.stock_quantity, description: p.description || "",
      imagePreview: p.image || null, imageFile: null,
      // [MỚI THÊM]
      colors: Array.isArray(p.colors) ? p.colors : [],
      storage: Array.isArray(p.storage) ? p.storage : [],
      specs: formattedSpecs
    });
    setEditing(p); setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { error("Validation", "Name and price are required."); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('brand', form.brand || '');
      formData.append('category', form.category);
      formData.append('originalPrice', Number(form.originalPrice) || Number(form.price));
      formData.append('price', Number(form.price));
      formData.append('stock', Number(form.stock) || 0);
      formData.append('description', form.description || '');

      // [MỚI THÊM] Xử lý đóng gói mảng/object thành JSON để gửi qua FormData
      const specsObject = form.specs.reduce((obj, item) => {
        if (item.key.trim()) obj[item.key] = item.value;
        return obj;
      }, {});
      formData.append('colors', JSON.stringify(form.colors));
      formData.append('storage', JSON.stringify(form.storage));
      formData.append('specs', JSON.stringify(specsObject));

      if (form.imageFile) { formData.append('image', form.imageFile); }

      if (modal === "create") {
        await adminService.createProduct(formData);
        success("Created", form.name);
      } else {
        await adminService.updateProduct(editing.id, formData);
        success("Updated", form.name);
      }
      setModal(null); load();
    } catch (e) { error("Save failed", e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await adminService.deleteProduct(confirmDel.id);
      success("Thành công", "Đã xóa sản phẩm");
      setConfirmDel(null); load();
    } catch (e) { error("Lỗi", e.message); }
    finally { setDeleting(false); }
  };

  const filteredProducts = products.filter((product) => {
    const term = searchRaw.toLowerCase();
    const matchSearch = !term || product.name.toLowerCase().includes(term) || (product.sku && product.sku.toLowerCase().includes(term));
    const catSlug = product.category?.slug || product.category || "none";
    const matchCategory = category === "all" || catSlug === category;
    let matchStock = true;
    if (stockFilter === "out") matchStock = Number(product.stock_quantity) === 0;
    if (stockFilter === "low") matchStock = Number(product.stock_quantity) > 0 && Number(product.stock_quantity) < 5;
    if (stockFilter === "ok") matchStock = Number(product.stock_quantity) >= 5;
    return matchSearch && matchCategory && matchStock;
  });

  const outOfStock = filteredProducts.filter((p) => p.stock_quantity === 0).length;
  const lowStock = filteredProducts.filter((p) => p.stock_quantity > 0 && p.stock_quantity < 5).length;
  const avgPrice = filteredProducts.length ? Math.round(filteredProducts.reduce((s, p) => s + (Number(p.sale_price) || Number(p.regular_price)), 0) / filteredProducts.length) : 0;

  const columns = [
    { key: "image", label: "", width: "72px" },
    { key: "name", label: "Product", sortable: true },
    { key: "price", label: "Price", width: "145px", sortable: true },
    { key: "stock", label: "Stock", width: "140px", sortable: true },
    { key: "_actions", label: "Actions", width: "190px" },
  ];

  const renderCell = (col, row) => {
    switch (col.key) {
      case "image": return <img src={row.image || 'https://placehold.co/150x150/f8fafc/a4b1cd?text=No+Image'} alt={row.name} className="w-12 h-12 object-cover rounded-xl border border-border shadow-sm bg-white" />;
      case "name": return (
        <div>
          <p className="text-sm font-semibold">{row.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted font-medium">SKU: {row.sku}</span>
            <span className="text-muted/30">·</span>
            <CatBadge cat={row.category?.slug || row.category || "none"} />
          </div>
        </div>
      );
      case "price": {
        const pPrice = row.sale_price || row.regular_price;
        const oPrice = row.regular_price;
        const disc = oPrice > pPrice ? calcDiscount(oPrice, pPrice) : 0;
        return (
          <div>
            <p className="font-display font-bold text-sm tabular-nums">{formatPrice(pPrice)}</p>
            {disc > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted line-through tabular-nums">{formatPrice(oPrice)}</span>
                <span className="text-[10px] font-bold text-green bg-green/10 px-1.5 py-0.5 rounded-full border border-green/20">-{disc}%</span>
              </div>
            )}
          </div>
        );
      }
      case "stock": return <StockBadge stock={row.stock_quantity} />;
      case "_actions": return (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="px-4 py-2 text-xs font-bold font-display bg-surface border border-border rounded-xl hover:border-accent hover:text-accent hover:bg-accent/5 transition-all shadow-sm">Edit</button>
          <button onClick={() => setConfirmDel(row)} className="px-4 py-2 text-xs font-bold font-display bg-transparent border border-red/25 text-red rounded-xl hover:bg-red/10 hover:border-red/40 transition-all">Delete</button>
        </div>
      );
      default: return row[col.key];
    }
  };

  return (
    <div className="p-6">
      <PageHeader title="Products" subtitle={`${total} total products`} actions={<button onClick={openCreate} className="flex items-center gap-2.5 px-5 py-2.5 bg-accent text-white rounded-xl font-display font-bold text-sm hover:bg-[var(--color-accent-hl)] transition-colors shadow-[0_2px_16px_rgba(108,95,255,0.4)]">+ Add Product</button>} />
      {!loading && <MetricRow items={[["Showing", filteredProducts.length, "products"], ["Avg Price", formatPrice(avgPrice), "per item"], ["Out of Stock", outOfStock, "items", outOfStock > 0 ? "danger" : null], ["Low Stock", lowStock, "< 5 units", lowStock > 0 ? "warn" : null]]} />}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <SearchBar value={searchRaw} onChange={setSearchRaw} placeholder="Search name, brand…" />
        <FilterSelect value={category} onChange={setCategory} options={CAT_OPTIONS} />
        <FilterSelect value={stockFilter} onChange={setStockFilter} options={STOCK_OPTIONS} />
      </div>
      <AdminTable columns={columns} rows={filteredProducts} loading={loading} emptyMsg="No products found matching your filters." onSort={handleSort} sortKey={sortKey} sortDir={sortDir} renderCell={renderCell} />
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      {modal && <ProductModal modal={modal} form={form} onChange={setForm} saving={saving} onSave={handleSave} onClose={() => setModal(null)} />}
      <ConfirmDialog open={!!confirmDel} title="Delete Product" message={`Are you sure you want to delete "${confirmDel?.name}"? This cannot be undone.`} confirmLabel="Delete" loading={deleting} onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
    </div>
  );
}
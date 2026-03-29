import { useState, useEffect, useCallback } from "react";
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from "../services/adminService";
import { useToast } from "../../context/ToastContext";
import { formatPrice, calcDiscount } from "../../utils/helpers";
import { PageHeader, SearchBar, FilterSelect, AdminTable, Pagination } from "../components/ui/AdminUI";

const CAT_OPTIONS = [
  { value:"all",        label:"All Categories" },
  { value:"smartphone", label:"Smartphones"    },
  { value:"laptop",     label:"Laptops"        },
  { value:"tablet",     label:"Tablets"        },
  { value:"audio",      label:"Audio"          },
  { value:"wearable",   label:"Wearables"      },
];
const EMPTY_FORM = { name:"", brand:"", category:"smartphone", price:"", originalPrice:"", stock:"", description:"", image:"" };

const modalInputCls = "w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-text text-sm outline-none focus:border-accent transition-colors placeholder:text-muted/50";

export default function AdminProducts() {
  const { success, error } = useToast();
  const [products,   setProducts]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("all");
  const [page,       setPage]       = useState(1);
  const [modal,      setModal]      = useState(null);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAdminProducts({ search, category, page });
    setProducts(res.data); setTotal(res.total); setTotalPages(res.totalPages);
    setLoading(false);
  }, [search, category, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, category]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setModal("create"); };
  const openEdit   = (p)  => { setForm({ name:p.name, brand:p.brand, category:p.category, price:p.price, originalPrice:p.originalPrice, stock:p.stock, description:p.description, image:p.image }); setEditing(p); setModal("edit"); };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.price) { error("Validation","Name and price are required."); return; }
    setSaving(true);
    try {
      const payload = { ...form, price:Number(form.price), originalPrice:Number(form.originalPrice)||Number(form.price), stock:Number(form.stock)||0 };
      if (modal === "create") { await createProduct(payload); success("Product created", form.name); }
      else                    { await updateProduct(editing.id, payload); success("Product updated", form.name); }
      setModal(null); load();
    } catch (err) { error("Save failed", err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (product) => {
    setDeleting(product.id);
    try { await deleteProduct(product.id); success("Deleted", product.name); load(); }
    catch (err) { error("Delete failed", err.message); }
    finally { setDeleting(null); }
  };

  const columns = [
    { key:"image", label:"", width:"56px", render:(v, row) => <img src={v} alt={row.name} className="w-11 h-11 object-cover rounded-lg border border-border" /> },
    { key:"name",  label:"Product", render:(v, row) => <div><p className="text-sm font-medium">{v}</p><p className="text-xs text-muted">{row.brand} · {row.category}</p></div> },
    { key:"price", label:"Price", width:"120px", render:(v, row) => {
        const disc = calcDiscount(row.originalPrice, v);
        return <div><p className="font-display font-bold text-sm">{formatPrice(v)}</p>{disc > 0 && <p className="text-xs text-muted line-through">{formatPrice(row.originalPrice)}</p>}</div>;
    }},
    { key:"stock", label:"Stock", width:"90px", render:(v) => (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${v === 0 ? "bg-red/10 text-red border-red/20" : v < 5 ? "bg-yellow/10 text-yellow border-yellow/20" : "bg-green/10 text-green border-green/20"}`}>
          {v === 0 ? "Out" : v < 5 ? `Low (${v})` : v}
        </span>
    )},
    { key:"_actions", label:"Actions", width:"160px", render:(_, row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="px-3 py-1.5 text-sm2 font-bold font-display bg-surface border border-border rounded-lg hover:border-accent hover:text-accent transition-all">Edit</button>
          <button onClick={() => handleDelete(row)} disabled={deleting === row.id} className="px-3 py-1.5 text-sm2 font-bold font-display bg-transparent border border-red/30 text-red rounded-lg hover:bg-red/10 transition-all disabled:opacity-40">
            {deleting === row.id ? "…" : "Delete"}
          </button>
        </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Products" subtitle={`${total} total products`}
        actions={<button onClick={openCreate} className="px-4 py-2 bg-accent text-white rounded-lg font-display font-bold text-sm hover:bg-[var(--color-accent-hl)] transition-colors">+ Add Product</button>} />
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Search products…" />
        <FilterSelect value={category} onChange={setCategory} options={CAT_OPTIONS} />
      </div>
      <AdminTable columns={columns} rows={products} loading={loading} emptyMsg="No products found." />
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[500] flex items-center justify-center p-5" onClick={() => setModal(null)}
          style={{ animation:"fadeIn 150ms ease" }}>
          <div className="bg-surface border border-border rounded-2xl w-full max-w-[600px] max-h-[90vh] flex flex-col shadow-[0_8px_48px_rgba(0,0,0,0.6)]"
            style={{ animation:"slideUp 200ms cubic-bezier(0.16,1,0.3,1)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="font-display text-lg font-extrabold">{modal === "create" ? "Add New Product" : "Edit Product"}</h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-muted hover:border-red hover:text-red transition-all">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { k:"name",          label:"Product Name *", ph:"iPhone 15 Pro Max", span:true  },
                  { k:"brand",         label:"Brand *",         ph:"Apple",             span:false },
                  { k:"price",         label:"Sale Price ($) *",ph:"999",  type:"number",span:false },
                  { k:"originalPrice", label:"Original Price",  ph:"1099", type:"number",span:false },
                  { k:"stock",         label:"Stock Qty",       ph:"20",   type:"number",span:false },
                  { k:"image",         label:"Image URL",       ph:"https://…",         span:true  },
                  { k:"description",   label:"Description",     ph:"Short description…",span:true, isTextarea:true },
                ].map(({ k, label, ph, type, span, isTextarea }) => (
                  <div key={k} className={`flex flex-col gap-1.5 ${span ? "col-span-2" : ""}`}>
                    <label className="text-xs font-bold uppercase tracking-[0.5px] text-muted">{label}</label>
                    {k === "category"
                      ? <select value={form.category} onChange={(e) => set("category", e.target.value)} className={`${modalInputCls} appearance-none cursor-pointer`}>{CAT_OPTIONS.filter(c=>c.value!=="all").map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select>
                      : isTextarea
                      ? <textarea rows={3} value={form[k]} onChange={(e) => set(k, e.target.value)} placeholder={ph} className={`${modalInputCls} resize-y`} />
                      : <input type={type||"text"} value={form[k]} onChange={(e) => set(k, e.target.value)} placeholder={ph} className={modalInputCls} />
                    }
                  </div>
                ))}
                {/* Category field in the grid */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-[0.5px] text-muted">Category *</label>
                  <select value={form.category} onChange={(e) => set("category", e.target.value)}
                    className={`${modalInputCls} appearance-none cursor-pointer`}
                    style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238888a8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:32 }}>
                    {CAT_OPTIONS.filter(c=>c.value!=="all").map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-border">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-surface border border-border text-text rounded-lg font-display font-bold text-sm hover:border-accent transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-accent text-white rounded-lg font-display font-bold text-sm hover:bg-[var(--color-accent-hl)] transition-colors disabled:opacity-40">
                {saving ? "Saving…" : modal === "create" ? "Create Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

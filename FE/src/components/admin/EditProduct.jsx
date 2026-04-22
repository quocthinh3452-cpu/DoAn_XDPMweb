// src/pages/admin/EditProduct.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import TagInput from '../../components/admin/TagInput';
import SpecsInput from '../../components/admin/SpecsInput';

export default function EditProduct() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  
  // States cho Form
  const [name, setName] = useState("");
  const [colors, setColors] = useState([]);
  const [storage, setStorage] = useState([]);
  const [specs, setSpecs] = useState([]); // Lưu dạng array: [{key, value}]

  useEffect(() => {
    axios.get(`http://localhost:8000/api/products/${id}`).then(res => {
      const p = res.data.product;
      setName(p.name);
      setColors(p.colors || []);
      setStorage(p.storage || []);
      // Chuyển Object từ Laravel thành Array cho React
      if (p.specs) {
        const specsArray = Object.entries(p.specs).map(([key, value]) => ({ key, value }));
        setSpecs(specsArray);
      }
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    // Chuyển Array ngược lại thành Object để lưu vào JSON MySQL
    const specsObject = specs.reduce((obj, item) => {
      if (item.key) obj[item.key] = item.value;
      return obj;
    }, {});

    try {
      await axios.put(`http://localhost:8000/api/products/${id}`, {
        name,
        colors,
        storage,
        specs: specsObject
      });
      alert("Cập nhật thành công!");
    } catch (err) {
      alert("Lỗi: " + err.response.data.message);
    }
  };

  if (loading) return <div className="p-20 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-surface rounded-[32px] border border-border shadow-2xl">
      <h1 className="text-3xl font-black mb-10">Chỉnh sửa sản phẩm</h1>

      <div className="grid gap-6">
        <div>
          <label className="text-sm font-bold text-muted uppercase">Tên sản phẩm</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface2 border border-border p-4 rounded-xl mt-2 outline-none focus:border-accent" />
        </div>

        <TagInput label="Màu sắc khả dụng" tags={colors} setTags={setColors} />
        
        <TagInput label="Dung lượng khả dụng" tags={storage} setTags={setStorage} />

        <SpecsInput specs={specs} setSpecs={setSpecs} />

        <button 
          onClick={handleSave}
          className="bg-accent text-white py-5 rounded-2xl font-bold text-xl shadow-lg shadow-accent/25 hover:scale-[1.01] active:scale-95 transition-all mt-6"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
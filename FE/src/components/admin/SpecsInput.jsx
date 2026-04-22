// src/components/admin/SpecsInput.jsx
export default function SpecsInput({ specs, setSpecs }) {
  const addRow = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const updateRow = (index, field, val) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };

  const removeRow = (index) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <label className="text-sm font-bold text-muted uppercase">Thông số kỹ thuật</label>
      {specs.map((spec, index) => (
        <div key={index} className="flex gap-3">
          <input
            placeholder="Tên (VD: Chip)"
            value={spec.key}
            onChange={(e) => updateRow(index, "key", e.target.value)}
            className="bg-surface2 border border-border p-3 rounded-xl flex-1 text-sm focus:border-accent outline-none"
          />
          <input
            placeholder="Giá trị (VD: A17 Pro)"
            value={spec.value}
            onChange={(e) => updateRow(index, "value", e.target.value)}
            className="bg-surface2 border border-border p-3 rounded-xl flex-1 text-sm focus:border-accent outline-none"
          />
          <button onClick={() => removeRow(index)} className="text-red-500 px-2">Xóa</button>
        </div>
      ))}
      <button onClick={addRow} type="button" className="w-fit text-accent font-bold text-sm hover:underline">+ Thêm dòng mới</button>
    </div>
  );
}
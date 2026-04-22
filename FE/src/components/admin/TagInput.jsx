// src/components/admin/TagInput.jsx
import { useState } from 'react';

export default function TagInput({ label, tags, setTags, placeholder }) {
  const [input, setInput] = useState("");

  const addTag = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
      }
      setInput("");
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-2 mb-6">
      <label className="text-sm font-bold text-muted uppercase">{label}</label>
      <div className="flex flex-wrap gap-2 p-3 bg-surface2 border border-border rounded-xl focus-within:border-accent transition-all">
        {tags.map((tag, index) => (
          <span key={index} className="flex items-center gap-1 px-3 py-1 bg-accent/20 text-accent rounded-lg text-sm font-medium">
            {tag}
            <button onClick={() => removeTag(index)} className="hover:text-red-500">×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={addTag}
          placeholder={placeholder || "Nhập rồi nhấn Enter..."}
          className="bg-transparent border-none outline-none text-sm flex-1 min-w-[120px]"
        />
      </div>
    </div>
  );
}
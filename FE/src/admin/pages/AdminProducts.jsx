import React, { useEffect, useState } from 'react';
import { getAdminProducts, deleteProduct } from '../services/adminService';
import { Link } from 'react-router-dom';
function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" không? Hành động này không thể hoàn tác!`)) {
      try {
        await deleteProduct(id);
        alert('Xóa sản phẩm thành công!');
        // Cập nhật lại state để sản phẩm biến mất khỏi bảng
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        alert('Xóa thất bại!');
        console.error(error);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse font-medium text-xl">Đang tải danh sách sản phẩm...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Quản lý Sản phẩm</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Thêm sản phẩm
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="p-4 font-semibold">Mã (SKU)</th>
                <th className="p-4 font-semibold">Hình ảnh</th>
                <th className="p-4 font-semibold">Tên sản phẩm</th>
                <th className="p-4 font-semibold">Giá bán</th>
                <th className="p-4 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors items-center">
                  <td className="p-4 text-sm text-gray-500 font-medium">{product.sku}</td>
                  <td className="p-4">
                    <div className="w-12 h-12 bg-white border rounded-lg p-1 flex items-center justify-center">
                      <img
                        src={product.primary_image?.image_url || product.images?.[0]?.image_url || 'https://via.placeholder.com/150'}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-bold text-gray-800">{product.name}</td>
                  <td className="p-4 font-bold text-red-600">{formatPrice(product.sale_price || product.regular_price)}</td>
                  <td className="p-4 text-center flex items-center justify-center gap-2">
                    <Link
                      to={`/admin/products/edit/${product.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors font-medium text-sm"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Chưa có sản phẩm nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;
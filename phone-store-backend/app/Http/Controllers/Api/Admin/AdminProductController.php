<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\ProductImage;

class AdminProductController extends Controller
{
    // Lấy danh sách (Phân trang, Tìm kiếm, Lọc, Sắp xếp)
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Tìm kiếm theo tên hoặc mã SKU
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Lọc theo danh mục
        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category_id', $request->category);
        }

        // Lọc theo tình trạng tồn kho (Khớp với logic FE: out, low, ok)
        if ($request->filled('stockFilter') && $request->stockFilter !== 'all') {
            switch ($request->stockFilter) {
                case 'out':
                    $query->where('stock_quantity', '<=', 0);
                    break;
                case 'low':
                    $query->whereBetween('stock_quantity', [1, 4]);
                    break;
                case 'ok':
                    $query->where('stock_quantity', '>=', 5);
                    break;
            }
        }

        // Sắp xếp
        $sortKey = $request->input('sortKey', 'created_at');
        $sortDir = $request->input('sortDir', 'desc');
        // Map key 'name' từ FE sang cột thực tế trong DB nếu cần
        $query->orderBy($sortKey === 'name' ? 'name' : $sortKey, $sortDir);

        $perPage = $request->input('perPage', 10);
        return response()->json($query->paginate($perPage));
    }

    // Thêm mới sản phẩm
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'category_id' => 'required|exists:categories,id',
            'sku' => 'required|string|unique:products,sku',
            'regular_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:regular_price',
            'stock_quantity' => 'required|integer|min:0',
            'description' => 'nullable|string'
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();
        $product = Product::create($validated);

        return response()->json(['data' => $product], 201);
    }

    // Cập nhật sản phẩm
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:200',
            'category_id' => 'sometimes|exists:categories,id',
            'sku' => 'sometimes|string|unique:products,sku,' . $id,
            'regular_price' => 'sometimes|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:regular_price',
            'stock_quantity' => 'sometimes|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean'
        ]);

        if (isset($validated['name']) && $validated['name'] !== $product->name) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();
        }

        $product->update($validated);

        return response()->json(['data' => $product]);
    }

    // Xóa sản phẩm
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['success' => true]);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // Lấy sản phẩm đang active, kèm theo ảnh chính và thông tin danh mục
        $query = Product::with(['category', 'primaryImage'])
            ->where('is_active', 1);

        // Lọc theo slug danh mục nếu có truyền lên từ Frontend
        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Tìm kiếm theo tên sản phẩm
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->latest()->get();

        return response()->json($products);
    }

    public function show($slug)
    {
        $product = Product::with(['category', 'images', 'attributes'])
            ->where('slug', $slug)
            ->where('is_active', 1)
            ->firstOrFail();

        return response()->json($product);
    }
}
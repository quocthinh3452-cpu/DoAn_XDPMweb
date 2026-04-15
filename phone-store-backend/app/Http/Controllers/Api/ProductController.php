<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // 1. API TRANG CHỦ (Gộp chung để giảm số lần request)
    public function homeData()
    {
        // Danh mục đang hoạt động
        $categories = Category::where('is_active', 1)->get();

        // Sản phẩm Mới về (10 sản phẩm mới nhất, lấy kèm ảnh)
        $newArrivals = Product::with('images')
            ->where('is_active', 1)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Sản phẩm Khuyến mãi (Có sale_price)
        $topDeals = Product::with('images')
            ->where('is_active', 1)
            ->whereNotNull('sale_price')
            ->orderBy('rating_avg', 'desc')
            ->take(8)
            ->get();

        return response()->json([
            'categories' => $categories,
            'new_arrivals' => $newArrivals,
            'top_deals' => $topDeals,
        ]);
    }

    // 2. API DANH SÁCH SẢN PHẨM (Hỗ trợ Lọc, Tìm kiếm, Phân trang)
    public function index(Request $request)
    {
        $query = Product::with('images')->where('is_active', 1);

        // Lọc theo danh mục (category=slug)
        if ($request->has('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Tìm kiếm theo tên (q=iphone)
        if ($request->has('q')) {
            $query->where('name', 'like', '%' . $request->q . '%');
        }

        // Sắp xếp (sort=price_asc / price_desc / newest)
        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'price_asc':
                    $query->orderBy('sale_price', 'asc')->orderBy('regular_price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('sale_price', 'desc')->orderBy('regular_price', 'desc');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
            }
        }

        // Phân trang mặc định 12 SP / trang
        $products = $query->paginate(12);

        return response()->json($products);
    }

    // 3. API CHI TIẾT 1 SẢN PHẨM
    public function show($slug)
    {
        $product = Product::with(['images', 'category'])
            ->where('slug', $slug)
            ->where('is_active', 1)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        // Lấy các sản phẩm cùng danh mục (Sản phẩm liên quan)
        $relatedProducts = Product::with('images')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', 1)
            ->take(4)
            ->get();

        return response()->json([
            'product' => $product,
            'related' => $relatedProducts
        ]);
    }
}
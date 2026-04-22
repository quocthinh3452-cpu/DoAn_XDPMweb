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
        try {
            // 1. Lấy sản phẩm thật từ Database
            $allProducts = \Illuminate\Support\Facades\DB::table('products')
                ->leftJoin('product_images', function ($join) {
                    $join->on('products.id', '=', 'product_images.product_id')
                        ->where('product_images.is_primary', 1);
                })
                ->select(
                    'products.id',
                    'products.name',
                    'products.slug',
                    'products.regular_price',
                    'products.sale_price',
                    'products.stock_quantity',
                    'product_images.image_url as image_url' // Đặt alias để dễ xử lý
                )
                ->orderBy('products.created_at', 'desc')
                ->take(12) // Lấy 12 cái để chia cho các tab
                ->get()
                ->map(function ($item) {
                    // Xử lý link ảnh
                    $item->image = $item->image_url
                        ? (str_starts_with($item->image_url, 'http') ? $item->image_url : url('storage/' . $item->image_url))
                        : 'https://placehold.co/300x300/f8fafc/a4b1cd?text=No+Image';

                    // Ép kiểu số để React tính toán không bị lỗi NaN
                    $item->price = (float) ($item->sale_price ?: $item->regular_price);
                    $item->originalPrice = (float) $item->regular_price;
                    return $item;
                });

            // 2. Phân loại dữ liệu để trả về đúng "Chìa khóa" mà React cần
            return response()->json([
                'featured'    => $allProducts->take(4),
                'newArrivals' => $allProducts->slice(4, 4)->values(),
                'topRated'    => $allProducts->slice(8, 4)->values(),
                'deals'       => $allProducts->where('sale_price', '>', 0)->values(),

                // SỬA LỖI SLIDER: Thay link ảnh thật và kiểm tra tên thuộc tính (image/imageUrl)
                'slides' => [
                    [
                        'id' => 1,
                        'title' => "CÔNG NGHỆ MỚI\n2026",
                        'subtitle' => 'Trải nghiệm iPhone 15 Pro Max Titanium với khung viền siêu nhẹ và hiệu năng bùng nổ.',
                        'tag' => 'MỚI RA MẮT',
                        'badge' => 'Titanium Design',
                        'accentColor' => '#6c63ff', // Màu tím thương hiệu của bạn
                        'bgFrom' => '#0f172a',
                        'bgTo' => '#1e293b',
                        // LINK ẢNH SẠCH (Đã bỏ các tham số gây lỗi &amp;)
                        'image' => 'https://images.unsplash.com/photo-1695048133142-1a20484d256e?auto=format&fit=crop&w=1200&q=80',
                        'cta' => 'Mua ngay',
                        'ctaLink' => '/products/3', // Trỏ thẳng đến ID sản phẩm thật
                        'secondaryCta' => 'Xem chi tiết',
                        'secondaryLink' => '/products/3',
                        'price' => '31.490.000₫',
                        'originalPrice' => '34.990.000₫',
                        'discountPct' => 10,
                        'stock' => 'low_stock',
                        'stockLabel' => 'Chỉ còn vài sản phẩm',
                        'rating' => 4.9,
                        'reviewCount' => 1250
                    ]
                ],

                // SỬA LỖI BRAND: Thêm logo các hãng lớn
                'brands' => [
                    ['id' => 1, 'name' => 'Apple', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'],
                    ['id' => 2, 'name' => 'Samsung', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg'],
                    ['id' => 3, 'name' => 'Sony', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg'],
                    ['id' => 4, 'name' => 'Asus', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg'],
                    ['id' => 5, 'name' => 'Xiaomi', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg'],
                ],

                'whyUs' => [
                    ['id' => 1, 'title' => 'Giao hàng nhanh', 'desc' => 'Miễn phí đơn từ 5tr'],
                    ['id' => 2, 'title' => 'Bảo hành 24/7', 'desc' => 'Lỗi 1 đổi 1 trong 30 ngày']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi Backend: ' . $e->getMessage()], 500);
        }
    }

    // 2. API DANH SÁCH SẢN PHẨM (Hỗ trợ Lọc, Tìm kiếm, Phân trang)
    public function index(Request $request)
    {
        $query = Product::with('images')->where('is_active', 1);

        // Lọc theo danh mục (category=slug)
        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
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
    public function show($id)
    {
        try {
            // 1. Lấy thông tin sản phẩm kèm danh mục
            // Nếu bạn dùng slug thay vì id, hãy đổi find($id) thành where('slug', $id)->first()
            $product = \App\Models\Product::with('category')->find($id);

            if (!$product) {
                return response()->json(['message' => 'Sản phẩm không tồn tại'], 404);
            }

            // 2. Lấy bộ sưu tập ảnh (Gallery)
            $images = \Illuminate\Support\Facades\DB::table('product_images')
                ->where('product_id', $id)
                ->orderBy('is_primary', 'desc')
                ->get()
                ->map(function ($img) {
                    return [
                        'url' => str_starts_with($img->image_url, 'http')
                            ? $img->image_url
                            : url('storage/' . $img->image_url)
                    ];
                });

            return response()->json([
                'product' => $product,
                'images'  => $images
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Dữ liệu lấy từ Form ở trang Admin gửi lên
        $product->colors = $request->input('colors'); // Mảng màu
        $product->storage = $request->input('storage'); // Mảng dung lượng
        $product->specs = $request->input('specs'); // Object thông số

        $product->save();
        return response()->json(['message' => 'Cập nhật thành công!']);
    }
}

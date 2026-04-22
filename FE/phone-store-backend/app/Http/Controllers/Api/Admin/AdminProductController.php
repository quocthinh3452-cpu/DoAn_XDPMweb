<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str; // Dùng để tạo slug tự động

class AdminProductController extends Controller
{
    /**
     * Lấy danh sách sản phẩm (có lọc, tìm kiếm, sắp xếp và phân trang)
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'primaryImage'])
                    ->where('is_active', 1); // CHỈ lấy những sản phẩm đang hoạt động

        // 1. Lọc theo từ khóa tìm kiếm (Tên hoặc SKU)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // 2. Lọc theo danh mục (Frontend gửi lên string như 'smartphone', 'laptop' - giả sử đây là slug)
        if ($request->filled('category') && $request->category !== 'all') {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // 3. Lọc theo trạng thái kho (out, low, ok)
        if ($request->filled('stockFilter') && $request->stockFilter !== 'all') {
            $stock = $request->stockFilter;
            if ($stock === 'out') {
                $query->where('stock_quantity', 0);
            } elseif ($stock === 'low') {
                $query->whereBetween('stock_quantity', [1, 4]);
            } elseif ($stock === 'ok') {
                $query->where('stock_quantity', '>=', 5);
            }
        }

        // 4. Sắp xếp (Frontend gửi sortKey: name, price, stock)
        $sortKey = $request->input('sortKey', 'created_at');
        $sortDir = $request->input('sortDir', 'desc');

        // Map biến frontend thành cột Database
        $sortMap = [
            'name' => 'name',
            'price' => 'regular_price', // Hoặc 'sale_price' tùy logic giá của bạn
            'stock' => 'stock_quantity'
        ];
        $dbSortColumn = $sortMap[$sortKey] ?? 'created_at';

        $query->orderBy($dbSortColumn, $sortDir);

        // 5. Phân trang
        $products = $query->paginate(10);
        // 2. Map dữ liệu để bóc tách URL ảnh ra ngoài cùng, khớp với React (row.image)
        $mappedData = $products->getCollection()->map(function ($product) {
            $item = $product->toArray();
            // Nếu có ảnh chính, lấy url. Nếu không có trả về null.
            $item['image'] = $product->primaryImage ? $product->primaryImage->image_url : null;

            // Xóa object primary_image thừa để API nhẹ hơn
            unset($item['primary_image']);

            return $item;
        });
        // 6. Format lại Response để khớp chính xác với state của React (res.data, res.total, res.totalPages)
        return response()->json([
            'data' => $mappedData,
            'total' => $products->total(),
            'totalPages' => $products->lastPage(),
            'currentPage' => $products->currentPage()
        ]);
    }

    /**
     * Thêm sản phẩm mới
     */
    public function store(Request $request)
    {
        // 1. Validate dữ liệu gửi từ React
        $request->validate([
            'name' => 'required|string|max:200',
            'category' => 'required|string', // React gửi text (vd: 'smartphone')
            'originalPrice' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0|lte:originalPrice',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // URL ảnh từ React
        ]);

        // 2. Tìm category_id từ slug được gửi lên
        $categoryId = null;
        if ($request->category && $request->category !== 'all') {
            // Cần import \App\Models\Category ở đầu file
            $cat = \App\Models\Category::where('slug', $request->category)->first();
            $categoryId = $cat ? $cat->id : null;
        }

        // 3. Map dữ liệu và Tạo Product
        $product = Product::create([
            'category_id' => $categoryId,
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . time(),
            'sku' => 'SKU-' . strtoupper(Str::random(6)), // Tự generate mã SKU
            'regular_price' => $request->originalPrice,
            'sale_price' => $request->price,
            'stock_quantity' => $request->stock,
            'description' => $request->description,
            'is_active' => 1,
        ]);

        // 4. Xử lý lưu ảnh vào bảng product_images
        if ($request->hasFile('image')) {
            // Lưu file vào folder storage/app/public/products
            $path = $request->file('image')->store('products', 'public');
            $imageUrl = url('storage/' . $path); // Tạo URL đầy đủ

            \App\Models\ProductImage::create([
                'product_id' => $product->id,
                'image_url' => $imageUrl,
                'is_primary' => 1
            ]);
        }

        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'product' => $product
        ], 201);
    }

    /**
     * Lấy thông tin 1 sản phẩm để đưa lên form Edit
     */
    public function show($id)
    {
        // Lấy kèm ảnh chính
        $product = Product::with(['category', 'primaryImage'])->find($id);

        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        $data = $product->toArray();
        // Gắn image cho form React
        $data['image'] = $product->primaryImage ? $product->primaryImage->image_url : '';

        return response()->json($data);
    }

    /**
     * Cập nhật sản phẩm
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:200',
            'category' => 'required|string',
            'originalPrice' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0|lte:originalPrice',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Xử lý lại category_id
        $categoryId = $product->category_id;
        if ($request->category && $request->category !== 'all') {
            $cat = \App\Models\Category::where('slug', $request->category)->first();
            $categoryId = $cat ? $cat->id : $categoryId;
        }

        // Tạo mảng dữ liệu update
        $updateData = [
            'category_id' => $categoryId,
            'name' => $request->name,
            'regular_price' => $request->originalPrice,
            'sale_price' => $request->price,
            'stock_quantity' => $request->stock,
            'description' => $request->description,
        ];

        // Nếu đổi tên thì update luôn slug mới
        if ($request->name !== $product->name) {
            $updateData['slug'] = Str::slug($request->name) . '-' . time();
        }

        $product->update($updateData);

        // Xử lý cập nhật ảnh
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $newImageUrl = url('storage/' . $path);

            $productImage = \App\Models\ProductImage::where('product_id', $product->id)->first();
            if ($productImage) {
                // (Tùy chọn) Xóa ảnh cũ trong ổ cứng để tiết kiệm dung lượng
                // $oldPath = str_replace(url('storage/'), '', $productImage->image_url);
                // Storage::disk('public')->delete($oldPath);

                $productImage->update(['image_url' => $newImageUrl]);
            } else {
                \App\Models\ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $newImageUrl,
                    'is_primary' => 1
                ]);
            }
        }

        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công',
            'product' => $product
        ]);
    }
    /**
     * Xóa sản phẩm
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        // Cách 1: Xóa mềm bằng cách đổi is_active thành 0
        // $product->is_active = 0;
        // $product->save(); // QUAN TRỌNG: Phải có lệnh save() này

        // Cách 2: Nếu bạn muốn xóa hẳn khỏi database
        $product->delete(); 

        return response()->json(['message' => 'Xóa thành công']);
    }
}

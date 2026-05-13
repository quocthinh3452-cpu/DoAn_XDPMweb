<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
class AdminProductController extends Controller
{
    // Lấy tất cả sản phẩm
    public function index()
    {
        // Thêm with(['images']) để lấy kèm theo link ảnh của sản phẩm
        $products = Product::with(['images'])->orderBy('created_at', 'desc')->get();
        
        return response()->json($products);
    }

    // Xóa sản phẩm
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Đã xóa sản phẩm thành công!']);
    }

    public function store(Request $request)
    {
        // 1. Validate dữ liệu
        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'regular_price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // Validate file ảnh
            'specifications' => 'nullable|string' // Nhận mảng thông số dạng chuỗi JSON
        ]);

        // 2. Lưu thông tin cơ bản
        $productData = $request->only(['name', 'sku', 'regular_price', 'category_id', 'description']);
        $productData['slug'] = Str::slug($productData['name']) . '-' . time();
        $productData['is_active'] = 1;

        $product = Product::create($productData);

        // 3. Xử lý lưu File Ảnh (Nếu có)
        if ($request->hasFile('image')) {
            // Lưu ảnh vào thư mục storage/app/public/products
            $path = $request->file('image')->store('products', 'public');
            
            // Lưu đường dẫn vào bảng product_images
            $product->images()->create([
                'image_url' => asset('storage/' . $path),
                'is_primary' => 1
            ]);
        }

        // 4. Xử lý lưu Thông số kỹ thuật (Nếu có)
        if ($request->filled('specifications')) {
            // Giải mã chuỗi JSON từ Frontend gửi lên
            $specs = json_decode($request->specifications, true);
            
            if (is_array($specs)) {
                foreach ($specs as $spec) {
                    // Lưu vào bảng product_attributes
                    $product->attributes()->create([
                        'name' => $spec['key'],
                        'value' => $spec['value']
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Thêm sản phẩm thành công!', 
            'product' => $product
        ], 201);
    }
    // Lấy thông tin 1 sản phẩm để đổ vào Form Edit
    public function show($id)
    {
        $product = Product::with(['images', 'attributes'])->findOrFail($id);
        return response()->json($product);
    }

    // Cập nhật sản phẩm
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // 1. Validate dữ liệu (Lưu ý rule unique sku phải bỏ qua ID hiện tại)
        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku,' . $id,
            'regular_price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'specifications' => 'nullable|string'
        ]);

        // 2. Cập nhật thông tin cơ bản
        $product->update([
            'name' => $request->name,
            'sku' => $request->sku,
            'regular_price' => $request->regular_price,
            'category_id' => $request->category_id,
            'description' => $request->description,
        ]);

        // 3. Xử lý Ảnh (Nếu có chọn ảnh mới thì mới update)
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            
            // Xóa ảnh cũ hoặc cập nhật đè lên ảnh primary
            $product->images()->updateOrCreate(
                ['is_primary' => 1],
                ['image_url' => asset('storage/' . $path)]
            );
        }

        // 4. Xử lý Thông số kỹ thuật
        if ($request->has('specifications')) {
            // Xóa sạch thông số cũ của sản phẩm này
            $product->attributes()->delete();
            
            // Thêm lại thông số mới
            $specs = json_decode($request->specifications, true);
            if (is_array($specs)) {
                foreach ($specs as $spec) {
                    $product->attributes()->create([
                        'name' => $spec['key'],
                        'value' => $spec['value']
                    ]);
                }
            }
        }

        return response()->json(['message' => 'Cập nhật sản phẩm thành công!', 'product' => $product]);
    }
}

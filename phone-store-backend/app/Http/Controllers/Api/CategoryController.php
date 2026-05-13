<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str; // Dùng để tự động tạo slug từ tên

class CategoryController extends Controller
{
    // Hàm cho Khách hàng: Lấy danh mục đang hoạt động
    public function index()
    {
        $categories = Category::where('is_active', 1)->get();
        return response()->json($categories);
    }

    // Hàm cho Admin: Lấy TẤT CẢ danh mục (kể cả ẩn)
    public function adminIndex()
    {
        $categories = Category::orderBy('id', 'desc')->get();
        return response()->json($categories);
    }

    // Hàm cho Admin: Thêm danh mục mới
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        // Nếu người dùng không nhập slug, hệ thống tự tạo từ tên (VD: Áo Thun -> ao-thun)
        $slug = $request->slug ? Str::slug($request->slug) : Str::slug($request->name);

        // Kiểm tra xem slug đã tồn tại chưa để tránh lỗi trùng lặp
        $originalSlug = $slug;
        $count = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        $category = Category::create([
            'name' => $request->name,
            'slug' => $slug,
            'parent_id' => $request->parent_id, // Có thể null
            'is_active' => $request->is_active ?? 1 // Mặc định là 1 (Hiện)
        ]);

        return response()->json(['message' => 'Thêm danh mục thành công!', 'category' => $category]);
    }

    // Cập nhật danh mục
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        // Xử lý slug: Nếu đổi tên mà không nhập slug mới, tự tạo lại slug
        $slug = $request->slug ? Str::slug($request->slug) : Str::slug($request->name);
        
        // Kiểm tra tránh trùng slug với các danh mục khác (trừ chính nó)
        if (Category::where('slug', $slug)->where('id', '!=', $id)->exists()) {
            $slug = $slug . '-' . time();
        }

        $category->update([
            'name' => $request->name,
            'slug' => $slug,
            'parent_id' => $request->parent_id,
            'is_active' => $request->is_active
        ]);

        return response()->json(['message' => 'Cập nhật danh mục thành công!', 'category' => $category]);
    }

    // Xóa danh mục
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        
        // (Tùy chọn) Kiểm tra nếu có danh mục con thì báo lỗi không cho xóa
        if (Category::where('parent_id', $id)->exists()) {
            return response()->json(['message' => 'Không thể xóa danh mục này vì có chứa danh mục con!'], 400);
        }

        $category->delete();
        return response()->json(['message' => 'Đã xóa danh mục thành công.']);
    }
}
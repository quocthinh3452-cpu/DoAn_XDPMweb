<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    /**
     * Dành cho Khách hàng: Lấy danh sách banner đang hoạt động để hiển thị Slider
     */
    public function index()
    {
        $banners = Banner::where('is_active', 1)
                         ->orderBy('order', 'asc')
                         ->get();
        
        // Trả về kèm link ảnh đầy đủ nhờ Accessor đã viết trong Model
        return response()->json($banners);
    }

    /**
     * Dành cho Admin: Lấy TẤT CẢ banner để quản lý
     */
    public function adminIndex()
    {
        $banners = Banner::orderBy('order', 'asc')->get();
        return response()->json($banners);
    }

    /**
     * Dành cho Admin: Thêm Banner mới (Xử lý upload ảnh)
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Ràng buộc file ảnh
            'link_url' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            // Lưu ảnh vào thư mục public/storage/banners
            $imagePath = $request->file('image')->store('banners', 'public');
        }

        $banner = Banner::create([
            'title' => $request->title,
            'image_url' => $imagePath,
            'link_url' => $request->link_url,
            'order' => $request->order ?? 0,
            'is_active' => $request->is_active ?? 1,
        ]);

        return response()->json([
            'message' => 'Thêm banner thành công!',
            'banner' => $banner
        ], 201);
    }

    /**
     * Dành cho Admin: Cập nhật Banner (Xử lý thay đổi ảnh)
     */
    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->only(['title', 'link_url', 'order', 'is_active']);

        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu tồn tại
            if ($banner->image_url) {
                Storage::disk('public')->delete($banner->image_url);
            }
            // Lưu ảnh mới
            $data['image_url'] = $request->file('image')->store('banners', 'public');
        }

        $banner->update($data);

        return response()->json([
            'message' => 'Cập nhật banner thành công!',
            'banner' => $banner
        ]);
    }

    /**
     * Dành cho Admin: Xóa Banner (Xóa luôn cả file ảnh trên server)
     */
    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);

        // Xóa file vật lý trong thư mục storage
        if ($banner->image_url) {
            Storage::disk('public')->delete($banner->image_url);
        }

        $banner->delete();

        return response()->json(['message' => 'Đã xóa banner vĩnh viễn!']);
    }
}
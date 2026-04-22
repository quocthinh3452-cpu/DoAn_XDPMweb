<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\ProductImage;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = \App\Models\User::query();

            // 1. Xử lý Tìm kiếm (Search)
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // 2. Xử lý Lọc trạng thái (Status)
            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // 3. TÍNH TOÁN DỮ LIỆU BẰNG SQL (Siêu nhanh, không bị nghẽn)
            $query->withCount('orders') // Tạo ra cột 'orders_count'
                ->withSum('orders', 'total_amount'); // Tạo ra cột 'orders_sum_total_amount'

            // 4. Xử lý Sắp xếp (Sort) dựa theo biến React gửi lên
            $sortKey = $request->input('sortKey', 'joinedAt');
            $sortDir = $request->input('sortDir', 'desc');

            if ($sortKey === 'spent') {
                $query->orderBy('orders_sum_total_amount', $sortDir);
            } elseif ($sortKey === 'orders') {
                $query->orderBy('orders_count', $sortDir);
            } elseif ($sortKey === 'joinedAt') {
                $query->orderBy('created_at', $sortDir);
            } else {
                // Sắp xếp theo tên (A-Z)
                $query->orderBy('name', $sortDir);
            }

            // 5. Phân trang
            $page = $request->input('page', 1);
            $users = $query->paginate(10, ['*'], 'page', $page);

            // 6. "Gọt giũa" dữ liệu (Map) để tên biến khớp 100% với React
            $formattedUsers = $users->map(function ($user) {
                return [
                    'id'       => $user->id,
                    'name'     => $user->name,
                    'email'    => $user->email,
                    'status'   => $user->status, // active hoặc inactive
                    'joinedAt' => $user->created_at,
                    // Lấy số liệu tính toán từ bước 3, mặc định bằng 0 nếu chưa mua gì
                    'orders'   => (int) $user->orders_count,
                    'spent'    => (float) ($user->orders_sum_total_amount ?? 0),
                ];
            });

            // 7. Trả về format chuẩn
            return response()->json([
                'data'       => $formattedUsers,
                'total'      => $users->total(),
                'totalPages' => $users->lastPage()
            ]);
        } catch (\Exception $e) {
            User::error("Lỗi get Users: " . $e->getMessage());
            return response()->json(['error' => 'Lỗi Backend: ' . $e->getMessage()], 500);
        }
    }

    // Hàm thay đổi trạng thái user (Active/Inactive)
    public function toggleStatus($id)
    {
        try {
            $user = \App\Models\User::find($id);

            if (!$user) {
                return response()->json(['error' => 'Không tìm thấy người dùng'], 404);
            }

            // TRƯỜNG HỢP 1: Nếu cột status trong Database của bạn lưu CHỮ ('active', 'inactive')
            $user->status = ($user->status === 'active') ? 'inactive' : 'active';

            // TRƯỜNG HỢP 2: Nếu cột status trong Database của bạn lưu SỐ (1 là active, 0 là inactive)
            // Hãy comment (//) trường hợp 1 lại và bỏ comment dòng dưới này:
            // $user->status = ($user->status == 1) ? 0 : 1;

            $user->save();

            return response()->json([
                'message' => 'Cập nhật trạng thái thành công',
                'status'  => $user->status // Trả về status mới để React biết
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}

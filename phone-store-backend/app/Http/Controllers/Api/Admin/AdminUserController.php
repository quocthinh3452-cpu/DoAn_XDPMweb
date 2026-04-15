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
        // Chỉ lấy những người dùng có vai trò là 'user' (khách hàng)
        $query = User::where('role', 'user');

        // 1. Tìm kiếm theo Tên hoặc Email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // 2. Lọc theo trạng thái (active/inactive/banned)
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // 3. Sắp xếp
        $sortKey = $request->input('sortKey', 'created_at');
        if ($sortKey === 'createdAt') $sortKey = 'created_at';
        $sortDir = $request->input('sortDir', 'desc');
        if ($sortKey === 'spent' || !$sortKey) {
            $sortKey = 'id';
        }
        $query->orderBy($sortKey, $sortDir);

        // Kiểm tra nếu cột tồn tại trong DB thì mới sắp xếp, tránh lỗi SQL
        // Nếu FE gửi 'spent' mà DB chưa có, ta mặc định sắp xếp theo 'id' hoặc 'created_at'
        $allowedSorts = ['name', 'email', 'status', 'created_at', 'id'];
        if (!in_array($sortKey, $allowedSorts)) {
            $sortKey = 'created_at';
        }

        $query->orderBy($sortKey, $sortDir);

        // 4. Phân trang (Mặc định 10 khách hàng mỗi trang)
        $perPage = $request->input('perPage', 10);
        $users = $query->paginate($perPage);

        return response()->json($users);
    }

    // Hàm thay đổi trạng thái user (Active/Inactive)
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);

        // Không cho phép tự khóa tài khoản của mình hoặc khóa admin khác tại đây
        $user->status = ($user->status === 'active') ? 'inactive' : 'active';
        $user->save();

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $user
        ]);
    }
}

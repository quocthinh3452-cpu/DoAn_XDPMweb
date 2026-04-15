<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\ProductImage;

class AdminOrderController extends Controller
{
    // Lấy danh sách đơn hàng
    public function index(Request $request)
    {
        $query = Order::with(['items', 'user']);

        // Tìm kiếm theo Mã đơn, Email, Số điện thoại
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_code', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('shipping_address', 'like', "%{$search}%"); // JSON search cơ bản
            });
        }

        // Lọc theo trạng thái
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Lọc theo khoảng thời gian (dateFrom -> dateTo)
        if ($request->filled('dateFrom')) {
            $query->whereDate('created_at', '>=', Carbon::parse($request->dateFrom));
        }
        if ($request->filled('dateTo')) {
            $query->whereDate('created_at', '<=', Carbon::parse($request->dateTo));
        }

        // Sắp xếp (FE gửi createdAt, DB là created_at)
        $sortKey = $request->input('sortKey', 'created_at');
        if ($sortKey === 'createdAt') $sortKey = 'created_at';
        $sortDir = $request->input('sortDir', 'desc');
        
        $query->orderBy($sortKey, $sortDir);

        $perPage = $request->input('perPage', 10);
        return response()->json($query->paginate($perPage));
    }

    // Cập nhật trạng thái đơn hàng
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled'
        ]);

        $order = Order::findOrFail($id);
        
        // Tránh cập nhật nếu trạng thái không đổi
        if ($order->status !== $request->status) {
            $order->status = $request->status;
            
            // Nếu đánh dấu hoàn thành, tự động update payment_status
            if ($request->status === 'delivered' && $order->payment_method === 'cod') {
                $order->payment_status = 'paid';
            }
            $order->save();

            // Lưu dòng thời gian lịch sử (Timeline)
            $order->statusHistory()->create([
                'status' => $request->status,
                'note' => 'Cập nhật bởi Admin'
            ]);
        }

        return response()->json(['data' => $order]);
    }
}
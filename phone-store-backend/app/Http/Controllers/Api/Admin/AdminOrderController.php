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
        // 1. Khởi tạo query từ Model Order (Rất an toàn, y hệt code cũ của bạn)
        $query = Order::query();

        // 2. Xử lý thanh tìm kiếm và bộ lọc từ React gửi lên
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        // 3. Phân trang thay vì ->get() để có biến 'total' cho dòng "0 total orders"
        $orders = $query->orderBy('created_at', 'desc')->paginate(10);

        // 4. Map dữ liệu (Sửa tên key để khớp với Frontend)
        $formattedOrders = $orders->getCollection()->map(function ($order) {
            // Đếm số món hàng an toàn tuyệt đối
            $itemsCount = \Illuminate\Support\Facades\DB::table('order_items')
                ->where('order_id', $order->id)
                ->count();

            return [
                'id'           => $order->id,
                'customerName' => $order->customer_email, // React đang gọi biến này
                'date'         => $order->created_at->toIso8601String(),
                'itemCount'    => $itemsCount, // Trả về số món đếm được thay vì số 1
                'total'        => (float) $order->total_amount,
                'status'       => $order->status,
            ];
        });

        // 5. Trả về đúng format { data: [...], total: X }
        return response()->json([
            'data'  => $formattedOrders,
            'total' => $orders->total()
        ]);
    }

    // Cập nhật trạng thái đơn hàng
    public function updateStatus(Request $request, $id)
{
    try {
        $order = \App\Models\Order::find($id);

        if (!$order) {
            return response()->json(['error' => 'Không tìm thấy đơn hàng'], 404);
        }

        // Lấy trạng thái mới từ React gửi lên
        $newStatus = $request->input('status');

        // Cập nhật và lưu vào Database
        $order->status = $newStatus;
        $order->save();

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công!',
            'status' => $newStatus
        ]);

    } catch (\Exception $e) {
        return response()->json(['error' => 'Lỗi Backend: ' . $e->getMessage()], 500);
    }
}
    //tra ve danh sach don hang
    public function getOrders(Request $request)
    {
        try {
            $query = Order::table('orders')
                ->leftJoin('order_items', 'orders.id', '=', 'order_items.order_id')
                ->select(
                    'orders.id',
                    'orders.customer_email as customerName', // Lấy email khách hàng
                    'orders.created_at as date',
                    'orders.total_amount as total',
                    'orders.status',
                    Order::raw('COUNT(order_items.id) as itemCount') // Đếm số lượng món trong đơn
                )
                ->groupBy(
                    'orders.id',
                    'orders.customer_email',
                    'orders.created_at',
                    'orders.total_amount',
                    'orders.status'
                );

            // Lấy danh sách (bạn có thể dùng ->get() hoặc ->paginate(10))
            $orders = $query->orderBy('orders.id', 'desc')->get();

            // Trả về JSON với đầy đủ data và đếm tổng số đơn
            return response()->json([
                'data'  => $orders,
                'total' => $orders->count() // Gửi kèm tổng số đơn hàng
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
   public function show($id)
{
    try {
        $order = \App\Models\Order::find($id);

        if (!$order) {
            return response()->json(['error' => 'Không tìm thấy đơn hàng'], 404);
        }

        $items = \Illuminate\Support\Facades\DB::table('order_items')
            ->leftJoin('product_images', function($join) {
                // Join dựa trên product_id và lấy ảnh chính
                $join->on('order_items.product_id', '=', 'product_images.product_id')
                     ->where('product_images.is_primary', '=', 1); 
            })
            ->where('order_items.order_id', $id)
            ->select(
                'order_items.product_name as name',
                'order_items.quantity',
                'order_items.unit_price as price',
                'order_items.total_price',
                'product_images.image_url' // Lấy cột chứa đường dẫn ảnh (ví dụ: products/iphone.jpg)
            )
            ->get();

        return response()->json([
            'order' => $order,
            'items' => $items
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}

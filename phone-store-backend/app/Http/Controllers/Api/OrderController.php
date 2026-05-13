<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        // Lấy lịch sử đơn hàng của user đang đăng nhập
        $orders = Order::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        // Sử dụng Transaction: Nếu lỗi ở bất kỳ bước nào, tự động Rollback (hoàn tác) không lưu rác vào DB
        DB::beginTransaction();
        
        try {
            // 1. Tạo Đơn hàng gốc
            
            $order = Order::create([
                'user_id' => $request->user() ? $request->user()->id : null,
                'order_code' => 'TS' . time() . rand(10, 99),
                'customer_email' => $request->email,
                'customer_phone' => $request->phone,
                'shipping_address' => $request->address . ', ' . $request->district . ', ' . $request->city,
                
                'subtotal' => $request->subtotal,
                'shipping_fee' => 30000, // <--- THÊM DÒNG NÀY: Lưu tiền tạm tính
                'total_amount' => $request->total_amount,
                
                'payment_method' => $request->payment_method,
                'status' => 'pending',
            ]);

            // 2. Lưu từng Sản phẩm trong giỏ vào bảng order_items
            // 2. Lưu từng Sản phẩm trong giỏ vào bảng order_items
            foreach ($request->items as $item) {
                $variationInfo = [];
                if (!empty($item['selected_color'])) $variationInfo[] = $item['selected_color'];
                if (!empty($item['selected_storage'])) $variationInfo[] = $item['selected_storage'];
                
                $variationString = !empty($variationInfo) ? ' (' . implode(', ', $variationInfo) . ')' : '';
                $finalProductName = $item['name'] . $variationString;

                // Tính toán giá an toàn
                $price = (isset($item['sale_price']) && $item['sale_price'] > 0) 
                            ? $item['sale_price'] 
                            : ($item['regular_price'] ?? 0);

                // Lấy số lượng an toàn
                $quantity = $item['quantity'] ?? $item['cart_quantity'] ?? 1;
                //tính tổng tiền của item này
                $totalPrice = $price * $quantity;
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['id'],
                    'product_name' => substr($finalProductName, 0, 255),
                    'unit_price' => (float)$price,
                    'quantity' => (int)$quantity,
                    'total_price' => (float)$totalPrice // <--- THÊM DÒNG NÀY ĐỂ LƯU VÀO DB
                ]);
            }

            DB::commit(); // Xác nhận lưu vĩnh viễn vào Database
            return response()->json(['message' => 'Đặt hàng thành công!', 'order' => $order], 201);

        } catch (\Exception $e) {
            DB::rollBack(); // Xóa bỏ các thay đổi nếu có lỗi
            // Trả về lỗi chi tiết để Frontend dễ debug thay vì lỗi 500 chung chung
            return response()->json(['message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }

    public function show(Request $request, $order_code)
    {
        
        $orderQuery = Order::with('items')->where('order_code', $order_code);
        if ($request->user()) {
            $orderQuery->where('user_id', $request->user()->id);
        }
        $order = $orderQuery->firstOrFail();
        $decodedAddress = json_decode($order->shipping_address);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decodedAddress)) {
            $order->shipping_address = $decodedAddress;
        }

        return response()->json($order);
    }
   
    public function cancel(Request $request, $order_code)
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        // 1. Khởi tạo truy vấn tìm đơn hàng
        $orderQuery = Order::where('order_code', $order_code);

        // 2. Bảo mật an toàn: Chỉ check user_id NẾU có user đang đăng nhập
        // Tránh lỗi 500 Attempt to read property "id" on null
        if ($request->user()) {
            $orderQuery->where('user_id', $request->user()->id);
        }

        $order = $orderQuery->firstOrFail();

        // 3. Chỉ cho phép hủy khi đơn hàng đang ở trạng thái 'pending'
        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Không thể hủy đơn hàng ở trạng thái này.'], 400);
        }

        // 4. Tiến hành hủy
        $order->update([
            'status' => 'cancel_requested',
            'cancel_reason' => $request->reason
        ]);

        return response()->json(['message' => 'Đã hủy đơn hàng thành công.']);
    }
}
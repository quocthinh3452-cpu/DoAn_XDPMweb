<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    // Lấy tất cả đơn hàng
    public function index()
    {
        $orders = Order::orderBy('created_at', 'desc')->get();
        return response()->json($orders);
    }

    // Cập nhật trạng thái đơn hàng
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công!', 
            'order' => $order
        ]);
    }

    // ADMIN: Duyệt yêu cầu hủy
    public function approveCancel($id)
    {
        $order = Order::findOrFail($id);
        if ($order->status !== 'cancel_requested') {
            return response()->json(['message' => 'Đơn hàng không ở trạng thái yêu cầu hủy'], 400);
        }

        $order->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Đã duyệt hủy đơn hàng thành công!']);
    }

    // ADMIN: Từ chối yêu cầu hủy
    public function rejectCancel($id)
    {
        $order = Order::findOrFail($id);
        if ($order->status !== 'cancel_requested') {
            return response()->json(['message' => 'Đơn hàng không ở trạng thái yêu cầu hủy'], 400);
        }

        // Đưa đơn hàng quay lại trạng thái Chờ xác nhận (pending), và xóa lý do hủy đi
        $order->update([
            'status' => 'pending', 
            'cancel_reason' => null
        ]);
        return response()->json(['message' => 'Đã từ chối hủy. Đơn hàng quay lại trạng thái Chờ xác nhận.']);
    }
}
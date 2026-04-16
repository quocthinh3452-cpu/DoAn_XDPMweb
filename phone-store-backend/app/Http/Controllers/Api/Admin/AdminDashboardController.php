<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function getDashboardData()
    {
        // Tính tổng doanh thu (chỉ tính đơn hàng đã giao hoặc thanh toán thành công)
        $totalRevenue = Order::where('status', 'delivered')->sum('total_amount');
        
        // Đếm tổng số đơn hàng
        $totalOrders = Order::count();
        
        // Đếm số đơn hàng đang chờ xử lý
        $pendingOrders = Order::where('status', 'pending')->count();
        
        // Đếm tổng số sản phẩm đang kinh doanh
        $totalProducts = Product::where('is_active', 1)->count();
        
        // Đếm tổng số khách hàng (loại trừ admin)
        $totalCustomers = User::where('role', 'user')->count();

        // Lấy 5 đơn hàng mới nhất
        $recentOrders = Order::with('user:id,name') // Cần setup quan hệ belongsTo trong Model Order
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => [
                'revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'total_products' => $totalProducts,
                'total_customers' => $totalCustomers
            ],
            'recent_orders' => $recentOrders
        ]);
    }
}
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function getDashboardData()
    {
        // 1. Thống kê tổng quan (Cards)
        $stats = [
            'totalRevenue' => Order::where('payment_status', 'paid')->sum('total_amount'),
            'totalOrders' => Order::count(),
            'totalProducts' => Product::count(),
            'totalUsers' => User::where('role', 'user')->count(),
        ];

        // 2. Doanh thu 7 ngày gần nhất (Để vẽ biểu đồ Chart.js)
        $revenueChart = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as total')
            )
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // 3. Đơn hàng gần đây
        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'data' => [
                'stats' => $stats,
                'revenueChart' => $revenueChart,
                'recentOrders' => $recentOrders
            ]
        ]);
    }
}
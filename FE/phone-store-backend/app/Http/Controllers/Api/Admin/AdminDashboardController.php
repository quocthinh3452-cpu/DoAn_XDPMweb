<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function getDashboardData()
{
    try {
        $totalRevenue = DB::table('orders')->where('status', '!=', 'cancelled')->sum('total_amount') ?? 0;
        $totalOrders = DB::table('orders')->count();
        $totalUsers = DB::table('users')->count();
        $totalProducts = DB::table('products')->where('is_active', 1)->count();

        // 1. Stats cho 4 ô StatCard
        $stats = [
            ['id' => 'rev', 'label' => 'Tổng doanh thu', 'value' => (float)$totalRevenue, 'unit' => '$', 'color' => '#7c6ff7'],
            ['id' => 'ord', 'label' => 'Đơn hàng', 'value' => (int)$totalOrders, 'unit' => '', 'color' => '#22c55e'],
            ['id' => 'usr', 'label' => 'Khách hàng', 'value' => (int)$totalUsers, 'unit' => '', 'color' => '#c084fc'],
            ['id' => 'prd', 'label' => 'Sản phẩm', 'value' => (int)$totalProducts, 'unit' => '', 'color' => '#fbbf24']
        ];

        // 2. Overview Chart (Bù dữ liệu cho biểu đồ cột)
        $revenueChart = [
            ['month' => 'Jan', 'revenue' => 5000000,  'orders' => 2],
            ['month' => 'Feb', 'revenue' => 12000000, 'orders' => 5],
            ['month' => 'Mar', 'revenue' => 8000000,  'orders' => 3],
            ['month' => 'Apr', 'revenue' => (float)$totalRevenue, 'orders' => (int)$totalOrders],
        ];

        // 3. By Category (Thêm mảng màu sắc cho biểu đồ tròn)
        $colors = ['#7c6ff7', '#22c55e', '#fbbf24', '#f87171'];
        $rawCategories = DB::table('categories')
            ->join('products', 'categories.id', '=', 'products.category_id')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->select('categories.name', DB::raw('SUM(order_items.total_price) as total_rev'))
            ->groupBy('categories.name')->get();

        $totalSum = $rawCategories->sum('total_rev');
        $categoryStats = $rawCategories->map(function($item, $index) use ($totalSum, $colors) {
            return [
                'name'    => $item->name,
                'revenue' => (float)$item->total_rev,
                'percent' => $totalSum > 0 ? (float)round(($item->total_rev / $totalSum) * 100, 1) : 0,
                'color'   => $colors[$index % count($colors)] // Gán màu cho từng danh mục
            ];
        });

        // 4. Top Products
        $topProducts = DB::table('products')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->leftJoin('product_images', function($join) {
                $join->on('products.id', '=', 'product_images.product_id')->where('product_images.is_primary', 1);
            })
            ->select('products.id', 'products.name', 'product_images.image_url as image', 
                DB::raw('SUM(order_items.quantity) as sold'), DB::raw('SUM(order_items.total_price) as revenue'))
            ->groupBy('products.id', 'products.name', 'product_images.image_url')
            ->orderBy('revenue', 'desc')->take(5)->get();

        // 5. Recent Orders
        $recentOrders = DB::table('orders')
            ->select('id', 'customer_email as customerName', 'status', 'total_amount as total')
            ->orderBy('created_at', 'desc')->take(5)->get();

        return response()->json([
            'stats'         => $stats,
            'recentOrders'  => $recentOrders,
            'revenueChart'  => $revenueChart,
            'categoryStats' => $categoryStats,
            'topProducts'   => $topProducts
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_revenue' => Order::where('status', 'delivered')->sum('total_amount'),
            'total_orders' => Order::count(),
            'total_products' => Product::count(),
            'total_users' => User::where('role', 'user')->count(),
            'recent_orders' => Order::with('items')->latest()->take(5)->get()
        ]);
    }
}
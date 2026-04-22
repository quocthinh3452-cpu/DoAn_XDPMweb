<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminUserController;

// ==========================================
// PUBLIC ROUTES (Ai cũng truy cập được)
// ==========================================
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']); // Nên có thêm route đăng ký

Route::get('/home', [ProductController::class, 'homeData']); 
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);



// ==========================================
// PROTECTED ROUTES (Bắt buộc phải có Token)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    // Thông tin user & Đăng xuất
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // ==========================================
    // ADMIN ROUTES (Bắt buộc Token + Role Admin)
    // ==========================================
    Route::middleware('check.admin')->prefix('admin')->group(function () {
        
        // Thống kê Dashboard
        Route::get('/dashboard', [AdminDashboardController::class, 'getDashboardData']);
        
        // Quản lý Sản phẩm (Gợi ý dùng apiResource cho gọn)
        Route::apiResource('products', AdminProductController::class);
        // apiResource tự động tạo ra: GET /products, POST /products, GET /products/{id}, PUT /products/{id}, DELETE /products/{id}

        // Quản lý Đơn hàng
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::patch('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

        // Quản lý Người dùng
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::patch('/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);

        Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    });
});
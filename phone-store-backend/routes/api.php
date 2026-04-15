<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminUserController;


Route::apiResource('products', ProductController::class);

// Thêm Route Đăng nhập
Route::post('/auth/login', [AuthController::class, 'login']);
//Bắt buộc phải có Token ở header để truy cập các route này
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});

Route::get('/home', [ProductController::class, 'homeData']); 
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);


// Bọc toàn bộ route Admin trong middleware auth:sanctum
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    
    // Thống kê Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'getDashboardData']);

    // Quản lý Sản phẩm
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::put('/products/{id}', [AdminProductController::class, 'update']);
    Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);

    // Quản lý Đơn hàng
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::patch('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::patch('/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);
    
});

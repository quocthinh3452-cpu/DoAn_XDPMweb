<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\BannerController;
use Illuminate\Support\Facades\Artisan;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
Route::get('/banners', [\App\Http\Controllers\Api\BannerController::class, 'index']);

Route::get('/fix-storage', function () {
    Artisan::call('storage:link');
    return "Đã tạo liên kết storage thành công!";
});
// Protected User Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Đặt hàng
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order_code}', [\App\Http\Controllers\Api\OrderController::class, 'show']);
    Route::post('/orders/{order_code}/cancel', [\App\Http\Controllers\Api\OrderController::class, 'cancel']);
    //admin order
    Route::post('/admin/orders/{id}/approve-cancel', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'approveCancel']);
    Route::post('/admin/orders/{id}/reject-cancel', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'rejectCancel']);
    //admin category
    Route::get('/admin/categories', [\App\Http\Controllers\Api\CategoryController::class, 'adminIndex']);
    Route::post('/admin/categories', [\App\Http\Controllers\Api\CategoryController::class, 'store']);
    Route::put('/admin/categories/{id}', [\App\Http\Controllers\Api\CategoryController::class, 'update']);
    Route::delete('/admin/categories/{id}', [\App\Http\Controllers\Api\CategoryController::class, 'destroy']);
    //admin banner
    Route::get('/admin/banners', [App\Http\Controllers\Api\BannerController::class, 'adminIndex']);
    Route::post('/admin/banners', [App\Http\Controllers\Api\BannerController::class, 'store']);
    Route::put('/admin/banners/{id}', [App\Http\Controllers\Api\BannerController::class, 'update']);
    Route::delete('/admin/banners/{id}', [App\Http\Controllers\Api\BannerController::class, 'destroy']);
    // Admin Routes
    Route::middleware('check.admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        Route::apiResource('products', AdminProductController::class);
        Route::apiResource('orders', AdminOrderController::class);

        Route::put('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);

        Route::get('/products', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'index']);
        Route::delete('/products/{id}', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'destroy']);

        Route::post('/products', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'store']);

        Route::get('/products/{id}', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'show']);
        Route::post('/products/{id}', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'update']);

        Route::apiResource('/admin/banners', BannerController::class);
    });
   
});

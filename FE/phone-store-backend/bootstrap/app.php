<?php
// file: bootstrap/app.php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        
        // 1. Tắt CSRF cho toàn bộ đường dẫn API để sửa lỗi 419
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        // 2. Đăng ký file CorsMiddleware bạn đã tạo để cho phép React gọi API
        $middleware->append(\App\Http\Middleware\CorsMiddleware::class);

        // 3. ĐĂNG KÝ BÍ DANH CHO MIDDLEWARE KIỂM TRA QUYỀN ADMIN
        $middleware->alias([
            'check.admin' => \App\Http\Middleware\CheckAdmin::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
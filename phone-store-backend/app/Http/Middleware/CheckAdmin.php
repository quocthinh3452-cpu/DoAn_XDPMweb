<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAdmin
{
    public function handle(Request $request, Closure $next)
    {
        // Kiểm tra xem đã đăng nhập chưa và role có phải là admin không
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền truy cập khu vực này.'], 403);
        }

        return $next($request);
    }
}
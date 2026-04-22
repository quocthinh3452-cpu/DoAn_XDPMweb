<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Đăng ký (Thường chỉ dành cho User thường, Admin có thể tạo từ Seeder hoặc trang quản trị)
   public function register(Request $request)
{
    // 1. Validate (Giữ nguyên)
    $validated = $request->validate([
        'name' => 'required|string|max:150', // DB bạn là varchar(150)
        'email' => 'required|string|email|max:150|unique:users',
        'password' => 'required|string|min:6|confirmed',
    ]);

    // 2. Tạo User với các cột ĐÚNG THEO DATABASE của bạn
    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => Hash::make($validated['password']),
        'role' => 'user',      // Khớp với giá trị mặc định của enum
        'status' => 'active'   // Khớp với giá trị mặc định của enum
    ]);

    // 3. Tạo token
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Đăng ký thành công',
        'access_token' => $token,
        'user' => $user
    ], 201);
}
    // Đăng nhập chung cho cả Admin và User
   public function login(Request $request)
{
    // 1. Kiểm tra dữ liệu đầu vào
    $request->validate([
        'email' => 'required|string|email',
        'password' => 'required|string',
    ]);

    // 2. Tìm user trong Database
    $user = User::where('email', $request->email)->first();

    // 3. Kiểm tra user có tồn tại và mật khẩu có khớp không
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'Email hoặc mật khẩu không chính xác!'
        ], 401);
    }

    // 4. Kiểm tra trạng thái tài khoản (Optional - Dựa vào cột status của bạn)
    if ($user->status !== 'active') {
        return response()->json([
            'message' => 'Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt.'
        ], 403);
    }

    // 5. Tạo Token Sanctum
    $token = $user->createToken('auth_token')->plainTextToken;

    // 6. Trả về đúng cấu trúc React đang chờ
    return response()->json([
        'message' => 'Đăng nhập thành công',
        'access_token' => $token,
        'user' => $user
    ], 200);
}
    // Đăng xuất
   public function logout(Request $request)
{
    // Xóa token hiện tại của user
    $request->user()->currentAccessToken()->delete();

    return response()->json([
        'message' => 'Đăng xuất thành công'
    ], 200);
}
}
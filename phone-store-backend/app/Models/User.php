<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Bước 1: Khai báo các cột được phép thêm/sửa
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Bước 3: Đảm bảo mật khẩu luôn được tự động mã hóa Hash
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed', // Laravel sẽ tự động Hash khi bạn tạo user mới
    ];
}
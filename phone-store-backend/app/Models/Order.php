<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    // Bước 1: Khai báo fillable cho Đơn hàng
    protected $fillable = [
        'order_code',
        'user_id',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'subtotal',
        'shipping_fee',
        'discount_amount',
        'total_amount',
        'status',
        'payment_method',
        'payment_status',
    ];

    // Bước 2: JSON Casting - Tự động biến cột JSON thành mảng PHP khi sử dụng
    protected $casts = [
        'shipping_address' => 'array', 
    ];

    // Mối quan hệ với chi tiết đơn hàng
    public function items()
    {
       return $this->hasMany(OrderItem::class, 'order_id');
    }

    // Mối quan hệ với lịch sử trạng thái (Dòng thời gian đơn hàng)
    public function statusHistory()
    {
        return $this->hasMany(OrderStatusHistory::class,'order_id');
    }
    // Báo cho Laravel biết đơn hàng này thuộc về User nào
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
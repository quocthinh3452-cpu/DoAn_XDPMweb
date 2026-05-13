<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderStatusHistory extends Model
{
    // Chỉ định tên bảng vì tên này dài, Laravel có thể không tự nhận diện đúng số nhiều
    protected $table = 'order_status_histories';

    protected $fillable = ['order_id', 'status', 'note'];

    public function order() {
        return $this->belongsTo(Order::class);
    }
}
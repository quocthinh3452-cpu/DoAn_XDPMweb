<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductAttribute extends Model
{
    use HasFactory;

    // Cho phép thêm dữ liệu hàng loạt vào các cột này
    protected $fillable = ['product_id', 'name', 'value'];

    // Khai báo mối quan hệ: 1 Thông số thuộc về 1 Sản phẩm
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
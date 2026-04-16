<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    // Bước 1: Khai báo đầy đủ các cột theo logic DB chuyên nghiệp đã tạo
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'description',
        'regular_price',
        'sale_price',
        'stock_quantity',
        'rating_avg',
        'is_active',
    ];

    // Thiết lập mối quan hệ với Ảnh sản phẩm
   public function primaryImage() {
        return $this->hasOne(ProductImage::class, 'product_id')->where('is_primary', 1);
    }

    // Thiết lập mối quan hệ với Danh mục
  public function category() {
    return $this->belongsTo(Category::class, 'category_id');
}
}
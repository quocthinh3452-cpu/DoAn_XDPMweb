<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'description',
        'colors',
        'storage',
        'specs',
        'regular_price',
        'sale_price',
        'stock_quantity',
        'rating_avg',
        'is_active',
    ];

    // Ép kiểu dữ liệu tự động cho các cột JSON
    protected $casts = [
        'colors' => 'array',
        'storage' => 'array',
        'specs' => 'array',
        'regular_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Quan hệ với bảng Categories
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Quan hệ với bảng ProductImages
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    // Lấy ảnh chính của sản phẩm
    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', 1);
    }

    // Khai báo mối quan hệ: 1 Sản phẩm có N Nhiều thông số kỹ thuật
    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }
}
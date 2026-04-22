<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    // Bước 1: Khai báo đầy đủ các cột theo logic DB chuyên nghiệp đã tạo
    protected $fillable = [
        'name',
        'slug',
        'description',
        'regular_price',
        'sale_price',
        'stock_quantity',
        'category_id',
        'colors',
        'storage',
        'specs' // Đảm bảo có các dòng này
    ];
       protected $casts = [
        'colors' => 'array',
        'storage' => 'array',
        'specs' => 'array',
    ];
    // Thiết lập mối quan hệ với Ảnh sản phẩm
    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class, 'product_id')->where('is_primary', 1);
    }

    // Thiết lập mối quan hệ với Danh mục
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
    public function images()
    {
        // Thay 'ProductImage::class' bằng tên Model hình ảnh thực tế của bạn (ví dụ: Image::class)
        return $this->hasMany(ProductImage::class); 
    }
}

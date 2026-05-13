<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    // THÊM DÒNG NÀY ĐỂ TẮT TỰ ĐỘNG LƯU THỜI GIAN
    public $timestamps = false; 

    protected $fillable = [
        'parent_id', 
        'name', 
        'slug', 
        'is_active'
    ];
}
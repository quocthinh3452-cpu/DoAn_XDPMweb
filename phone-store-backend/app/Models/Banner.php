<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = ['title', 'image_url', 'link_url', 'order', 'is_active'];

    // QUAN TRỌNG: Phải có dòng này thì React mới nhận được thuộc tính "full_image_url"
    protected $appends = ['full_image_url'];

    public function getFullImageUrlAttribute()
    {
        if ($this->image_url) {
            // Dùng asset để nó tự lấy APP_URL từ .env
            return asset('storage/' . $this->image_url);
        }
        return null;
    }
}
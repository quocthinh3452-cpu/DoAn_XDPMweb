<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Thêm các cột mới dưới dạng JSON để lưu mảng/object
            $table->json('colors')->nullable()->after('description'); 
            $table->json('storage')->nullable()->after('colors');
            $table->json('specs')->nullable()->after('storage');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Xóa các cột này nếu bạn muốn Rollback (hoàn tác)
            $table->dropColumn(['colors', 'storage', 'specs']);
        });
    }
};
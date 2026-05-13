<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('product_attributes', function (Blueprint $table) {
            $table->id();
            // Khóa ngoại liên kết với bảng products (khi xóa sản phẩm sẽ xóa luôn thông số)
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');

            $table->string('name');  // Tên thông số (VD: "RAM", "Màn hình")
            $table->string('value'); // Giá trị (VD: "8GB", "6.7 inch")

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_attributes');
    }
};

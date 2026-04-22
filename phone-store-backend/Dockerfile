# Sử dụng image PHP 8.2 kèm theo máy chủ web Apache
FROM php:8.4-apache

# Cài đặt các gói hệ thống và PHP extensions cần thiết cho Laravel
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Kích hoạt mod_rewrite của Apache (Bắt buộc để chạy được Route trong Laravel)
RUN a2enmod rewrite

# Đổi thư mục gốc của Apache trỏ thẳng vào thư mục /public của Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Đặt thư mục làm việc hiện tại
WORKDIR /var/www/html

# Copy toàn bộ source code vào trong container
COPY . .

# Tải Composer từ image gốc của họ và cài đặt thư viện (Bỏ qua các gói dev)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --optimize-autoloader --no-dev

# Cấp quyền ghi cho Apache vào các thư mục lưu trữ cốt lõi của Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Mở port 80 cho Apache
EXPOSE 80
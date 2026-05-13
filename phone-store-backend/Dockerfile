# =========================
# Giai đoạn 1: Build Stage
# =========================
FROM php:8.4-cli AS build
WORKDIR /app

# Cài đặt các công cụ hệ thống cần thiết
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpng-dev \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt PHP extensions cho Laravel
RUN docker-php-ext-install pdo pdo_mysql gd zip

# Copy Composer từ image chính thức
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy các file cấu hình package
COPY composer.json composer.lock ./

# Cài đặt các thư viện
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy toàn bộ mã nguồn vào image
COPY . .

# =========================
# Giai đoạn 2: Runtime Stage
# =========================
FROM php:8.4-cli
WORKDIR /app

# Cài đặt lại các thư viện hệ thống cần thiết cho runtime
RUN apt-get update && apt-get install -y libpng-dev libzip-dev && rm -rf /var/lib/apt/lists/*
RUN docker-php-ext-install pdo pdo_mysql gd zip

# Copy sản phẩm đã build từ giai đoạn trước qua
COPY --from=build /app /app

# Thiết lập quyền truy cập cho thư mục storage của Laravel
RUN chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data /app

# Cấu hình Port cho Render
ENV PORT=10000
EXPOSE 10000

# Lệnh khởi chạy server Laravel
ENTRYPOINT ["php", "artisan", "serve", "--host=0.0.0.0", "--port=10000"]
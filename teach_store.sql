-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 13, 2026 at 06:50 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `teach_store`
--

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
CREATE TABLE IF NOT EXISTS `banners` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `title`, `image_url`, `link_url`, `order`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 'Siêu giảm giá tai nghe siêu hot', 'banners/BruYiS1bVVJgKXh2n37rxMCaGLUoC0UUMNJnUkIs.jpg', NULL, 0, 1, '2026-05-13 10:40:33', '2026-05-13 10:50:07'),
(3, 'Bàn phím đẹp new 2026', 'banners/URWVoFVbnnFBf422ddIxnZRGVZDdlpgp8exP8GiF.jpg', NULL, 0, 1, '2026-05-13 10:51:16', '2026-05-13 10:51:16');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` int UNSIGNED DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint UNSIGNED NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`),
  KEY `fk_category_parent` (`parent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `is_active`) VALUES
(1, NULL, 'Điện thoại', 'dien-thoai', 1),
(2, NULL, 'Laptop', 'laptop', 1),
(3, NULL, 'Phụ kiện', 'phu-kien', 1),
(4, NULL, 'Tai nghe', 'tai-nghe', 1);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_04_14_145223_create_products_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `customer_email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_address` json NOT NULL,
  `subtotal` decimal(12,2) UNSIGNED NOT NULL,
  `shipping_fee` decimal(12,2) UNSIGNED NOT NULL,
  `discount_amount` decimal(12,2) UNSIGNED NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) UNSIGNED NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled','cancel_requested') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `cancel_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` enum('cod','vietqr','momo','zalopay') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status` enum('unpaid','paid','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_code_unique` (`order_code`),
  KEY `fk_order_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_code`, `user_id`, `customer_email`, `customer_phone`, `shipping_address`, `subtotal`, `shipping_fee`, `discount_amount`, `total_amount`, `status`, `cancel_reason`, `payment_method`, `payment_status`, `created_at`, `updated_at`) VALUES
(11, 'TS177868414286', 5, 'thinh2304@gmail.com', '0333461641', '\"230 tay thanh, quận 3, tp.hcm\"', 66490000.00, 30000.00, 0.00, 66520000.00, 'cancelled', 'tôi muốn cập nhật đơn hàng', 'cod', 'unpaid', '2026-05-13 07:55:42', '2026-05-13 09:07:46');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `storage` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` smallint UNSIGNED NOT NULL,
  `unit_price` decimal(12,2) UNSIGNED NOT NULL,
  `total_price` decimal(12,2) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_item_order` (`order_id`),
  KEY `fk_item_product` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `color`, `storage`, `quantity`, `unit_price`, `total_price`) VALUES
(2, 11, 1, 'iPhone 15 Pro Max', NULL, NULL, 1, 31490000.00, 31490000.00),
(3, 11, 8, 'Iphone 17 pro max', NULL, NULL, 1, 35000000.00, 35000000.00);

-- --------------------------------------------------------

--
-- Table structure for table `order_status_histories`
--

DROP TABLE IF EXISTS `order_status_histories`;
CREATE TABLE IF NOT EXISTS `order_status_histories` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_history_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(2, 'App\\Models\\User', 5, 'auth_token', 'c7cfdab6bf0b4cdd6e13d31458360b171b5e23a8df0821a9680784d9b5d6a77b', '[\"*\"]', NULL, NULL, '2026-04-16 02:29:57', '2026-04-16 02:29:57'),
(3, 'App\\Models\\User', 6, 'auth_token', '92bda8875864f012cef1622b8d86910a150aa3b447ef037f204b3692e05d4d31', '[\"*\"]', NULL, NULL, '2026-04-16 02:35:05', '2026-04-16 02:35:05'),
(4, 'App\\Models\\User', 5, 'auth_token', '270e04ee6928bd9c2ab19e0e21a95b32292141396f411847ea43b760ab9cc532', '[\"*\"]', NULL, NULL, '2026-04-16 02:47:44', '2026-04-16 02:47:44'),
(5, 'App\\Models\\User', 5, 'auth_token', '655299e30ad8f6d7b2bc32083ce5bc2d27c36677be3062e74b29a08e7112ea52', '[\"*\"]', NULL, NULL, '2026-04-16 02:48:17', '2026-04-16 02:48:17'),
(6, 'App\\Models\\User', 5, 'auth_token', '36c6a0028d87a9c70bc99661e8712ad511f82d8b4fdfb1f402ff8aecb146a51b', '[\"*\"]', NULL, NULL, '2026-04-16 02:48:23', '2026-04-16 02:48:23'),
(7, 'App\\Models\\User', 5, 'auth_token', '1e5305b15f2a4da4e6fda2a439bb14931498811a2779f13f842dce5477a2eac0', '[\"*\"]', NULL, NULL, '2026-04-16 02:48:38', '2026-04-16 02:48:38'),
(8, 'App\\Models\\User', 5, 'auth_token', '2ddfcb607a23dcd0d2ac261ace9e826cfd26d8b80153337223263801dc2efff1', '[\"*\"]', NULL, NULL, '2026-04-16 02:48:47', '2026-04-16 02:48:47'),
(9, 'App\\Models\\User', 5, 'auth_token', '1f07307fbda1df26f61065ab0cf33d930ec07d6a0d04cf8b8c451f2604ed4674', '[\"*\"]', NULL, NULL, '2026-04-16 02:49:21', '2026-04-16 02:49:21'),
(10, 'App\\Models\\User', 5, 'auth_token', '5caba42122c141433a24734bf0cfc5440d5f1949e373387c2d50795ff793c643', '[\"*\"]', NULL, NULL, '2026-04-16 02:50:35', '2026-04-16 02:50:35'),
(11, 'App\\Models\\User', 5, 'auth_token', '541cdc1797db1eb4ece176ab45b8014af896a8a70a2e00641857c0a7b2403114', '[\"*\"]', NULL, NULL, '2026-04-16 02:50:47', '2026-04-16 02:50:47'),
(12, 'App\\Models\\User', 5, 'auth_token', '97bb27301f3b10eb91d8ab63ef845923fb724146e4ec68bb80e8314e7f596848', '[\"*\"]', NULL, NULL, '2026-04-16 02:54:37', '2026-04-16 02:54:37'),
(13, 'App\\Models\\User', 5, 'auth_token', 'f333796a76400532e233183e66529c0f02d43b141ca11fe36bc514af3efa0369', '[\"*\"]', NULL, NULL, '2026-04-16 02:54:42', '2026-04-16 02:54:42'),
(14, 'App\\Models\\User', 5, 'auth_token', 'a299dc1a2da19afdc6c834575331b814e6d389aaf9f30bc2bd28f2ca7b2907b8', '[\"*\"]', NULL, NULL, '2026-04-16 02:54:46', '2026-04-16 02:54:46'),
(15, 'App\\Models\\User', 5, 'auth_token', 'd90424079fd625ceab48fd4f9180cbc84f396ca4282345747f97709aae0e714e', '[\"*\"]', NULL, NULL, '2026-04-16 02:55:03', '2026-04-16 02:55:03'),
(21, 'App\\Models\\User', 8, 'auth_token', 'acb3dc7b25dd3f4d90c01faae549b1088652726197b3821f3ae3153097ca0c27', '[\"*\"]', '2026-04-18 02:00:12', NULL, '2026-04-18 01:59:10', '2026-04-18 02:00:12'),
(24, 'App\\Models\\User', 8, 'auth_token', 'aab4380ef815ce9a56b995f37ca011772f64b9f8f808e911ec366cfd976e622a', '[\"*\"]', '2026-05-05 05:35:59', NULL, '2026-05-05 05:35:21', '2026-05-05 05:35:59'),
(25, 'App\\Models\\User', 8, 'auth_token', '4a296be6da5e51b705149b8ed0aed27925d3eceb70e6f25d91884432171c7c1f', '[\"*\"]', NULL, NULL, '2026-05-05 07:05:45', '2026-05-05 07:05:45'),
(27, 'App\\Models\\User', 8, 'auth_token', 'f455f4eb269dc7ed15b21f897524fbc7a5b0c56a858fd14f91e3c34f68f93b4d', '[\"*\"]', NULL, NULL, '2026-05-05 07:31:30', '2026-05-05 07:31:30'),
(28, 'App\\Models\\User', 8, 'auth_token', '1d9ed08184a82fea1b3db2c4a5a0cd4d93a33eaa2bb0a184f84410a0f3198425', '[\"*\"]', NULL, NULL, '2026-05-05 07:31:51', '2026-05-05 07:31:51'),
(29, 'App\\Models\\User', 8, 'auth_token', '9ffb313c667afe61b160bbf5acc7412554cd0afa0db6e807df84eee19aac33cd', '[\"*\"]', NULL, NULL, '2026-05-05 07:33:16', '2026-05-05 07:33:16'),
(30, 'App\\Models\\User', 8, 'auth_token', 'ea195653fe8162e37a32e6340ea4451b11b5a92a49cfedc23563361066bbff66', '[\"*\"]', NULL, NULL, '2026-05-05 07:44:26', '2026-05-05 07:44:26'),
(31, 'App\\Models\\User', 8, 'auth_token', 'c9ac5b9a069cf3af7e19b1181b1265d5f591026b5e24c8c204611a2bb3c4ea37', '[\"*\"]', NULL, NULL, '2026-05-05 07:44:37', '2026-05-05 07:44:37'),
(40, 'App\\Models\\User', 5, 'auth_token', 'ed6edaf860b2248894978755118815ee31ea739d6bf2fa8c2663260188a984da', '[\"*\"]', '2026-05-06 08:17:55', NULL, '2026-05-06 07:44:27', '2026-05-06 08:17:55'),
(48, 'App\\Models\\User', 8, 'auth_token', '0dee37fce0244b006bedfdf6c648cf3ea3910c7987baabe1244175b469f3907a', '[\"*\"]', '2026-05-13 10:51:56', NULL, '2026-05-13 09:00:32', '2026-05-13 10:51:56');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` int UNSIGNED DEFAULT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `colors` json DEFAULT NULL,
  `storage` json DEFAULT NULL,
  `specs` json DEFAULT NULL,
  `regular_price` decimal(12,2) UNSIGNED NOT NULL,
  `sale_price` decimal(12,2) UNSIGNED DEFAULT NULL,
  `stock_quantity` mediumint UNSIGNED NOT NULL DEFAULT '0',
  `rating_avg` decimal(3,2) UNSIGNED NOT NULL DEFAULT '0.00',
  `is_active` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  UNIQUE KEY `products_sku_unique` (`sku`),
  KEY `fk_product_category` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `sku`, `description`, `colors`, `storage`, `specs`, `regular_price`, `sale_price`, `stock_quantity`, `rating_avg`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'iPhone 15 Pro Max', 'iphone-15-pro-max-1776507364', 'IP15PM-256', NULL, '[\"Titan Xanh\", \"Titan Đen\", \"Titan Trắng\"]', '[\"256GB\", \"512GB\", \"1TB\"]', '{\"Ram\": \"8GB\", \"Chip\": \"A17 Pro\", \"Màn hình\": \"6.7 inch, Super Retina XDR\"}', 34990000.00, 31490000.00, 50, 0.00, 1, '2026-04-14 16:53:16', '2026-04-21 13:35:15'),
(2, 1, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'SS-S24U', NULL, NULL, NULL, NULL, 33990000.00, 29990000.00, 30, 0.00, 1, '2026-04-14 16:53:16', '2026-04-14 16:53:16'),
(3, 2, 'MacBook Air M2 13 inch', 'macbook-air-m2-13-inch', 'MAC-M2-13', NULL, NULL, NULL, NULL, 27990000.00, 24990000.00, 14, 0.00, 1, '2026-04-14 16:53:16', '2026-05-05 04:46:48'),
(8, 1, 'Iphone 17 pro max', 'iphone-17-pro-max-1778005589', 'Ip17-2025', NULL, NULL, NULL, NULL, 35000000.00, NULL, 0, 0.00, 1, '2026-05-05 11:26:29', '2026-05-05 11:26:29');

-- --------------------------------------------------------

--
-- Table structure for table `product_attributes`
--

DROP TABLE IF EXISTS `product_attributes`;
CREATE TABLE IF NOT EXISTS `product_attributes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_attributes`
--

INSERT INTO `product_attributes` (`id`, `product_id`, `name`, `value`, `created_at`, `updated_at`) VALUES
(11, 8, 'Ram', '16gb', '2026-05-05 11:53:58', '2026-05-05 11:53:58'),
(12, 8, 'Dung lượng', '256GB, 512GB, 1TB', '2026-05-05 11:53:58', '2026-05-05 11:53:58'),
(13, 8, 'Màu', 'đỏ, xanh, vàng', '2026-05-05 11:53:58', '2026-05-05 11:53:58');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_image_product` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`) VALUES
(1, 1, 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumb-600x600.jpg', 1),
(2, 2, 'https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumb-600x600.jpg', 1),
(3, 3, 'http://localhost:8000/storage/products/WSUvqCrbCplsyJAXTYu6tHsXhfWfriqhduitYGVE.jpg', 1),
(7, 8, 'http://127.0.0.1:8000/storage/products/0PYSXHDLsmC7akgFe2SmfhNOQXk0OZb1EnwYmxvr.jpg', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `status` enum('active','banned','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_phone_unique` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `status`, `created_at`, `updated_at`) VALUES
(2, 'Nguyễn Văn Khách', 'khach1@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0911111111', 'user', 'inactive', '2026-04-14 17:10:17', '2026-04-21 08:52:57'),
(3, 'Lê Thị Mua Hàng', 'muahang@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0922222222', 'user', 'inactive', '2026-04-14 17:10:17', '2026-04-21 08:50:51'),
(4, 'Trần Đã Bị Khóa', 'bikhoa@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0933333333', 'user', 'active', '2026-04-14 17:10:17', '2026-04-21 08:50:46'),
(5, 'Ho Quoc Thinh', 'thinh2304@gmail.com', '$2y$12$rVOKrqiFwHFzgaLUO8RvjOITBOQWGSAGws7spfzDZk/V.quz2yu5a', NULL, 'user', 'active', '2026-04-16 02:29:57', '2026-04-21 08:45:31'),
(8, 'Super Admin', 'admin@techstore.com', '$2y$12$NFutc.45YZYSTDvxwpLqfetriIqpoVpM/ZaRHvy3m8kmaEGwEVzwC', '0987654321', 'admin', 'active', '2026-04-16 03:14:22', '2026-04-21 08:51:12');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE IF NOT EXISTS `wishlists` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlists_user_product_unique` (`user_id`,`product_id`),
  KEY `fk_wishlist_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_status_histories`
--
ALTER TABLE `order_status_histories`
  ADD CONSTRAINT `fk_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD CONSTRAINT `product_attributes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_image_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

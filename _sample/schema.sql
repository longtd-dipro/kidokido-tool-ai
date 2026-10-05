-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
-- Host: localhost    Database: shop
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(191) NOT NULL COMMENT 'Email dang nhap, duy nhat',
  `password_hash` char(60) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL COMMENT 'Ho ten hien thi (it''s shown on header)',
  `role` enum('admin','staff','customer') NOT NULL DEFAULT 'customer',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `birth_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp(3) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=1001 DEFAULT CHARSET=utf8mb4 COMMENT='Tai khoan nguoi dung';

CREATE TABLE `categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int unsigned DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(140) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_slug` (`slug`),
  CONSTRAINT `fk_cat_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int unsigned NOT NULL,
  `sku` varchar(32) NOT NULL COMMENT 'Ma SKU',
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Gia ban (VND)',
  `stock` int NOT NULL DEFAULT '0',
  `tags` set('new','hot','sale') DEFAULT NULL,
  `attrs` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sku` (`sku`),
  KEY `fk_prod_cat` (`category_id`),
  CONSTRAINT `fk_prod_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `chk_stock` CHECK ((`stock` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `code` char(12) NOT NULL,
  `status` enum('pending','paid','shipped','cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Trang thai don',
  `total` decimal(14,2) NOT NULL,
  `note` varchar(500) DEFAULT NULL,
  `placed_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `order_items` (
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `qty` smallint unsigned NOT NULL DEFAULT '1',
  `unit_price` decimal(12,2) NOT NULL,
  PRIMARY KEY (`order_id`,`product_id`),
  CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB;

CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `provider` varchar(30) NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `paid_at` datetime DEFAULT NULL,
  `raw_payload` mediumtext,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB;

CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `actor_id` int unsigned DEFAULT NULL,
  `action` varchar(64) NOT NULL,
  `payload` longtext,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `settings` (
  `k` varchar(64) NOT NULL,
  `v` varchar(1000) NOT NULL DEFAULT '',
  `uuid` binary(16) DEFAULT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB;

DELIMITER ;;
CREATE TRIGGER trg_audit AFTER INSERT ON orders FOR EACH ROW BEGIN
  INSERT INTO audit_logs (action) VALUES ('order');
END ;;
DELIMITER ;

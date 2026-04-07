-- SQL Schema for Shorts Video Management
-- Pratham Genda News Portal

CREATE TABLE IF NOT EXISTS `shorts` (
  `id` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `title` text NOT NULL,
  `description` text,
  `videoUrl` text NOT NULL,
  `image` text,
  `city` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'published',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `publishedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

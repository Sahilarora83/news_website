SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
START TRANSACTION;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS epaper_editions (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  city_region VARCHAR(150) NOT NULL,
  edition_name VARCHAR(150) NOT NULL DEFAULT 'Main',
  issue_date DATE NOT NULL,
  description TEXT DEFAULT NULL,
  cover_image VARCHAR(500) DEFAULT NULL,
  pdf_url VARCHAR(500) DEFAULT NULL,
  page_count INT NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS epaper_pages (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  page_no INT NOT NULL,
  title VARCHAR(180) DEFAULT NULL,
  page_image VARCHAR(500) DEFAULT NULL,
  pdf_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_epaper_page_edition FOREIGN KEY (edition_id) REFERENCES epaper_editions(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_epaper_page (edition_id, page_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS epaper_magazines (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  category VARCHAR(120) NOT NULL DEFAULT 'Magazine',
  issue_date DATE DEFAULT NULL,
  description TEXT DEFAULT NULL,
  cover_image VARCHAR(500) DEFAULT NULL,
  pdf_url VARCHAR(500) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE epaper_editions
  ADD COLUMN IF NOT EXISTS name VARCHAR(150) NOT NULL DEFAULT 'Untitled Edition',
  ADD COLUMN IF NOT EXISTS city_region VARCHAR(150) NOT NULL DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS edition_name VARCHAR(150) NOT NULL DEFAULT 'Main',
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE epaper_pages
  ADD COLUMN IF NOT EXISTS title VARCHAR(180) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE epaper_magazines
  ADD COLUMN IF NOT EXISTS name VARCHAR(150) NOT NULL DEFAULT 'Untitled Magazine',
  ADD COLUMN IF NOT EXISTS category VARCHAR(120) NOT NULL DEFAULT 'Magazine',
  ADD COLUMN IF NOT EXISTS issue_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1;

UPDATE epaper_editions
SET
  name = COALESCE(NULLIF(name, ''), edition_name, 'Untitled Edition'),
  city_region = COALESCE(NULLIF(city_region, ''), edition_name, 'General'),
  edition_name = COALESCE(NULLIF(edition_name, ''), 'Main'),
  sort_order = COALESCE(sort_order, id),
  is_active = COALESCE(is_active, 1);

UPDATE epaper_magazines
SET
  name = COALESCE(NULLIF(name, ''), magazine_name, 'Untitled Magazine'),
  category = COALESCE(NULLIF(category, ''), 'Magazine'),
  sort_order = COALESCE(sort_order, id),
  is_active = COALESCE(is_active, 1);

INSERT INTO epaper_editions
  (name, slug, city_region, edition_name, issue_date, description, cover_image, pdf_url, page_count, sort_order, is_active)
VALUES
  ('Delhi City', 'delhi-city', 'Delhi', 'Main', '2026-04-07', 'Delhi ka mukhya e-paper edition', '/epaper/delhi-cover.jpg', NULL, 2, 1, 1),
  ('Lucknow City', 'lucknow-city', 'Lucknow', 'Main', '2026-04-07', 'Lucknow city edition', '/epaper/lucknow-cover.jpg', NULL, 2, 2, 1),
  ('Agra City', 'agra-city', 'Agra', 'Main', '2026-04-07', 'Agra city edition', '/epaper/agra-cover.jpg', NULL, 1, 3, 1)
ON DUPLICATE KEY UPDATE
  city_region = VALUES(city_region),
  edition_name = VALUES(edition_name),
  issue_date = VALUES(issue_date),
  description = VALUES(description),
  cover_image = VALUES(cover_image),
  pdf_url = VALUES(pdf_url),
  page_count = VALUES(page_count),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active);

INSERT INTO epaper_pages
  (edition_id, page_no, title, page_image, pdf_url)
SELECT id, 1, 'Front Page', '/epaper/delhi-page-1.jpg', NULL
FROM epaper_editions WHERE slug = 'delhi-city'
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  page_image = VALUES(page_image),
  pdf_url = VALUES(pdf_url);

INSERT INTO epaper_pages
  (edition_id, page_no, title, page_image, pdf_url)
SELECT id, 2, 'Page 2', '/epaper/delhi-page-2.jpg', NULL
FROM epaper_editions WHERE slug = 'delhi-city'
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  page_image = VALUES(page_image),
  pdf_url = VALUES(pdf_url);

INSERT INTO epaper_pages
  (edition_id, page_no, title, page_image, pdf_url)
SELECT id, 1, 'Front Page', '/epaper/lucknow-page-1.jpg', NULL
FROM epaper_editions WHERE slug = 'lucknow-city'
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  page_image = VALUES(page_image),
  pdf_url = VALUES(pdf_url);

INSERT INTO epaper_pages
  (edition_id, page_no, title, page_image, pdf_url)
SELECT id, 2, 'Page 2', '/epaper/lucknow-page-2.jpg', NULL
FROM epaper_editions WHERE slug = 'lucknow-city'
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  page_image = VALUES(page_image),
  pdf_url = VALUES(pdf_url);

INSERT INTO epaper_pages
  (edition_id, page_no, title, page_image, pdf_url)
SELECT id, 1, 'Front Page', '/epaper/agra-page-1.jpg', NULL
FROM epaper_editions WHERE slug = 'agra-city'
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  page_image = VALUES(page_image),
  pdf_url = VALUES(pdf_url);

INSERT INTO epaper_magazines
  (name, slug, category, issue_date, description, cover_image, pdf_url, sort_order, is_active)
VALUES
  ('E-Manoranjan', 'emanoranjan', 'Magazine', '2026-04-07', 'Entertainment special magazine', '/epaper/emanoranjan-cover.jpg', NULL, 1, 1),
  ('Udan', 'udan', 'Magazine', '2026-04-07', 'Lifestyle and inspiration magazine', '/epaper/udan-cover.jpg', NULL, 2, 1),
  ('Rupayan', 'rupayan', 'Magazine', '2026-04-07', 'Culture and features magazine', '/epaper/rupayan-cover.jpg', NULL, 3, 1)
ON DUPLICATE KEY UPDATE
  category = VALUES(category),
  issue_date = VALUES(issue_date),
  description = VALUES(description),
  cover_image = VALUES(cover_image),
  pdf_url = VALUES(pdf_url),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active);

COMMIT;

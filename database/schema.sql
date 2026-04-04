SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
START TRANSACTION;
SET NAMES utf8mb4;
SET time_zone = '+05:30';

DROP DATABASE IF EXISTS news_portal_db;
CREATE DATABASE news_portal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE news_portal_db;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  assigned_city_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE states (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE districts (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  state_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  CONSTRAINT fk_district_state FOREIGN KEY (state_id) REFERENCES states(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cities (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  district_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  lat DECIMAL(10, 6) NULL,
  lng DECIMAL(10, 6) NULL,
  CONSTRAINT fk_city_district FOREIGN KEY (district_id) REFERENCES districts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tags (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE slot_definitions (
  slot_key VARCHAR(60) NOT NULL PRIMARY KEY,
  label VARCHAR(120) NOT NULL,
  section_name VARCHAR(120) NOT NULL,
  is_single TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE site_config (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  config_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE trending_topics (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE election_tabs (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cricket_points_table (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  team_name VARCHAR(120) NOT NULL,
  played INT NOT NULL DEFAULT 0,
  won INT NOT NULL DEFAULT 0,
  lost INT NOT NULL DEFAULT 0,
  tied INT NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 0,
  run_rate VARCHAR(20) NOT NULL DEFAULT '0.000',
  badge VARCHAR(20) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE articles (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  slug VARCHAR(150) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  headline_short VARCHAR(255) NULL,
  excerpt TEXT NULL,
  body_json LONGTEXT NOT NULL,
  featured_image TEXT NULL,
  video_url TEXT NULL,
  gallery_json LONGTEXT NULL,
  social_links_json LONGTEXT NULL,
  slot_key VARCHAR(60) NOT NULL,
  category_id INT NULL,
  category_name VARCHAR(120) NULL,
  main_city_id INT NULL,
  city_name VARCHAR(120) NULL,
  banner_text VARCHAR(120) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  is_video TINYINT(1) NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_sticky TINYINT(1) NOT NULL DEFAULT 0,
  show_on_homepage TINYINT(1) NOT NULL DEFAULT 1,
  suggest_in_article TINYINT(1) NOT NULL DEFAULT 1,
  internal_comments TEXT NULL,
  author_name VARCHAR(120) NULL,
  editor_name VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_article_slot FOREIGN KEY (slot_key) REFERENCES slot_definitions(slot_key),
  CONSTRAINT fk_article_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_article_city FOREIGN KEY (main_city_id) REFERENCES cities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE article_tags (
  article_id VARCHAR(100) NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  CONSTRAINT fk_article_tags_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_article_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO states (id, name, slug) VALUES
  (1, 'उत्तर प्रदेश', 'uttar-pradesh'),
  (2, 'दिल्ली', 'delhi'),
  (3, 'बिहार', 'bihar'),
  (4, 'राजस्थान', 'rajasthan');

INSERT INTO districts (id, state_id, name, slug) VALUES
  (1, 1, 'लखनऊ', 'lucknow-district'),
  (2, 2, 'नई दिल्ली', 'new-delhi'),
  (3, 3, 'पटना', 'patna-district'),
  (4, 4, 'जयपुर', 'jaipur-district');

INSERT INTO cities (id, district_id, name, slug, lat, lng) VALUES
  (1, 1, 'लखनऊ', 'lucknow', 26.846700, 80.946200),
  (2, 2, 'दिल्ली', 'delhi-city', 28.613900, 77.209000),
  (3, 3, 'पटना', 'patna', 25.594100, 85.137600),
  (4, 4, 'जयपुर', 'jaipur', 26.912400, 75.787300);

INSERT INTO users (username, email, password, role, assigned_city_id) VALUES
  ('admin', 'admin@prathamgenda.local', 'admin123', 'admin', NULL),
  ('editor', 'editor@prathamgenda.local', 'editor123', 'editor', 1),
  ('reporter', 'reporter@prathamgenda.local', 'reporter123', 'reporter', 3);

INSERT INTO categories (id, name, slug, sort_order) VALUES
  (1, 'देश', 'desh', 1),
  (2, 'राजनीति', 'rajniti', 2),
  (3, 'वर्ल्ड', 'world', 3),
  (4, 'बिजनेस', 'business', 4),
  (5, 'संपादकीय', 'editorial', 5),
  (6, 'क्रिकेट', 'cricket', 6),
  (7, 'उत्तर प्रदेश', 'uttar-pradesh-news', 7),
  (8, 'दिल्ली', 'delhi-news', 8),
  (9, 'बिहार', 'bihar-news', 9),
  (10, 'टेक', 'tech', 10),
  (11, 'मनोरंजन', 'entertainment', 11);

INSERT INTO slot_definitions (slot_key, label, section_name, is_single, sort_order) VALUES
  ('center-hero', 'मुख्य शीर्षक', 'मुख्य समाचार', 1, 1),
  ('latest', 'ताज़ा खबरें', 'ताज़ा खबरें', 0, 2),
  ('center', 'मुख्य समाचार', 'मुख्य समाचार', 0, 3),
  ('breaking', 'ब्रेकिंग न्यूज़', 'ब्रेकिंग न्यूज़', 0, 4),
  ('city', 'खबरें आपके शहर की', 'शहर', 0, 5),
  ('election', 'विधानसभा चुनाव', 'चुनाव', 0, 6),
  ('business', 'बिजनेस', 'बिजनेस', 0, 7),
  ('editorial', 'संपादकीय', 'संपादकीय', 0, 8),
  ('cricket-hero', 'क्रिकेट हेडलाइन', 'क्रिकेट', 1, 9),
  ('cricket-story', 'क्रिकेट स्टोरी', 'क्रिकेट', 0, 10),
  ('shorts', 'शॉर्ट वीडियो', 'शॉर्ट वीडियो', 0, 11),
  ('trio-national', 'राष्ट्रीय न्यूज़', 'मुख्य वर्ग', 0, 12),
  ('trio-politics', 'पॉलिटिक्स', 'मुख्य वर्ग', 0, 13),
  ('trio-world', 'दुनिया', 'मुख्य वर्ग', 0, 14);

INSERT INTO site_config (config_json) VALUES
  ('{
    "trending": true,
    "latest": true,
    "center": true,
    "breaking": true,
    "city": true,
    "election": true,
    "business": true,
    "editorial": true,
    "cricket": true,
    "shorts": true,
    "trio": true,
    "show_article_suggestions": true,
    "show_article_latest_news": true,
    "siteNamePrimary": "प्रथम गेंडा",
    "siteNameSecondary": "NEWS",
    "siteTagline": "सच आईने की तरह...",
    "footerCopyright": "© 2026 प्रथम गेंडा न्यूज़. सर्वाधिकार सुरक्षित.",
    "facebook_url": "",
    "twitter_url": "",
    "whatsapp_number": "",
    "support_email": "",
    "meta_description": "",
    "labels": {
      "latest": "ताज़ा खबरें",
      "center": "मुख्य समाचार",
      "breaking": "ब्रेकिंग न्यूज़",
      "city": "खबरें आपके शहर की",
      "election": "विधानसभा चुनाव",
      "business": "बिजनेस",
      "editorial": "संपादकीय",
      "cricket": "क्रिकेट",
      "shorts": "शॉर्ट वीडियो",
      "trio": "मुख्य वर्ग"
    }
  }');

COMMIT;

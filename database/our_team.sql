CREATE TABLE IF NOT EXISTS our_team (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  role VARCHAR(180) NOT NULL,
  photo VARCHAR(500) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO our_team (name, slug, role, photo, sort_order, is_active)
VALUES
  ('Aarav Sharma', 'aarav-sharma', 'Editor', NULL, 0, 1),
  ('Naina Verma', 'naina-verma', 'Senior Reporter', NULL, 1, 1),
  ('Rohit Singh', 'rohit-singh', 'Photo Journalist', NULL, 2, 1)
ON DUPLICATE KEY UPDATE
  role = VALUES(role),
  photo = VALUES(photo),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active);

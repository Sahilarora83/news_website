USE news_portal_db;

CREATE TABLE IF NOT EXISTS city_follows (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  client_id VARCHAR(120) NOT NULL,
  city_name VARCHAR(120) NOT NULL,
  followed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_city_follows_client_city (client_id, city_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

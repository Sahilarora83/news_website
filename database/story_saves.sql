USE news_portal_db;

CREATE TABLE IF NOT EXISTS story_saves (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  client_id VARCHAR(120) NOT NULL,
  story_id VARCHAR(120) NOT NULL,
  saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_story_saves_client_story (client_id, story_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

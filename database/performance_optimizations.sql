USE news_portal_db;

/*
  Performance-focused indexes for 100k-500k users.
  Apply this after the base schema is created.

  Goals:
  1. Fast save/like/follow lookups per client
  2. Fast recent-first ordering
  3. Faster homepage/article/search reads
*/

SET NAMES utf8mb4;

/*
  User interaction tables
  These power:
  - GET /api/saved-stories?clientId=...
  - GET /api/liked-stories?clientId=...
  - GET /api/followed-cities?clientId=...
*/

ALTER TABLE city_follows
  ADD INDEX idx_city_follows_client_followed (client_id, followed_at DESC),
  ADD INDEX idx_city_follows_city_client (city_name, client_id);

ALTER TABLE story_saves
  ADD INDEX idx_story_saves_client_saved (client_id, saved_at DESC),
  ADD INDEX idx_story_saves_story_client (story_id, client_id);

ALTER TABLE story_likes
  ADD INDEX idx_story_likes_client_liked (client_id, liked_at DESC),
  ADD INDEX idx_story_likes_story_client (story_id, client_id);

/*
  Article read patterns
  These support:
  - homepage latest/breaking/center feeds
  - city-prioritized feeds
  - article suggestion queries
  - recent published content queries
*/

ALTER TABLE articles
  ADD INDEX idx_articles_status_home_published (status, show_on_homepage, published_at DESC),
  ADD INDEX idx_articles_status_slot_published (status, slot_key, published_at DESC),
  ADD INDEX idx_articles_status_city_published (status, main_city_id, published_at DESC),
  ADD INDEX idx_articles_status_category_published (status, category_id, published_at DESC),
  ADD INDEX idx_articles_status_suggest_published (status, suggest_in_article, published_at DESC),
  ADD INDEX idx_articles_status_updated (status, updated_at DESC);

/*
  Taxonomy joins
*/

ALTER TABLE article_tags
  ADD INDEX idx_article_tags_tag_article (tag_id, article_id);

ALTER TABLE cities
  ADD INDEX idx_cities_district_name (district_id, name);

ALTER TABLE districts
  ADD INDEX idx_districts_state_name (state_id, name);

/*
  Optional future scale notes:
  - For 500k+ highly active interaction rows, consider monthly archiving tables
  - For heavy search, move title/body search to FULLTEXT or an external search engine
  - For very hot homepage reads, cache /api/home in Redis or app memory
*/

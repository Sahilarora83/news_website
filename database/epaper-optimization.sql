SET NAMES utf8mb4;

/*
  E-Paper optimization pack
  Run this after database/epaper.sql if you want better read performance
  for admin lists, date filters, city filters, and page lookups.
*/

START TRANSACTION;

ALTER TABLE epaper_editions
  ADD INDEX idx_epaper_editions_sort_date (sort_order, issue_date, id),
  ADD INDEX idx_epaper_editions_city_date (city_region, issue_date),
  ADD INDEX idx_epaper_editions_active_date (is_active, issue_date),
  ADD INDEX idx_epaper_editions_edition_date (edition_name, issue_date);

ALTER TABLE epaper_pages
  ADD INDEX idx_epaper_pages_edition_page (edition_id, page_no),
  ADD INDEX idx_epaper_pages_edition_title (edition_id, title(100));

ALTER TABLE epaper_magazines
  ADD INDEX idx_epaper_magazines_sort_date (sort_order, issue_date, id),
  ADD INDEX idx_epaper_magazines_active_date (is_active, issue_date),
  ADD INDEX idx_epaper_magazines_category_date (category, issue_date);

COMMIT;

ANALYZE TABLE epaper_editions, epaper_pages, epaper_magazines;

/*
  Helpful admin queries

  Latest active editions:
  SELECT id, name, city_region, edition_name, issue_date, page_count
  FROM epaper_editions
  WHERE is_active = 1
  ORDER BY sort_order ASC, issue_date DESC, id DESC;

  Editions by city and date:
  SELECT id, name, slug, city_region, issue_date
  FROM epaper_editions
  WHERE city_region = 'Delhi' AND issue_date = '2026-04-07'
  ORDER BY sort_order ASC, id DESC;

  Pages for one edition:
  SELECT page_no, title, page_image, pdf_url
  FROM epaper_pages
  WHERE edition_id = 1
  ORDER BY page_no ASC;
*/

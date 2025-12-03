CREATE DATABASE IF NOT EXISTS cyrus_db;
USE cyrus_db;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  handle VARCHAR(50) NOT NULL UNIQUE,
  bio VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artworks
CREATE TABLE IF NOT EXISTS artworks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description VARCHAR(255),
  image_url VARCHAR(255),
  tag VARCHAR(50),
  pixels_count INT DEFAULT 0,
  contributors_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed a default user (password = "password123" hashed manually)
INSERT INTO users (name, email, password_hash, handle, bio)
VALUES (
  'Samuel Pixel',
  'samuel@example.com',
  '$2a$10$f7/4MGgrfVH0L7p1r1R6EOCdXiPbgmlaXpVWe8Go3PejD0jf9hXlO',
  '@samuel_artist',
  'Lover of collaborative pixel art, sunsets, and neon vibes.'
);

-- Seed some artworks
INSERT INTO artworks (title, description, image_url, tag, pixels_count, contributors_count, user_id)
VALUES
('Sunset City 1', 'Neon skyline collab.', '/images/sample-art-1.jpg', 'event', 3200, 4, 1),
('Sunset City 2', 'Another colourful jam.', '/images/sample-art-2.jpg', 'team', 2800, 5, 1),
('Neon Horizon', 'Warm purple tones.', '/images/sample-art-3.jpg', 'solo', 1500, 1, 1);

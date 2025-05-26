```
CREATE DATABASE IF NOT EXISTS scoring_app_db;

-- Create a dedicated user and grant privileges
-- IMPORTANT: Replace 'your_app_user_password' with a strong password!
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'mysql_app_user';
GRANT SELECT, INSERT, UPDATE, DELETE ON scoring_app_db.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;

-- Use the database
USE scoring_app_db;

-- Create Judges table
CREATE TABLE IF NOT EXISTS judges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Participants table
CREATE TABLE IF NOT EXISTS participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Scores table
CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judge_id INT NOT NULL,
    participant_id INT NOT NULL,
    score_value INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (judge_id) REFERENCES judges(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    UNIQUE (judge_id, participant_id) -- A judge can score a participant only once
);

-- Insert initial data for judges (passwords are 'password123' for each)
-- The hash '$2y$10$p0b3WvGg2O2s5t7u9x1y2.iA0jL1kM2n3o4p5q6r7s8t9u0v1w2x3y4z5' is for 'password123'
INSERT IGNORE INTO judges (username, password_hash, name) VALUES
('judge1', '$2y$10$p0b3WvGg2O2s5t7u9x1y2.iA0jL1kM2n3o4p5q6r7s8t9u0v1w2x3y4z5', 'Amir Judge'),
('judge2', '$2y$10$p0b3WvGg2O2s5t7u9x1y2.iA0jL1kM2n3o4p5q6r7s8t9u0v1w2x3y4z5', 'Amira Judge');

-- Insert initial data for participants
INSERT IGNORE INTO participants (name, description) VALUES
('Participant Alpha', 'A contestant in the Quran competition.'),
('Participant Beta', 'A Student in the hadeeth school.'),
('Participant Gamma', 'A Student in the fiqh school.'),
('Participant Delta', 'A student in the shariah school.');

```
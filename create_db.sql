# Create database script for Berties books

# Create the database
CREATE DATABASE IF NOT EXISTS berties_books;
USE berties_books;

# Create the tables
CREATE TABLE IF NOT EXISTS books (id INT AUTO_INCREMENT,name VARCHAR(50),price DECIMAL(5, 2) unsigned,PRIMARY KEY(id));
CREATE TABLE IF NOT EXISTS userData (id INT AUTO_INCREMENT, username VARCHAR(100), first_name VARCHAR(50), last_name VARCHAR(50), email VARCHAR(255), hashedPassword VARCHAR(255), PRIMARY KEY(id));
CREATE TABLE IF NOT EXISTS loginAttempts (id INT AUTO_INCREMENT, username VARCHAR(255), attemptTime DATETIME DEFAULT CURRENT_TIMESTAMP, success BOOLEAN, reason VARCHAR(255), PRIMARY KEY(id));

# Create the application user
CREATE USER IF NOT EXISTS 'berties_books_app'@'localhost' IDENTIFIED BY 'qwertyuiop';
GRANT ALL PRIVILEGES ON myBookshop.* TO 'berties_books_app'@'localhost';
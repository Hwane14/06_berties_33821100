# Create database script for Berties books

# Create the database
CREATE DATABASE IF NOT EXISTS myBookshop;
USE myBookshop;

# Create the tables
CREATE TABLE IF NOT EXISTS books (id INT AUTO_INCREMENT,name VARCHAR(50),price DECIMAL(5, 2) unsigned,PRIMARY KEY(id));

# Create the application user
CREATE USER IF NOT EXISTS 'berties_books_app'@'localhost' IDENTIFIED BY 'qwertyuiop';
GRANT ALL PRIVILEGES ON myBookshop.* TO 'berties_books_app'@'localhost';
# Insert data into the tables

USE berties_books;

INSERT INTO books (name, price)VALUES('database book', 40.25),('Node.js book', 25.00), ('Express book', 31.99);
INSERT INTO userData (username, first_name, last_name, email, hashedPassword)
VALUES ('gold', 'Gold', 'Marker', 'gold@example.com', '$2b$10$cjOcn/eZHnRjAkmgD/fjf.tfim8vIZ5CrZ4hTP.UVcRocSksJ6KEG');
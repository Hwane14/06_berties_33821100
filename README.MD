# Bertie's Books

**Bertie's Books** is a dynamic Node.js web application for managing a bookshop inventory. Users can browse available books, add new entries, register, and search the catalog using exact or partial matches. It demonstrates Express routing, EJS templating, and MySQL integration.

---

## Technologies Used

- **Node.js** with **Express.js** — server-side framework
- **EJS** — templating engine for dynamic HTML
- **MySQL** — relational database for storing book data
- **CSS** — custom styling via `main.css`

---

## Available Routes

| Route                   | Description                            |
|------------------------|----------------------------------------|
| `/`                    | Homepage with navigation               |
| `/about`               | About the shop                         |
| `/search`              | Form to search for books               |
| `/register`            | User registration page                 |
| `/books/addbook`       | Form to add a new book                 |
| `/list`                | Displays all books in the database     |
| `/books/bargainbooks`  | Lists books priced below a set amount  |
| `/users/list`          | Lists users who have registered        |
| `/users/login`         | Login page                             |
| `/users/audit`         | Displays full audit history            |

---

## Advanced Search Feature

The `/search` route supports **partial matching** using SQL `LIKE` queries. For example, searching for `"World"` will return:

- *Brave New World*
- *Atlas of the World*
- *World History*

This allows users to find books even if they only remember part of the title.

---

### dotenv

Sensitive credentials like database access are managed using the `dotenv` module:

- Installed with `npm install dotenv`
- Created a `.env` file containing:
```env
  BB_HOST='localhost'
  BB_USER='berties_books_app'
  BB_PASSWORD='qwertyuiop'
  BB_DATABASE='berties_books'
```
- Loaded in `index.js` using `require('dotenv').config()`
- Database pool uses `process.env` variables
- `.env` is listed in `.gitignore` to keep it private

---

### Audit

Login attempts are recorded in a `loginAttempts` table to support auditing and security monitoring. Each attempt logs:

- `username`
- `timestamp` (auto-generated)
- `success` (true/false)
- `reason` (e.g. "Invalid password")

This is implemented in the `/users/loggedin` route, where each login attempt—successful or failed—is inserted into the database. A `/users/audit` route displays these attempts in a table view.

## Access Control Overview

This application uses **Express sessions** to restrict access to certain routes.  
The middleware `redirectLogin` ensures that only authenticated users (those with an active `req.session.userId`) can access protected pages.

---

### ✅ Public Routes (no login required)
- `/` → Home page  
- `/about` → About page  
- `/search` → Book search form  
- `/search-result` → Search results  
- `/register` → Registration form  
- `/registered` → Registration submission  
- `/users/login` → Login page  
- `/users/loggedin` → Login submission  
- `/books/list` → View all books  
- `/books/bargainbooks` → View bargain books  

---

### 🔒 Restricted Routes (login required)
- `/users/list` → View all registered users  
- `/users/audit` → View login attempt history  
- `/users/logout` → Logout (only available if logged in)  
- `/books/addbook` → Add new book form  
- `/bookadded` → Add new book submission  

---

### Notes
- **Public routes** are safe for all visitors (browsing, searching, registering, logging in).  
- **Restricted routes** involve sensitive data (user list, audit logs) or database modifications (adding books). These require authentication.  
- Access control is enforced via the `redirectLogin` middleware, which redirects unauthenticated users to `/users/login`.

# Validation Overview

This project uses **express-validator** to enforce server-side validation rules on user input.  
Validation is applied selectively depending on whether a route accepts user-submitted data or simply renders a view.

---

## ✅ Routes with Validation

### `/registered` (POST)
- **Fields validated:** `first`, `last`, `email`, `username`, `password`
- **Rules:**
  - First/Last name: must be alphabetic (including hyphens, apostophes, and spaces) and 2–30 characters long
  - Email: must be a valid email format
  - Username: 3–20 characters
  - Password: at least 8 characters, must contain a number and an uppercase letter
- **Reasoning:** Registration writes new user records to the database. Strong validation prevents invalid data, enforces security requirements, and ensures consistency.

---

### `/users/loggedin` (POST)
- **Fields validated:** `username`, `password`
- **Rules:**
  - Username: trimmed, checked for length
  - Password: required (not empty)
- **Reasoning:** Login compares credentials against stored data. Validation ensures the query is safe and avoids empty submissions.

---

### `/search-result` (GET)
- **Field validated:** `keyword` (query string)
- **Rules:**
  - Must be 1–50 characters
  - Trimmed and escaped
- **Reasoning:** Search queries come directly from user input. Validation prevents SQL injection and ensures meaningful results.

---

### `/bookadded` (POST)
- **Fields validated:** `name`, `price`
- **Rules:**
  - Name: required, reasonable length
  - Price: must be numeric
- **Reasoning:** Adding books modifies the database. Validation ensures only valid book names and numeric prices are stored.

---

## 🚫 Routes without Validation

### Informational and view-rendering routes
- `/` (home), `/about`, `/search` (form page)
- `/users/list`, `/users/login` (form page), `/users/audit`, `/users/logout`
- `/register` (form page)
- `/books/list`, `/books/bargainbooks`

**Reasoning:**  
These routes only render static views or query the database without taking direct user input. Validation is not required because no unsafe or malformed data can be submitted.

---

# Input Sanitization Overview

This project uses **express-sanitizer** to clean user inputs before they are processed or stored.  
Sanitization is applied selectively depending on whether a route accepts user-submitted data or simply renders a view.

---

## ✅ main.js

### `/search-result` (GET)
- **Sanitization applied:** `req.sanitize(req.query.keyword)`
- **Reasoning:** The search keyword comes directly from user input. Sanitizing prevents malicious payloads (e.g., `<script>` tags) and ensures safe SQL queries and output rendering.
- **Other routes (`/`, `/about`, `/search`):** No sanitization needed because they only render static views and do not process user input.

---

## ✅ users.js

### `/users/loggedin` (POST)
- **Sanitization applied:** `req.sanitize(username.trim())`, `req.sanitize(password)`
- **Reasoning:** Username and password are user inputs. Sanitization ensures unsafe characters are removed before querying the database or comparing with stored hashes.

### `/registered` (POST)
- **Sanitization applied:** `req.sanitize(req.body.first)`, `req.sanitize(req.body.last)`, `req.sanitize(req.body.email)`, `req.sanitize(req.body.username)`, `req.sanitize(req.body.password)`
- **Reasoning:** Registration form fields are all user-supplied. Sanitization prevents injection or XSS when storing values in the database or echoing them back in confirmation messages.

### Other routes (`/users/list`, `/users/login`, `/users/audit`, `/users/logout`, `/register`)
- **No sanitization needed:** These routes either render views or query the database without processing direct user input.

---

## ✅ books.js

### `/bookadded` (POST)
- **Sanitization applied:** `req.sanitize(req.body.name)`, `req.sanitize(req.body.price)`
- **Reasoning:** Book name and price come from a form. Sanitization ensures malicious characters are stripped before inserting into the database or displaying in the success message.

### Other routes (`/books/list`, `/books/addbook`, `/books/bargainbooks`)
- **No sanitization needed:** These routes only render views or query the database without handling direct user input.

---

# Books API

This API provides access to the `books` table with optional filtering and sorting.

## Endpoint
`GET/api/books`


## Query Parameters
- `search` – filter books by name (partial match).  
  Example: `/api/books?search=world`

- `minprice` – minimum price filter.  
- `max_price` – maximum price filter.  
  Example: `/api/books?minprice=5&max_price=10`

- `sort` – sort results by field.  
  - `name` → sort alphabetically by book name  
  - `price` → sort numerically by price  
  Example: `/api/books?sort=price`

## Behavior
- Returns all books if no parameters are provided.  
- Multiple filters can be combined (search + price range + sort).  
- Results are returned as JSON.

## Example Requests
- `/api/books` → all books  
- `/api/books?search=universe` → books with "universe" in name  
- `/api/books?minprice=5&max_price=15&sort=name` → books priced £5–£15 sorted by name

---

## Testing

Formal test cases for the `/weather` route are documented in 
[docs/weather_test_cases.md](./docs/weather_test_cases.md).

These cover scenarios such as:
- Valid city input
- Non-existent city names
- Empty input validation
- Invalid API key
- Network failure

All results are logged with expected vs actual outcomes and pass/fail status.

## How to Install and Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Hwane14/06_berties_33821100
cd 06_berties_33821100
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up the Database
Open MySQL and run:
```Sql
SOURCE create_db.sql;
SOURCE insert_test_data.sql;
```

### 4. Start the Server
```bash
node index.js
```
Visit http://localhost:8000 in your browser
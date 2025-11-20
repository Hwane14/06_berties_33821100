const bcrypt = require('bcrypt');
module.exports = function(app, shopData) {

    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });
    app.get('/search',function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result', function (req, res, next) {
        let searchQuery = "SELECT * FROM books WHERE LOWER(name) LIKE LOWER(?)"
        let keyword = `%${req.query.keyword}%`// wrap keyword with wildcards

        //searching in the database
        db.query(searchQuery, [keyword], (err, result) => {
            if (err) {
                next(err)
            }
            res.render('searchresults.ejs', {
                books: result,
                shopData: shopData,
                keyword: req.query.keyword
            });
        });
    });
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });                                                                                                 
    app.post('/registered', function (req, res, next) {
        const saltRounds = 10;
        const plainPassword = req.body.password;
        let sqlquery = "INSERT INTO userData (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)"

        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            // Store hashed password in the database.
            let newrecord =[req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];
            // Execute SQL query
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    next(err)
                }
                else {
                    const message = `
                    <h1>Registration Successful</h1>
                    <p>Hello ${req.body.first} ${req.body.last}, you are now registered!</p>
                    <p>We will send an email to you at ${req.body.email}.</p>
                    <p>Your password is: ${req.body.password}</p>
                    <p>Your hashed password is: ${hashedPassword}</p>
                    <p><a href="/">Return to home</a></p>`;
                    res.send(message);                                                                              
                }
            });
        });

    });
    // Route to render list.ejs
    app.get('/books/list', function(req, res, next) {
        let sqlquery = "SELECT * FROM books"; // query database to get all the books

        // Execute SQL query
        db.query(sqlquery, (err, result) => {
            if (err) {
                next(err)
            }
            res.render('list.ejs', {
                availableBooks:result,
                shopData:shopData
            });
        })
    });
    // Route to render addbook.ejs
    app.get('/books/addbook', function(req, res) {
        res.render('addbook.ejs', shopData);
    });
    // Route to handle form submission for adding a new book to the database
    app.post('/bookadded', function(req, res, next) {
        // Saving data in database
        let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";

        // Execute SQL query
        let newrecord = [req.body.name, req.body.price];

        // Send data to database if no error
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                next(err)
            }
            else {
                res.send(`
                    <h1>Book Added</h1>
                    <p>This book has been added to the database.</p>
                    <p><strong>Name:</strong> ${req.body.name}</p>
                    <p><strong>Price:</strong> £${req.body.price}</p>
                    <p><a href="/">Return to home</a></p>
                    `);
                }
        });
    });
    // Route to show list of bargain books
    app.get('/books/bargainbooks', function(req, res, next) {
        let sqlquery = "SELECT * FROM books WHERE price<20"; // query database to get all the books

        // Execute SQL query
        db.query(sqlquery, (err, result) => {
            if (err) {
                next(err)
            }
            res.render('bargainlist.ejs', {
                bargainBooks:result,
                shopData:shopData
            });
        });
    });
    // Route to list users
    app.get('/users/list', function(req, res, next) {
        let sqlquery = "SELECT * FROM userData";

        // Execute SQL query
        db.query(sqlquery, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.render('userList.ejs', {
                    users: result,
                    shopData:shopData
                });
            }
        });
    });
    // Route for login page
    app.get('/users/login', function(req, res) {
        res.render('login.ejs', shopData);
    })
    // Route to compare form data with stored data and display outcome message
    app.post('/users/loggedin', function(req, res, next) {
        const {username, password} = req.body;
        let sqlquery = "SELECT username, hashedPassword FROM userData WHERE username = ?";
        const cleanUsername = username.trim();// removes trailing and leading whitespace

        // Execute SQL query 
        db.query(sqlquery, cleanUsername, async (err, result) => {
            if (err) {
                return next(err);
            }
            
            if (result.length === 0) {
                // Log failed attempt: invalid username
                db.query("INSERT INTO loginAttempts (username, success, reason) VALUES (?, ?, ?)",
                    [cleanUsername, false, "Invalid username"]);
                return res.send(`
                    <h1>Login Failed</h1>
                    <p>Invalid username.</p>
                    <p><a href="/">Return to home</a></p>
                    `);
            }

            const user = result[0];

            try {
                const match = await bcrypt.compare(password, user.hashedPassword);

                if (match) {
                    // Log successful attempt
                    db.query("INSERT INTO loginAttempts (username, success, reason) VALUES (?, ?, ?)",
                    [cleanUsername, true, "Login successful"]);
                    res.send(`
                        <h1>Login Successful</h1>
                        <p>Welcome back, ${cleanUsername}!</p>
                        <p><a href="/">Return to home</a></p>
                        `);
                }
                else {
                    // Log failed attempt: Invalid password
                    db.query("INSERT INTO loginAttempts (username, success, reason) VALUES (?, ?, ?)",
                    [cleanUsername, false, "Invalid password"]);
                    res.send(`
                        <h1>Login Failed</h1>
                        <p>Invalid password.</p>
                        <p><a href="/">Return to home</a></p>
                        `);
                }
            } catch (compareErr) {
                next(compareErr);
            }
        });
    });
    // Route to display login attempts
    app.get('/users/audit', function(req, res) {
        let sqlquery = "SELECT * FROM loginAttempts ORDER BY attemptTime DESC";

        //Execute SQL query
        db.query(sqlquery, (err, result) => {
            if (err) return next(err);
            res.render('auditHistory.ejs', {
                attempts: result,
                shopData: shopData
            });
        });
    })
}
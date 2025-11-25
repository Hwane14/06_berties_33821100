const bcrypt = require('bcrypt');
const {check, validationResult} = require('express-validator');
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login') // redirect to the login page
    } else {
        next(); // move to the next middlware function
    }
}
module.exports = function(app, shopData) {
    // Route to list users
    app.get('/users/list', redirectLogin, function(req, res, next) {
        let sqlquery = "SELECT * FROM userData";

        // Execute SQL query
        db.query(sqlquery, (err, result) => {
            if (err) {
                return next(err);
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
    });
    // Route to compare form data with stored data and display outcome message
    app.post('/users/loggedin',
        [
            check('username').isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters long'),
            check('password').notEmpty().withMessage('Password is required')
        ],
        
        function(req, res, next) {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.render('login.ejs', {
                    ...shopData,
                    errors:errors.array()
                });
            }
            else {
                const {username, password} = req.body;
                const cleanUsername = req.sanitize(username.trim());
                const cleanPassword = req.sanitize(password);
                let sqlquery = "SELECT username, hashedPassword FROM userData WHERE username = ?";

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
                        const match = await bcrypt.compare(cleanPassword, user.hashedPassword);

                        if (match) {
                            // Save user session here, when login is successful
                            req.session.userId = req.body.username;

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
            }
        });
    // Route to display login attempts
    app.get('/users/audit', redirectLogin, function(req, res, next) {
        let sqlquery = "SELECT * FROM loginAttempts ORDER BY attemptTime DESC";

        //Execute SQL query
        db.query(sqlquery, (err, result) => {
            if (err) return next(err);
            res.render('auditHistory.ejs', {
                attempts: result,
                shopData: shopData
            });
        });
    });
    // Route to logout
    app.get('/users/logout', redirectLogin, (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('../');
            }
            res.send('You are now logged out. <a href=' + '../' + '>Home</a>');
        });
    });
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });                                                                                                 
    app.post('/registered',
        [
            check('first')
            .trim()
            .isLength({ min: 2, max: 30 })
            .withMessage('First name must be between 2 and 30 characters')
            .matches(/^[A-Za-z\s'-]+$/).withMessage('First name may contain letters, spaces, hyphens, or apostrophes'),

            check('last')
            .trim()
            .isLength({ min: 2, max: 30 })
            .withMessage('Last name must be between 2 and 30 characters')
            .matches(/^[A-Za-z\s'-]+$/).withMessage('First name may contain letters, spaces, hyphens, or apostrophes'),

            check('email')
            .trim()
            .isEmail()
            .withMessage('Please enter a valid email address'),

            check('username')
            .trim()
            .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters long'),

            check('password')
            .isLength({ min: 8}).withMessage('Password must be at least 8 characters long')
            .matches(/\d/).withMessage('Password must contain at least one number')
            .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        ],
        
        function (req, res, next) {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.render('register.ejs', {
                    ...shopData,
                    errors:errors.array()
                });
            }
            else {
                const cleanFirst = req.sanitize(req.body.first);
                const cleanLast = req.sanitize(req.body.last);
                const cleanEmail = req.sanitize(req.body.email);
                const cleanUsername = req.sanitize(req.body.username);
                const cleanPassword = req.sanitize(req.body.password);

                const saltRounds = 10;
                let sqlquery = "INSERT INTO userData (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)"

                //Check if username or email alread exists
                let checkQuery = "SELECT * FROM userData WHERE username = ? OR email = ?";
                db.query(checkQuery, [cleanUsername, cleanEmail], (err, result) => {
                    if (err) return next(err);

                    if (result.length > 0) {
                        // User already exists
                        return res.send(`
                            <h1>Registration Failed</h1>
                            <p>The username or email is alread registered. Please choose another.</p>
                            <p><a href="/register">Return to registration</a></p>
                            `);
                    }

                    // If not proceed with hashing and inserting
                    bcrypt.hash(cleanPassword, saltRounds, function(err, hashedPassword) {
                        //
                        // Store hashed password in the database.
                        let newrecord =[cleanUsername, cleanFirst, cleanLast, cleanEmail, hashedPassword];
                        // Execute SQL query
                        db.query(sqlquery, newrecord, (err, result) => {
                            if (err) {
                                return next(err);
                            }
                            else {
                                const message = `
                                <h1>Registration Successful</h1>
                                <p>Hello ${cleanFirst} ${cleanLast}, you are now registered!</p>
                                <p>We will send an email to you at ${cleanEmail}.</p>
                                <p>Your password is: ${cleanPassword}</p>
                                <p>Your hashed password is: ${hashedPassword}</p>
                                <p><a href="/">Return to home</a></p>`;
                                res.send(message);                                                                              
                            }
                        });
                    });
                });
                }
    });
}
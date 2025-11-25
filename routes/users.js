const bcrypt = require('bcrypt');
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
                return res.redirect('/');
            }
            res.send('You are now logged out. <a href=' + '/' + '>Home</a>');
        });
    });
}
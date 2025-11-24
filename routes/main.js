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
                return next(err);
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

        //Check if username or email alread exists
        let checkQuery = "SELECT * FROM userData WHERE username = ? OR email = ?";
        db.query(checkQuery, [req.body.username,req.body.email], (err, result) => {
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
            bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
                // Store hashed password in the database.
                let newrecord =[req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];
                // Execute SQL query
                db.query(sqlquery, newrecord, (err, result) => {
                    if (err) {
                        return next(err);
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

        
    });
}
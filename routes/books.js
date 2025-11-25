const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('../users/login') // redirect to the login page
    } else {
        next(); // move to the next middlware function
    }
}
const {check, validationResult} = require('express-validator');
module.exports = function(app, shopData) {
    // Route to render list.ejs
    app.get('/books/list', function(req, res, next) {
        let sqlquery = "SELECT * FROM books"; // query database to get all the books

        // Execute SQL query
        db.query(sqlquery, (err, result) => {
            if (err) {
                return next(err);
            }
            res.render('list.ejs', {
                availableBooks:result,
                shopData:shopData
            });
        })
    });
    // Route to render addbook.ejs
    app.get('/books/addbook', redirectLogin, function(req, res) {
        res.render('addbook.ejs', shopData);
    });
    // Route to handle form submission for adding a new book to the database
    app.post('/bookadded', redirectLogin,
        [
            check('name').isLength({ min: 1, max: 40}).withMessage('Please enter a valid book name'),
            check('price').isInt().withMessage('Please enter a valid price')
        ],
        function(req, res, next) {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.render('addbook.ejs', {
                    ...shopData,
                    errors:errors.array()
                });
            }
            else {
                // Sanitize inputs
                const cleanName = req.sanitize(req.body.name);
                const cleanPrice = req.sanitize(req.body.price);

                // Saving data in database
                let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";

                // Execute SQL query
                let newrecord = [cleanName, cleanPrice];

                // Send data to database if no error
                db.query(sqlquery, newrecord, (err, result) => {
                    if (err) {
                        return next(err);
                    }
                    else {
                        res.send(`
                            <h1>Book Added</h1>
                            <p>This book has been added to the database.</p>
                            <p><strong>Name:</strong> ${cleanName}</p>
                            <p><strong>Price:</strong> £${cleanPrice}</p>
                            <p><a href="/">Return to home</a></p>
                            `);
                        }
                    });
            }
        });
    // Route to show list of bargain books
    app.get('/books/bargainbooks', function(req, res, next) {
        let sqlquery = "SELECT * FROM books WHERE price<20"; // query database to get all the books

        // Execute SQL query
        db.query(sqlquery, (err, result) => {
            if (err) {
                return next(err);
            }
            res.render('bargainlist.ejs', {
                bargainBooks:result,
                shopData:shopData
            });
        });
    });
}
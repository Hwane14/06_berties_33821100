const {check, validationResult} = require('express-validator');
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
    app.get('/search-result',
        [
            check('keyword')
            .isLength({ min: 1, max: 50 })
            .withMessage('Search keyword must be between 1 and 50 characters')
            .trim()
            .escape()

        ],

        function (req, res, next) {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.render('search.ejs', {
                    ...shopData,
                    errors:errors.array()
                });
            }
            else {
                const cleanKeyword = req.sanitize(req.query.keyword)
                let searchQuery = "SELECT * FROM books WHERE LOWER(name) LIKE LOWER(?)"
                let keyword = `%${cleanKeyword}%`// wrap keyword with wildcards

                //searching in the database
                db.query(searchQuery, [keyword], (err, result) => {
                    if (err) {
                        return next(err);
                    }
                    res.render('searchresults.ejs', {
                        books: result,
                        shopData: shopData,
                        keyword: cleanKeyword
                    });
                });
            }
        });
}
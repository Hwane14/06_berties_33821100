module.exports = function(app, shopData) {
    app.get('/api/books', function (req, res, next) {
        let search_term = req.query.search;
        let min_price = req.query.minprice;
        let max_price = req.query.max_price;
        let sort_by = req.query.sort;

        let sqlquery = "SELECT * FROM books";
        let conditions = [];
        let values = [];

        // Add search condition if provided
        if (search_term) {
            conditions.push("name LIKE ?");
            values.push("%" + search_term + "%");
        }

        // Add price range condition if provided
        if (min_price && max_price) {
            conditions.push("price BETWEEN ? AND ?");
            values.push(min_price, max_price);
        } else if (min_price) {
            conditions.push("price >= ?");
            values.push(min_price);
        } else if (max_price) {
            conditions.push("price <= ?");
            values.push(max_price);
        }

        // If we have conditions, append them to the query
        if (conditions.length > 0) {
            sqlquery += " WHERE " + conditions.join(" AND ");
        }

        // Sorting
        if (sort_by) {
            if (sort_by === "name") {
                sqlquery += " ORDER BY name ASC";
            } else if (sort_by === "price") {
                sqlquery += " ORDER BY price ASC";
            }
        }

        // Execute the SQL query
        db.query(sqlquery, values, (err, result) => {
            // Return results as JSON object
            if (err) {
                res.json(err);
                next(err);
            }
            else {
                res.json(result);
            }
        });
    });
}
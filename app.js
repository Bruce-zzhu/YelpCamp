const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');



mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.engine('ejs', ejsMate)  // use the ejs-mate engine

app.use(express.urlencoded({ extended: true }))  // for post request
app.use(methodOverride('_method'));  // '_method' can be editted, but in the form action it has to be matched
app.use(express.static('public'));

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);






app.get('/', (req, res) => {
    res.render('home')
})



// for every request and every path, pass error to error handler
app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

// Error handler
app.use((err, req, res, next) => {
    
    const { statusCode = 500 } = err;
    if(!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render('error', { err });
    
})



app.listen(port, () => {
    console.log(`Listen on http://localhost:${port}`)
})

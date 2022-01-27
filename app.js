const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Campground = require('./models/campground');
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require("./joiSchemas");
const Review = require('./models/review');



mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({ extended: true }))  // for post request
app.use(methodOverride('_method'));  // '_method' can be editted, but in the form action it has to be matched
app.engine('ejs', ejsMate)  // use the ejs-mate engine


// validate data with joi
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if(error) {
        // map over the element of each obj and return message
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if(error) {
        // map over the element of each obj and return message
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}


app.get('/', (req, res) => {
    res.render('home')
})

// list of campgrounds
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

// campground creation page
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

// create a campground via a form
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // ceate a new campground model for every new campground
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

// campground show page
// order matters, this one cannot be above "campgrounds/new"
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    res.render('campgrounds/show', { campground })
}))

// submit review
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Review.findByIdAndDelete(reviewId);
    // delete the reference in campground.reviews
    await Campground.findByIdAndUpdate(id,  {$pull: {reviews: reviewId}})
    res.redirect(`/campgrounds/${id}`)
}))

// campground edit page
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
}))

// update campground
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))

// delete campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

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
    console.log(`Listen on http://localhost:${port}/campgrounds`)
})

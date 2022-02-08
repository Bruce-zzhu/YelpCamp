const express = require("express");
const router = express.Router({mergeParams: true}); 
const catchAsync = require("../utils/catchAsync");
const Review = require('../models/review');
const Campground = require('../models/campground');
const { reviewSchema } = require("../joiSchemas");
const ExpressError = require("../utils/ExpressError");



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

// submit review
router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Review.findByIdAndDelete(reviewId);
    // delete the reference in campground.reviews
    await Campground.findByIdAndUpdate(id,  {$pull: {reviews: reviewId}})
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;
const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require('../models/campground');
const { campgroundSchema } = require("../joiSchemas");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn } = require('../middleware');


// validate data with joi
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        // map over the element of each obj and return message
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}


// list of campgrounds
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

// campground creation page
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

// create a campground via a form
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // ceate a new campground model for every new campground
    const campground = new Campground(req.body.campground)
    await campground.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

// campground show page
// order matters, this one cannot be above "campgrounds/new"
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    // handle errors of access non-existing campground
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))


// campground edit page
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}))

// update campground
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

// delete campground
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfullt deleted campground')
    res.redirect('/campgrounds');
}))


module.exports = router;
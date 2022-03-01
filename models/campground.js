/**
 * Set up MongoDB Schema
 */

const mongoose = require("mongoose");
const { campgroundSchema } = require("../joiSchemas");
const Review = require("./review");
const Schema = mongoose.Schema;

// make mongoose support virtual
const opts = {toJSON: {virtuals: true}}

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // one (campground) to many (reviews) relationship
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

// add properties for map functions
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>`
})

// delete the reviews while deleting the campground
CampgroundSchema.post('findOneAndDelete', async function(campground) {
    if(campground) {
        await Review.remove({
            _id: {
                $in: campground.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);
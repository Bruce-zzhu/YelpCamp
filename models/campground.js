/**
 * Set up MongoDB Schema
 */

const mongoose = require("mongoose");
const { campgroundSchema } = require("../joiSchemas");
const Review = require("./review");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    // one (campground) to many (reviews) relationship
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

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
/**
 * Set up MongoDB Schema
 */

const mongoose = require("mongoose");
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



module.exports = mongoose.model('Campground', CampgroundSchema);
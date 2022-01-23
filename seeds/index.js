const mongoose = require("mongoose");
const Campground = require('../models/campground');
const cities = require('./cities')  // 1000 cities
const {places, descriptors} = require('./seedHelpers')
const axios = require("axios");

mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// pick a random element from an array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// store campgrounds into database
const seedDB = async () => {
    await Campground.deleteMany({})
    for(let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);   // a random city (out of 1000 cities)
        const randPrice = Math.floor(Math.random() + 20) + 10;
        // https://api.unsplash.com/photos/random?collections=483251&client_id=05T3GxU3h_nKIVb5iXLnuxP9CDvGDcEgk_i4qjpXJDo
        const image = await axios.get('https://api.pexels.com/v1/photos/1687845')
                            .then(res => {
                                return res.data.src.large
                            })
                            .catch(err => {
                                console.log("Fetch image error", err)
                            })

        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            image: image,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nihil sapiente nisi possimus commodi. Quaerat adipisci tempora sunt a praesentium libero fugiat voluptas aliquid illo quasi laborum, possimus nesciunt nobis impedit. ',
            price: randPrice
        })
        await camp.save()
    }
}


seedDB().then(() => {
    mongoose.connection.close();  // close db
})
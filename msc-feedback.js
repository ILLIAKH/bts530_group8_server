var mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = new Schema({
    review: String,
    rating: Number,
    user: [Users],
    subscription: [Subscriptions]
});
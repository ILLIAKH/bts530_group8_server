var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Subscriptions = require('./msc-subscriptions');

module.exports = new Schema({
    userName: {type: String, unique: true},
    firstName: String,
    lastName: String,
    password: String,
    phoneNumber: String,
    statusActivated: Boolean,
    statusLocked: Boolean,
    isAdmin: Boolean,
    streetName: String,
    streetNumber: Number,
    unit: Number,
    province: String,
    country: String,
    postalCode: String,

    pastDeliveries: [String],
    subscriptionInfo: [Subscriptions],
    //hello
});

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Subscriptions = require('./msc-subscriptions');

module.exports = new Schema({
    userName: {type: String, unique: true},
    fullName: String,
    password: String,
    statusActivated: Boolean,
    statusLocked: Boolean,
    isAdmin: Boolean,
    subscriptionInfo: [Subscriptions]
//hello
});

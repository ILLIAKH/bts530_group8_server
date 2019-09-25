var mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = new Schema({
    subName: String,
    subPeriod: Number,
    subBoxType: String,
    subPrice: Number,
    isActive: Boolean
});
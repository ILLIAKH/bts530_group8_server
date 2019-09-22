const mongoose = require("mongoose");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);

//load schemas
const users = require("./msc-useraccounts");
const subscriptions = require("./msc-subscriptions");

module.exports = function(mongoDBConnectionString) {
    let Users;
    let Subscriptions;
    
    return{
        connect: function(){
            return new Promise(function(resolve, reject){
                let db = mongoose.createConnection(mongoDBConnectionString);
                db.on("error", error => {
                    reject(error);
                });
                db.once("open", () => {
                    Users = db.model("main", users, "useraccounts");
                    Subscriptions = db.model("main2", subscriptions, "subscriptioninfo");
                    resolve();
                });
            });
        },

        /////Users------------------------------------------------------------------------
        //GET ALL
        usersGetAll: function () {
            return new Promise(function (resolve, reject){
                Users.find()
                .sort({
                    fullName: 'asc'
                })
                .exec((error, items) => {
                    if(error) {
                        return reject(error.message);
                    }
                    return resolve(items);
                });
            });
        },

        //GET ONE
        usersGetById: function (username){
            return new Promise(function (resolve, reject){
                Users.findOne({ userName: username }, (error, item) => {
                    if (error) {
                        return reject(error.message);
                    }
                    if (item) {
                        return resolve(item);
                    } else {
                        return reject("Not Found");
                    }
                });
            });
        },

        //Subscriptions---------------------------------------------------------------------
        //GET ALL
        subscriptionsGetAll: function() {
            return new Promise(function (resolve, reject){
                Subscriptions.find()
                .sort({
                    subId: 'asc'
                })
                .exec((error, items) => {
                    if(error) {
                        return reject(error.message);
                    }
                    return resolve(items);
                });
            });
        },

        //GET ONE
        subscriptionsGetById: function(subid){
            return new Promise(function (resolve, reject){
                Subscriptions.findOne({subId: subid}, (error, item) =>{
                    if (error) {
                        return reject(error.message);
                    }
                    if (item) {
                        return resolve(item);
                    } else {
                        return reject("Not Found");
                    }
                });
            });
        },


        //Select by type--------------------------------------------------------------------
        //Vegetables
        vegetables: function (){
            return new Promise(function (resolve, reject){
                Subscriptions.find({
                    subBoxType: 'vegetables'
                })
                .exec((error, items) => {
                    if(error) {
                        return reject(error.message);
                    }
                    return resolve(items);
                });
            });
        },

        //Fruits
        fruits: function(){
            return new Promise(function (resolve, reject){
                Subscriptions.find({
                    subBoxType: 'fruits'
                })
                .exec((error, items) => {
                    if(error){
                        return reject(error.message);
                    }
                    return resolve(items);
                });
            });
        },

        //Combined
        combined: function(){
            return new Promise(function (resolve, reject){
                Subscriptions.find({
                    subBoxType: 'combined'
                })
                .exec((error, items) => {
                    if(error){
                        return reject(error.message);
                    }
                    return resolve(items);
                });
            });
        }


    }; ////
}; ////
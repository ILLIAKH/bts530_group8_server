const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//load schemas
const users = require("./msc-useraccounts");
const subscriptions = require("./msc-subscriptions");
const feedback = require("./msc-feedback");

module.exports = function(mongoDBConnectionString) {
    let Users;
    let Subscriptions;
    let Feedback;
    
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
                    Feedback = db.model("main3", feedback, "feedback");
                    resolve();
                });
            });
        },

        /////Register---------------------------------------------------------------------
        usersRegister: function (userData) {
            return new Promise(function (resolve, reject) {

               
                if (userData.userName.length == 0 | userData.password.length == 0 | userData.passwordConfirm.length == 0) {
                    return reject('Invalid credentials');
                }

                if (userData.password != userData.passwordConfirm) {
                    return reject("Passwords do not match");
                }

                // Generate a "salt" value
                var salt = bcrypt.genSaltSync(10);
                // Hash the result
                var hash = bcrypt.hashSync(userData.password, salt);

                // Update the incoming data
                userData.password = hash;

                // Create a new user account document
                let newUser = new Users(userData);
                // Add properties
                newUser.statusActivated = true;
                newUser.statusLocked = false;

                // Attempt to save
                newUser.save((error) => {
                    if (error) {
                        if (error.code == 11000) {
                            reject("User account creation - cannot create; user already exists");
                        } else {
                            reject(`User account creation - ${error.message}`);
                        }
                    } else {
                        resolve("User account was created");
                    }
                }); //newUser.save
            }); // return new Promise
        }, // useraccountsRegister
        /////Login------------------------------------------------------------------------
        usersLogin: function(userData){
            return new Promise(function(resolve, reject){
                if(userData.userName.length == 0 | userData.password.length == 0){
                    return reject("Invalid Credentials");
                }

                Users.findOne({
                userName: userData.userName
                }, (error, item) => {
                if (error) {
                    // Query error
                    return reject(`Login - ${error.message}`);
                }
                // Check for an item
                if (item) {

                    // // Ensure that the account is active
                    // if (!item.statusActivated) {
                    //     return reject('Account is not activated')
                    // }
                    // // Ensure that the account is unlocked
                    // if (item.statusLocked) {
                    //     return reject('Account is locked');
                    // }

                    // Compare password with stored value
                    let isPasswordMatch = bcrypt.compareSync(userData.password, item.password);
                    if (isPasswordMatch) {
                        //return resolve('Login was successful');
                        return resolve(item);
                    } else {
                        return reject('Login was not successful');
                    }
                } else {
                    return reject('Login - not found');
                }

               }); // UserAccounts.findOneAndUpdate
             }); // return new Promise
          }, // useraccountsLogin


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

         //UPDATE USER
         usersUpdate: function (id, newItem) {
             var wrapItem = {
                 "subscriptionInfo": newItem
             };
                 return new Promise(function (resolve, reject) {

                     Users.findByIdAndUpdate(id, wrapItem, {
                         new: true
                     }, (error, newItem) => {
                         if (error) {
                             // Cannot edit item
                             return reject(error.message);
                         }
                         // Check for an item
                         if (newItem) {
                             // Edited object will be returned
                             return resolve(newItem);
                         } else {
                             return reject('Not found');
                         }

                     });
                 });
             },

             //Update Phone Number
             phoneNumberUpdate: function (newItem) {
                return new Promise(function (resolve, reject) {
                    User.findByIdAndUpdate(newItem._id, newItem, {
                        new: true
                    }, (error, item) => {
                        if (error) {
                            // Cannot edit item
                            return reject(error.message);
                        }
                        // Check for an item
                        if (item) {
                            // Edited object will be returned
                            return resolve(item);
                        } else {
                            return reject('Not found');
                        }
     
                    });
                })
            },

             //DELETE USER
             usersDelete: function (itemId) {
                 return new Promise(function (resolve, reject) {
                     Users.findByIdAndRemove(itemId, (error) => {
                         if (error) {
                             // Cannot delete item
                             return reject(error.message);
                         }
                         // Return success, but don't leak info
                         return resolve();
                     });
                 });
             },

        //GET ADMIN
        admin: function () {
            return new Promise(function (resolve, reject) {
                Users.find({ 
                    isAdmin: true 
                })
                .exec((error, items) => {
                    if (error) {
                      // Query error
                      return reject(error.message);
                    }
                    // Found, a collection will be returned
                    return resolve(items);
                    
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

   //ADD NEW
   subscriptionAdd: function (newItem) {
           return new Promise(function (resolve, reject) {

               Subscriptions.create(newItem, (error, item) => {
                   if (error) {
                       // Cannot add item
                       return reject(error.message);
                   }
                   //Added object will be returned
                   return resolve(item);
               });
           })
       },

       //UPDATE SUBSCRIPTION
       subscriptionUpdate: function (_id, newItem) {
           return new Promise(function (resolve, reject) {

               Subscriptions.findByIdAndUpdate(_id, newItem, {
                   new: true
               }, (error, item) => {
                   if (error) {
                       // Cannot edit item
                       return reject(error.message);
                   }
                   // Check for an item
                   if (item) {
                       // Edited object will be returned
                       return resolve(item);
                   } else {
                       return reject('Not found');
                   }

               });
           })
       },

       //DELETE SUBSCRIPTION
       subscriptionDelete: function (itemId) {
           return new Promise(function (resolve, reject) {

               Subscriptions.findByIdAndRemove(itemId, (error) => {
                   if (error) {
                       // Cannot delete item
                       return reject(error.message);
                   }
                   // Return success, but don't leak info
                   return resolve();
               })
           })
       },

        //Assign subscription to user
        subscriptionConfirm: function (userId, subscriptionInfo) {
            return new Promise(function (resolve, reject) {
                var wrap = {
                    "subscriptionInfo": subscriptionInfo
                };
                Student.findByIdAndUpdate(userId._id, wrap, {
                    new: true
                }, (error, item) => {
                    if (error) {
                        return reject(error.message);
                    }
                    // Check for an item
                    if (item) {
                        return resolve("Subscription Confirmed");
                    } else {
                        return reject('Not found');
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
        },

        //////////USER FEEDBACK

        //GET ALL FEEDBACK
        feedbackGetAll: function() {
            return new Promise(function (resolve, reject){
                Feedback.find() 
                .exec((error, items) => {
                    if(error) {
                        return reject(error.message);
                    }
                    return resolve(items);
                });
            });
        },

        //GET ONE
        feedbackGetById: function(feedbackid){
            return new Promise(function (resolve, reject){
                Feedback.findOne({feedbackId: feedbackid}, (error, item) =>{
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

    //ADD NEW
   feedbackAdd: function (newItem) {
    return new Promise(function (resolve, reject) {

       Feedback.create(newItem, (error, item) => {
            if (error) {
                // Cannot add item
                return reject(error.message);
            }
            //Added object will be returned
            return resolve(item);
        });
    })
},

//UPDATE FEEDBACK
feebackUpdate: function (_id, newItem) {
    return new Promise(function (resolve, reject) {

        Feedback.findByIdAndUpdate(_id, newItem, {
            new: true
        }, (error, item) => {
            if (error) {
                // Cannot edit item
                return reject(error.message);
            }
            // Check for an item
            if (item) {
                // Edited object will be returned
                return resolve(item);
            } else {
                return reject('Not found');
            }

        });
    })
},

//DELETE FEEDBACK
feedbackDelete: function (itemId) {
    return new Promise(function (resolve, reject) {

        Feedback.findByIdAndRemove(itemId, (error) => {
            if (error) {
                // Cannot delete item
                return reject(error.message);
            }
            // Return success, but don't leak info
            return resolve();
        })
    })
},


    }; ////
}; ////
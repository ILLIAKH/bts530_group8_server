const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

const manager = require("./manager.js");

const m = manager(
    "mongodb+srv://IKHOMENKO:iphone3G@senecaweb-mymvn.mongodb.net/BTS530?retryWrites=true",
    { useUnifiedTopology: true },
    () => console.log("Connected to DB")
);

app.use(bodyParser.json());
app.use(cors());


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


//JWT-----------------------------------------------------------------------------------------------------
var jwt = require('jsonwebtoken');
var passport = require("passport");
var passportJWT = require("passport-jwt");

// JSON Web Token Setup
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

// Configure its options
var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");

jwtOptions.secretOrKey = 'big-long-string-from-lastpass.com/generatepassword.php';

var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);

    if (jwt_payload) {
    // Attach the token's contents to the request
    // It will be available as "req.user" in the route handler functions
        next(null, {
            _id: jwt_payload._id
        });
    } else {
        next(null, false);
    }
});
// Activate the security system
passport.use(strategy);
app.use(passport.initialize());
//Authorisation-------------------------------------------------------------------------------------------

/////Registration
app.post("/api/users/register", (req, res) => {
    m.usersRegister(req.body)
        .then((data) => {
            res.json({"message": data});
            console.log("Successfully Registered");
        }).catch((msg) => {
            res.status(400).json({"message": msg});
            console.log("Error 400 - ", err);
        });
});

//////Login
app.post("/api/users/login", (req, res) => {
    m.usersLogin(req.body)
    .then((data) => {
        var payload = {
            _id: data._id,
            userName: data.userName,
            password: data.password
        };
        var token = jwt.sign(payload, jwtOptions.secretOrKey);

        res.json({
            "message": "Login was successful",
            token: token
        });
    }).catch((msg) => {
        res.status(400).json({
            "message": msg
        });
    });
});

//Users---------------------------------------------------------------------------------------------------

//Get All
app.get("/api/users", passport.authenticate('jwt', {session: false}),(req, res) => {
    m.usersGetAll()
    .then(data => {
        res.json(data);
    })
    .catch(() => {
        res.status(404).json({
            message: "Resource not found"
        });
    });
});
//Get One
app.get("/api/users/:username", passport.authenticate('jwt', {session: false}),(req, res) => {
    m.usersGetById(req.params.username)
    .then(data => {
        res.json(data);
    })
    .catch(() => {
        res.status(404).json({
            message: "Resource not found"
        });
    });
});

//Update User
app.put("/api/users/:_id/update", passport.authenticate('jwt', {session: false}), (req, res) => {
        // Call the manager method
        m.usersUpdate(req.params._id, req.body)
            .then((data) => {
                res.json(data);
            })
            .catch(() => {
                res.status(404).json({
                    "message": "Resource not found"
                });
            });
});

// Delete User
app.delete("/api/users/:_id/delete", passport.authenticate('jwt', {
    session: false
}), (req, res) => {
        // Call the manager method
        m.usersDelete(req.params._id)
            .then(() => {
                res.status(204).end();
            })
            .catch(() => {
                res.status(404).json({
                    "message": "Resource not found"
                });
            });
});

//Get Admins
app.get("/api/users/admin", passport.authenticate('jwt', {session: false}),(req, res) => {
    m.admin()
    .then(data => {
        res.json(data);
    })
    .catch(() => {
        res.status(404).json({
            message: "Resource not found"
        });
    });
});

//Subscriptions-------------------------------------------------------------------------------------------

// Confirm subscription 
app.put("/api/subscriptions/:_id/confirmed", (req, res) => {
    // Call the manager method
    m.subscriptionConfirm(req.params._id, req.body)
        .then((data) => {
            res.json({
                "message": "Subscription confirmed successfully"
            });
        })
        .catch(() => {
            res.status(404).json({
                "message": "Resource not found"
            });
        })
});


//Get All
app.get("/api/subscriptions", (req, res) => {
    m.subscriptionsGetAll()
    .then(data => {
        res.json(data);
    })
    .catch(() => {
        res.status(404).json({
            message: "Resource not found"
        });
    });
});

//Get One
app.get("/api/subscriptions/:subId", (req, res) => {
    m.subscriptionsGetById(req.params._id)
    .then(data => {
        res.json(data);
    })
    .catch(() => {
        res.status(404).json({
            message: "Resource not found"
        });
    });
});



// Add New Subscription
app.post("/api/subscriptions/create", passport.authenticate('jwt', { session: false }), (req, res) => {
    // req.user has the token contents
    //I don't know why this if condition is not working
    //if (req.user.isAdmin === true) {
      // Success
      m.subscriptionAdd(req.body)
      .then((data) => {
        res.json(data); 
      })
      .catch((error) => {
        res.status(500).json({ "message": error });
      })
   // } else {
   //   res.status(403).json({ message: "User does not have the required permission" })
    //}
  });

// Update Subscription
app.put("/api/subscriptions/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
  //if (req.user.isAdmin === true) {
  // Call the manager method
  m.subscriptionUpdate(req.params.id, req.body)
    .then((data) => {
      res.json(data);
    })
    .catch(() => {
      res.status(404).json({ "message": "Resource not found" });
    })
 // } else {
    //res.status(403).json({ message: "User does not have the role claim needed" })
  }
//}
);

// Delete Subscription
app.delete("/api/subscriptions/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
   // if (req.user.isAdmin === true) {
    // Call the manager method
    m.subscriptionDelete(req.params.id)
      .then(() => {
        res.status(204).end();
      })
      .catch(() => {
        res.status(404).json({ "message": "Resource not found" });
      })
  //  } else {
   //   res.status(403).json({ message: "User does not have the role claim needed" })
    //}
  });



//Select by type----------------------------------------------------------------------------

//Get All Vegetable Boxes

app.get("/api/subscriptions/vegetables/find", (req, res) => {
    m.vegetables()
    .then((data) =>{
        res.json(data);
    })
    .catch(() => {
        res.status(404).json({
            message: "Resource not found"
        });
    });
});

//Get All Fruit Boxes
app.get("/api/subscriptions/fruits/find", (req, res) => {
    m.fruits()
        .then((data) => {
            res.json(data);
        })
        .catch(() => {
            res.status(404).json({
                message: "Resource not found"
            });
        });
});

//Get All Combined Boxes
app.get("/api/subscriptions/combined/find", (req, res) => {
    m.combined()
        .then((data) => {
            res.json(data);
        })
        .catch(() => {
            res.status(404).json({
                message: "Resource not found"
            });
        });
});


/////////Connect///////////
m.connect()
.then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("Ready to handle request on port " + HTTP_PORT);
    });
})
.catch(err =>{
    console.log("Unable to start the server:\n" + err);
    process.exit();
});

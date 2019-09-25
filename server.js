const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
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
        // The following will ensure that all routes using 
        // passport.authenticate have a req.user._id value 
        // that matches the request payload's _id
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
            // _id: data._id,
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
app.get("/api/users", (req, res) => {
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
app.get("/api/users/:username", (req, res) => {
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

//Subscriptions-------------------------------------------------------------------------------------------

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
    m.subscriptionsGetById(req.params.subId)
    .then(data => {
        res.json(data);
    })
    .catch(() => {
        res.status(404).json({
            message: "Resource not found"
        });
    });
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

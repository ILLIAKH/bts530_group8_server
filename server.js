const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

const manager = require("./manager.js");

const m = manager(
    "mongodb+srv://IKHOMENKO:iphone3G@senecaweb-mymvn.mongodb.net/BTS530?retryWrites=true"
);

app.use(bodyParser.json());
app.use(cors());


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
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
app.get("/api/users/:userId", (req, res) => {
    m.usersGetById(req.params.userId)
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
    console.log("Unable to start the server:\n" + err)
    process.exit();
})

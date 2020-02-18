const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

const manager = require("./manager.js");

/*"use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass // generated ethereal password
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"C-Kiosk" <ckiosk@example.com>', // sender address
    to: "jessicakrishtul@gmail.com", // list of receivers
    subject: "Your Subscription Has Changed", // Subject line
    text: "Hello Jessica! Your fruits subscription has changed. You will now be receiving strawberries, mangos, and bananas!", // plain text body
    // html: "<b>Hello world?</b>" // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

main().catch(console.error);*/
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

//Send Mail-----------------------------------------------------
app.post("/api/sendmail", (req, res) => {
    console.log("request came");
    let user = req.body;
    sendMail(user, info => {
      console.log("Successfully sent mail");
      res.send(info);
    });
  });
  
  async function sendMail(user, callback) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, //hardcode this
        pass: testAccount.pass
      }
    });

    let mailOptions = {
        from: '"CKIOSK"<ckiosk@ckiosk.com>', // sender address
        to: user.userName, // list of receivers
        subject: "Thank you for registering", // Subject line
        html: `<h1>Hello ${user.userName}</h1><br>
        <h4>Thanks for joining us</h4>`
      };
    
      // send mail with defined transport object
      let info = await transporter.sendMail(mailOptions);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      callback(info);
    }

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

//phoneNumberUpdate
app.put("/api/users/:_id/phone", passport.authenticate('jwt', { session: false }), (req, res) => {
    //if (req.user.isAdmin === true) {
    // Call the manager method
    m.phoneNumberUpdate(req.body)
      .then((data) => {
        res.json(data);
      })
      .catch(() => {
        res.status(404).json({ "message": "I caaaaant" });
      })
   // } else {
      //res.status(403).json({ message: "User does not have the role claim needed" })
    }
  //}
  );

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
      res.status(404).json({ "message": "I caaaaant" });
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

//Get All
app.get("/api/feedback", passport.authenticate('jwt', {session: false}),(req, res) => {
    m.feedbackGetAll()
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
app.get("/api/feedback/:id", passport.authenticate('jwt', {session: false}),(req, res) => {
    m.feedbackGetById(req.params._id)
    .then(data => {
        res.json(data);
    })
    .catch(() => {
        res.status(404).json({
            message: "Resource not found"
        });
    });
});

//Update Feedback
app.put("/api/feedback/:_id/update", passport.authenticate('jwt', {session: false}), (req, res) => {
        // Call the manager method
        m.feedbackUpdate(req.params._id, req.body)
            .then((data) => {
                res.json(data);
            })
            .catch(() => {
                res.status(404).json({
                    "message": "Resource not found"
                });
            });
});

// Delete feedback
app.delete("/api/feedback/:_id/delete", passport.authenticate('jwt', {
    session: false
}), (req, res) => {
        // Call the manager method
        m.feedbackDelete(req.params._id)
            .then(() => {
                res.status(204).end();
            })
            .catch(() => {
                res.status(404).json({
                    "message": "Resource not found"
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

const express = require("express");
const router = express.Router();

// import shcema from models/accshcema
const Accounts = require("../models/accShcema");

// import shcema from models/ userAuthSchema
const userAuth = require("../models/userAuthSchema");
// moment pachage to costumize the date
var moment = require("moment");

// jwt to save the tokeen in the cookie
var jwt = require("jsonwebtoken");

// import tokencheking from middleware
const { tokencheking } = require("../middleware/authentcation");
const { checkIfUser } = require("../middleware/authentcation");

// validation input

const { check, validationResult } = require("express-validator");





// send current user info to all routes
router.get("*", checkIfUser, (req, res) => {});

// save the data in the db
router.post("/all-info-acc", (req, res) => {
  Accounts.create(req.body)
    .then((result) => {
      res.redirect("/index.html");
    })
    .catch((err) => {
      console.log(err);
    });
});

// search about the specific items
router.post("/search", tokencheking, (req, res) => {
  const searchValue = req.body.searchvalue.trim();
  Accounts.find({ $or: [{ platform: searchValue }, { catigory: searchValue }] })
    .then((result) => {
      console.log(result);
      res.render("./search", { searchedData: result, moment: moment });
    })
    .catch((err) => {
      console.log(err);
    });
});

// send data to client
router.get("/index.html", tokencheking, (req, res) => {
  Accounts.find()
    .then((result) => {
      res.render("../index.ejs", { accountsData: result });
    })
    .catch((error) => {
      console.log(error);
    });
});

// filter data  test
router.get("/products", tokencheking, (req, res) => {
  const platform = req.query.platform.trim();

  // Query the database for products with the specified category
  Accounts.find({ platform: platform })
    .then((result) => {
      console.log(result);
      res.render("filter", { filteredData: result });
    })
    .catch((error) => {
      // Handle errors
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});
//

router.get("/add.html", tokencheking, (req, res) => {
  res.render("add.ejs");
});

// get one collection of accs to get the data
router.get("/itemdetails/:id", tokencheking, (req, res) => {
  Accounts.findById(req.params.id)
    .then((result) => {
      console.log("=====get one user with id====");
      console.log(result);

      res.render("itemdetails.ejs", { viewerUser: result });
    })
    .catch((eroor) => {
      console.log(eroor);
    });
});

// delete one collection of accs from the db
router.delete("/delete/:id", (req, res) => {
  Accounts.findByIdAndDelete(req.params.id)
    .then((result) => {
      console.log(result);

      res.redirect("/index.html");
    })
    .catch((error) => {
      console.log(error);
    });
});

// get one collection of accounts to edit page to update them
router.get("/edit/:id", tokencheking, (req, res) => {
  // find accounts by id based req.params.id from the url
  Accounts.findById(req.params.id)
    .then((result) => {
      console.log(result);
      // send the result and moment pack to  client side
      res.render("edit.ejs", { editedAccs: result, moment: moment });
    })
    .catch((error) => {
      console.log(error);
    });
});

// edit one collection of accs
router.put("/update/:id", (req, res) => {
  // get one product depend req.params.id and change it with comming data from req.body
  Accounts.updateOne({ _id: req.params.id }, req.body)
    .then((result) => {
      console.log(result);
      res.redirect("/");
    })
    .catch((error) => {
      console.log(error);
    });
});

// welcome  page
router.get("/", (req, res) => {
  res.render("welcome.ejs", {});
});

// authentication routes login/register=====================================

router.get("/login", (req, res) => {
  res.render("authentication/login", {});
});

router.get("/register", (req, res) => {
  res.render("authentication/register", {});
});

//Save the user information in the database based on the models/userAuthschema .

// Register POST method
router.post(
  "/registerNewUser",
  [
    check("email", "Please provide a valid email").isEmail(),
    check(
      "password",
      "Password must be at least 8 characters with 1 upper case letter and 1 number"
    ).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/),
  ],
  async (req, res) => {
   
    try {
        console.log(req.body.email)
      //  validate the form [email-password ]
      const RegisterobjError = validationResult(req);
      console.log(RegisterobjError)
      if (RegisterobjError.errors.length > 0) {
        return res.json({ registerErrValid: RegisterobjError.errors });
      }

      // check if the email not alredy exist

      const isExist = await userAuth.findOne({ email: req.body.email });
      console.log(isExist);

      if (isExist) {
        // If isExist equals true, it means the email already exists,
        // The code after the return statement will not be executed if isExist is true
        return res.json({emailExist:'email already exist'});
      }

      // save the user info in database if the  isExist == null that mean the email not alredy exist
      const newUser = await userAuth.create(req.body);
      var token = jwt.sign({ userId: newUser._id }, process.env.SECRET_JWT);

      res.cookie("jwt", token, { httpOnly: true, maxAge: 8666666666 });


      
      console.log('user sign up successfully#####################')
      res.json({id:newUser._id})
     
    } catch (error) {
      console.log(error);
    }
  }
);

// login post  method
const bcrypt = require("bcryptjs");

router.post("/login", async (req, res) => {
  // check if the email exist or not
 try {
  const findemailuser = await userAuth.findOne({ email: req.body.email });
  console.log(findemailuser);
  if (findemailuser != null) {
    // if the email exist compare passwords after hashing comming password from login
    const passwordsMatch = await bcrypt.compare(
      req.body.password,
      findemailuser.password
    );
    if (passwordsMatch) {



      // console.log("password identical");

      // save the jwt in the browser  if the email exist and the passwords are match
      // save the user id in the cookie
      var token = jwt.sign({ userId: findemailuser._id }, process.env.SECRET_JWT);

      res.cookie("jwt", token, { httpOnly: true, maxAge: 8666666666 });

      res.json({id:findemailuser._id})
      console.log(token);
    } else {
      //email exist but  the password wrong !
       res.json({wrongPass:"wrong Password"})
    }
  } else {
    // email not exist send to client message ('email not exist')
    res.json({emailNotExist:"email not exist "})
  }
  
 } catch (error) {
  console.log(error)
 }
});

// log out

// <a href="/signout"> in navbar
router.get("/signout", async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });

  res.redirect("/login");
});

module.exports = router;

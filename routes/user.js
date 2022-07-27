// const { hash, genSalt, compare } = require("bcrypt");
const bcrypt = require("bcrypt");
const { render } = require("express/lib/response");
const jwt = require("jsonwebtoken");

const express = require("express");
const question = require("../models/question");
const Tag = require("../models/tag");
const User = require("../models/User");
const router = express.Router();

router.get("/signup", (req, res) => {
  res.render("signupForm");
});

router.get("/login", (req, res) => {
  res.render("loginForm");
});
//router.get("/logout", logout);

router.post("/signup", async (req, res) => {
  try {
    let { username, fullName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    password = hashedPassword;

    await User.create({
      username,
      fullName,
      email,
      password,
    });

    // console.log("            ", password, "*************************");
    res.send("user created");
  } catch (err) {
    console.log(err);
  }
});

//authenthicate the user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      return res.send("User does not exist!!");
    }

    // console.log("***", user.password, "   ", password, "***");

    if (await bcrypt.compare(password, user.password)) {
      // console.log("poo");
      let loggedInUser = {
        id: user._id,
        email,
        fullName: user.fullName,
        username: user.username,
      };
      // const token = await jwt.sign(loggedInUser, "secret_key");
      const token = await jwt.sign(loggedInUser, "secret key");

      //console.log(token);

      req.session.token = token;
      req.session.username = user.username;

      return res.redirect("/home");
    }

    // if (await bcrypt.compare(password, user.password)) {
    //   return res.send("logged in successfully");
    // } else {
    //   return res.send("invalid");
    // }

    return res.send("invalid credentials!!!");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

const express = require("express");
const question = require("../models/question");
const Tag = require("../models/tag");
const User = require("../models/User");
const router = express.Router();

// Get all tags with user defined tags if user is logged in
router.get("/", async (req, res, next) => {
  try {
    res.locals.token = req.session.token;
    res.locals.username = req.session.username;
    // console.log("*******", res.locals.token, "**");

    const actualTags = await Tag.find(
      {
        type: "actual_tag",
      },
      {
        _id: 0,
        tag: 1,
      }
    );

    const authorTags = await Tag.find(
      {
        type: "author",
      },
      {
        tag: 1,
        _id: 0,
      }
    );

    // Get all user defined tags for a given user
    //const userId = "5fbea60fb1160b2be07711ca";
    let userId = await User.findOne({ username: req.session.username });

    // let userDefinedTags = null;
    let userDefinedTags = null;

    if (userId) {
      userId = userId._id;
      ///  console.log("****", userId, "****");

      const data = await User.findById(userId, {
        tags: 1,
        _id: 0,
      });

      if (data) {
        userDefinedTags = data.tags;
      }
    }
    // res.send("done here");
    console.log(userDefinedTags);
    res.render("home", { authorTags, actualTags, userDefinedTags, userId });
    // res.render("home", { authorTags, actualTags, userDefinedTags});
  } catch (err) {
    res.status(500);
    res.send({ err: "Server error" });
    next(err);
  }
});

// Get all user defined tags for a given problem
router.get("/userDefinedTags/:problemId/:userId", async (req, res) => {
  // res.send("hi");
  const userId = req.params.userId;
  const problem = await question.findById(req.params.problemId);

  let val = problem.userDefinedTags.find((obj) => obj.user_id == userId);

  if (val === undefined) {
    res.send("No tags found");
  } else {
    res.send({ data: val.tags });
  }
});

module.exports = router;

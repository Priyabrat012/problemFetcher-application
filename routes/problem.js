const express = require("express");
const auth = require("../middleware/authToken");
const question = require("../models/question");
const router = express.Router();
const Question = require("../models/question");
const tag = require("../models/tag");
const Tag = require("../models/tag");
const User = require("../models/User");
// const User = require("../models/user")

// Get all problems Related to a tag(need to be changed for user defined tags)

router.post("/", auth, async (req, res) => {
  let { author, concept, userDefined } = req.body;

  // console.log("&&", req.user, "&&");
  //console.log(req.body.tokenValue, "*****");
  const username = req.user.username;
  //const userId = "5fbea60fb1160b2be07711ca";
  let userId = null;
  const user = await User.find({ username: username });
  // userDefined = ["webdev"]
  if (user) {
    // console.log("((((", user, "))))");
    userId = user._id;
  }
  if (typeof author === "string") {
    author = [author];
  }
  if (typeof concept === "string") {
    concept = [concept];
  }
  if (typeof userDefined === "string") {
    userDefined = [userDefined];
  }

  if (typeof author === "undefined") {
    author = [];
  }
  if (typeof concept === "undefined") {
    concept = [];
  }
  if (typeof userDefined === "undefined") {
    userDefined = [];
  }

  let tags = [...author, ...concept, ...userDefined];

  //(tokenValue);
  // console.log("**", tags, "**", req.body, "**");
  if (userId === null) {
    try {
      const questions = await Question.find(
        {
          tags: {
            $all: tags,
          },
        },
        { userDefinedTags: 0 }
      );

      res.locals.idd = userId;
      console.log(res.locals.idd);

      res.render("allproblem", { data: questions });
    } catch (err) {
      res.status(400);
      res.send(err);
    }
  } else {
    try {
      const questions = await Question.find({
        $or: [
          {
            tags: {
              $all: tags,
            },
          },
          {
            $and: [
              {
                "userDefinedTags.tags": {
                  $all: tags,
                },
              },
              {
                "userDefinedTags.user_id": userId,
              },
            ],
          },
        ],
      });
      res.render("allproblem", { data: questions });
    } catch (err) {
      res.status(500).send({ err: "Error fetching problems" });
    }
  }
});

// Add user defined tag to a problem
router.post("/addNewTag/:problemId/", async (req, res, next) => {
  const username = req.user;
  //const userId = "5fbea60fb1160b2be07711ca";
  let userId = null;
  const user = await User.find({ username: username });
  //const userId = "5fbea60fb1160b2be07711ca";
  const problemId = req.params.problemId;
  const { newTag } = req.body;

  try {
    let foundActualTag = await Tag.findOne({ tag: newTag });

    let updateUserTags = null;

    // To show on homepage user defined tags
    // if (! foundActualTag) { // Add tag to user model
    //     updateUserTags = await User.findById({
    //         _id: userId
    //     })
    //     // , {
    //     //     $addToSet: {
    //     //         tags: newTag
    //     //     }
    //     // });
    // }

    let problemTags = await Question.findById(problemId, {
      _id: 0,
      tags: 1,
    });
    console.log("problme tags", problemTags);

    let updateProblem = await Question.findOneAndUpdate(
      {
        _id: problemId,
        "userDefinedTags.user_id": {
          $eq: userId,
        },
      },
      {
        $addToSet: {
          "userDefinedTags.$.tags": newTag,
        },
      }
    );

    if (updateProblem === null) {
      updateProblem = await Question.findByIdAndUpdate(
        problemId,
        {
          $push: {
            userDefinedTags: {
              user_id: userId,
              tags: [newTag, ...problemTags.tags],
            },
          },
        },
        {
          userDefinedTags: 1,
          _id: 0,
        }
      );
    }

    res.send("hii");

    // updateProblem = await Question.findOne({
    //     _id: problemId,
    //     "userDefinedTags.user_id": {
    //         $eq: userId
    //     }
    // }, {
    //     _id: 0,
    //     userDefinedTags: 1
    // });

    // res.send({updateUserTags, updateProblem});
  } catch (err) {
    console.log(err);
    res.status(400);
    res.send({ err: "Trouble adding tag." });
  }
});

router.get("/problem/:userId", (req, res) => {
  res.locals.userId = req.params.userId;
  console.log(res.locals.userId);
  res.render("newProblem.ejs");
});

router.post("/problem/:userId", async (req, res) => {
  console.log("&&", req.params.userId, "&&");
  const problemName = req.body.problemName;
  const tags = req.body.tags.split(" ");

  console.log(problemName, tags);

  // res.send("Hii")
  const user = await User.findOne({ _id: req.params.userId });
  const userName = user.username;
  console.log(userName);
  const data = await question.create({
    author: userName,
    problemName: problemName,
    tags: tags,
  });

  // const foundTag = await tag.find({ tag: "aaaaaaaaaa", type: "author" });
  const foundTag = await tag.find({ tag: userName, type: "author" });

  console.log(foundTag, "Here");

  if (!foundTag.length) {
    const newTag = await tag.create({ tag: userName, type: "author" });
  }

  res.send(data);
});

module.exports = router;

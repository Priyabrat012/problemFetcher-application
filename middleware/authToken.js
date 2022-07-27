const jwt = require("jsonwebtoken");

// const auth = async (req, res, next) => {
//   const token = req.body.tokenValue || req.params.token;

//   if (token == null) return res.send("Please log in!!");

//   let user = await jwt.verify(token, "secret key");
//   console.log("**", user, "**");

//   console.log("token", token);
//   next();
// };

const auth = async (req, res, next) => {
  try {
    const token = req.body.tokenValue || req.params.token;

    if (token === null) return res.send("nedd to log in");
    // console.log(token);
    let user = await jwt.verify(token, "secret key");
    console.log("**", user, "**");

    res.locals.username = user.fullName;

    if (!user) {
      return res.redirect("/user/login");
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("error");
    //res.redirect("/user/login");
  }
};

module.exports = auth;

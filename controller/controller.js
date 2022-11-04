const User = require("../model/model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.postLogin = async (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  let result = await User.find({ userName: username });
  if (result.length === 0) {
    res.send("Username Not Found !!!");
    return;
  }
  let passMatch = await bcrypt.compare(password, result[0].password);
  if (!passMatch) {
    res.send("Wrong Password !!!");
    return;
  }
  let token = jwt.sign({ data: username }, "abc", { expiresIn: 1800 });
  res

    .cookie("Token", token, {
      maxAge: 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json("success");
};

module.exports.postRegister = async (req, res) => {
  let salt = await bcrypt.genSalt();
  let newUser = req.body;
  newUser.password = await bcrypt.hash(newUser.password, salt);
  const user = new User(req.body);
  await user.save();

  res.send("/");
};

module.exports.isAuthenticate = async (req, res) => {
  try {
    if (req.cookies.Token) {
      let result = jwt.verify(req.cookies.Token, "abc");
      let data = await User.find({ userName: result.data });
      res.json(data);
      return;
    } else {
      res.json("not logged in");
    }
  } catch (error) {
    res.json("not logged in");
  }
};

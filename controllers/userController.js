const Users = require("../models/userModel.js");
const bcrypt = require("bcrypt");

module.exports.logginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(401)
      .json({ status: "fail", message: "username and password required" });
  try {
    const user = await Users.findOne({ username });
    if (!user)
      return res.status(401).json({
        msg: "Incorrect Username or Password",
        status: false,
      });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({
        msg: "Incorrect Username or Password",
        status: false,
      });
    // delete user.password;
    const { password: pwd, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: err.message,
    });
  }
};

module.exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const usernameCheck = await Users.findOne({ username });
    if (usernameCheck)
      return res
        .status(401)
        .json({ msg: "Username already used", status: false });
    const emailCheck = await Users.findOne({ email });
    if (emailCheck)
      return res.status(401).json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.status(200).json(user);
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: err.message,
    });
  }
};
module.exports.editUser = async (req, res) => {
  const { newUsername } = req.body;
  const { id } = req.params;

  try {
    const user = await Users.findOne({ _id: id });
    if (!user)
      return res.status(403).json({ msg: "User not exist", status: false });

    if (newUsername) {
      user.username = newUsername;
    }

    const updatedUser = await Users.findByIdAndUpdate(id, user, {
      new: true,
    }).select(["username", "email"]);
    return res.status(200).json(updatedUser);
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: err.message,
    });
  }
};
module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await Users.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ status: "success", message: "user deleted succefuly" });
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: "Failed to delete user",
    });
  }
};
module.exports.allUsers = async (req, res) => {
  const { id } = req.params;
  try {
    const users = await Users.find({ _id: { $ne: id } }).select([
      "username",
      "email",
    ]);

    return res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

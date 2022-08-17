const router = require("express").Router();

const {
  logginUser,
  registerUser,
  allUsers,
  deleteUser,
  editUser,
} = require("../controllers/userController.js");

router.post("/login", logginUser);
router.post("/register", registerUser);
router.route("/users/:id").get(allUsers).delete(deleteUser).put(editUser);

module.exports = router;

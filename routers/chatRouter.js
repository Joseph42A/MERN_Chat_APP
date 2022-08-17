const {
  addMessage,
  getMessages,
  getChats,
  getUnseenChats,
  upload,
} = require("../controllers/chatController.js");
const router = require("express").Router();

router.post("/addmsg", upload.single("media"), addMessage);
router.post("/getmsg", getMessages);
router.get("/messages", getChats);
router.post("/messages", getUnseenChats);

module.exports = router;

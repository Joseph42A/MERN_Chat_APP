const Messages = require("../models/chatModel.js");
const { v4 } = require("uuid");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public");
  },
  filename: function (req, file, cb) {
    const filename = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, v4() + "-" + filename);
  },
});
module.exports.upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (true) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("only png allowed"));
    }
  },
});

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    await Messages.updateMany(
      { $and: [{ "users.0": to }, { "users.1": from }] },
      { $set: { view: true } }
    );

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        media: msg.media,
        view: true,
      };
    });

    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.getUnseenChats = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const unseenMessages = await Messages.find({
      $and: [
        {
          $and: [{ "users.0": to }, { "users.1": from }],
        },
        {
          view: false,
        },
      ],
    }).sort({ updatedAt: 1 });

    res.status(200).json({
      length: unseenMessages.length,
      data: unseenMessages,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const { from, to, message, media, view } = req.body;
  let createdData = {};

  if (req.file) {
    createdData = {
      message: { text: "" },
      users: [from, to],
      sender: from,
      media: `${url}/public/${req.file.filename}`,
      view: view,
    };
  } else {
    createdData = {
      message: { text: message },
      users: [from, to],
      sender: from,
      media: ``,
      view: view,
    };
  }
  try {
    const data = await Messages.create(createdData);

    if (data)
      return res
        .status(201)
        .json({ msg: "Message added successfully.", media: createdData.media });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getChats = async (req, res, next) => {
  try {
    const chats = await Messages.find();
    res.status(200).json(chats);
  } catch (ex) {
    next(ex);
  }
};

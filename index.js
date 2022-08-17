const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./routers/userRouter.js");
const chatRouter = require("./routers/chatRouter.js");
const socket = require("socket.io");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.use("/public", express.static("public"));

app.use("/api", userRouter);
app.use("/api", chatRouter);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);

    console.log("DB Not connect");
  });

const server = app.listen(5000, () => console.log("App Running ON port 5000"));
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["Get", "Post"],
  },
});

global.onlineUsers = new Map();

let users = [];
let chatScreenUsers = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    addUser(userId, socket.id);
    io.emit("get-users", users);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data);
    }
  });

  socket.on("user-join-in-chatscreen", ({ users }) => {
    if (chatScreenUsers.length !== 0) {
      let isUserIncludes = false;
      chatScreenUsers = chatScreenUsers.map((el) => {
        if (el[0] === users[0]) {
          el[1] = users[1];
          isUserIncludes = true;
          return el;
        }
        return el;
      });

      if (!isUserIncludes) {
        chatScreenUsers.push(users);
      }
    } else {
      chatScreenUsers.push(users);
    }
    io.emit("users-on-screen", chatScreenUsers);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    chatScreenUsers = chatScreenUsers.filter((el) => el[2] !== socket.id);
    io.emit("get-users", users);
    io.emit("users-on-screen", chatScreenUsers);
  });
});

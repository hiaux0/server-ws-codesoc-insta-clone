// @ts-check
// Setup basic express server
var cors = require("cors");
const express = require("express");
const app = express();
const path = require("path");
// @ts-ignore
const server = require("http").createServer(app);
const { Server } = require("socket.io");

const { UserService } = require("./UserService");
const { MSG } = require("./messages");

const io = new Server(server, {
  cors: {
    origin: /.csb.app$/,
  },
});
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log("Server listening at port %d", port);
});

// Routing
// @ts-ignore
app.use(
  cors({
    origin: "*",
  })
);
// @ts-ignore
app.use(express.static(path.join(__dirname, "public")));

// Chatroom
const sockets = [];
io.on(MSG.connection["connection"], (socket) => {
  console.log("i0 - --------------------------");
  const userService = new UserService(socket);
  sockets.push(socket);

  // when the client emits 'new message', this listens and executes
  socket.on(MSG.message["new message"], (data) => {
    console.log("i0.5 - New Message --------------------------");
    console.log("i1 - ", data);
    console.log("i1.02 - ", sockets.length);
    console.log("i1.05 - ", userService.users);

    const author = userService.getUser(socket.id);
    console.log("i1.1 - ", author);
    console.log(`i2 - Author was: ${author?.username}`);

    // we tell the client to execute 'new message'
    socket.broadcast.emit(MSG.message["new message"], {
      username: socket.username,
      message: data,
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on(MSG.user["add user"], (username) => {
    console.log(socket.id);
    // we store the username in the socket session for this client
    socket.username = username;
    userService.addUser({ id: socket.id, username });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on(MSG.message["typing"], () => {
    socket.broadcast.emit(MSG.message["typing"], {
      username: socket.username,
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on(MSG.message["stop typing"], () => {
    socket.broadcast.emit(MSG.message["stop typing"], {
      username: socket.username,
    });
  });

  // when the user disconnects.. perform this
  socket.on(MSG.connection["disconnect"], () => {
    // if (addedUser) {
    //   userService.removeUser({ username: socket.username });
    // }
  });
});

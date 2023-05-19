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
const { SocketService } = require("./SocketService");
const { MSG } = require("./messages");

const io = new Server(server, {
  cors: {
    // origin: /.csb.app$/,
    origin: /localhost/,
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
  }),
);
// @ts-ignore
app.use(express.static(path.join(__dirname, "public")));

// Chatroom
const socketService = new SocketService();
const userService = new UserService(socketService);
io.on(MSG.connection["connection"], (socket) => {
  console.log("i0 - -------------------------------------------------");
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: index.js ~ line 43 ~ socket.id', socket.id)
  const currentDate = new Date();
  console.log(
    currentDate.toLocaleTimeString() + " " + currentDate.getUTCSeconds() + "s",
  );

  socketService.addSocket(socket);
  socketService.report();
  userService.report();

  socket.emit(MSG.connection["connection created"], socket.id);

  // when the client emits 'new message', this listens and executes
  socket.on(MSG.message["new message"], (data) => {
    console.log("i1 - New Message --------------------------");
    const asJson = JSON.parse(data);

    const receiverId = asJson.receiver.id;
    const receiverSocket = socketService.getSocket(receiverId);

    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: index.js ~ line 63 ~ receiverSocket.id', receiverSocket.id)
    receiverSocket.emit(MSG.message["new message"], {
      username: socket.username,
      message: asJson.message,
    });
    // should just tell one client

    // we tell the client to execute 'new message'
    // socket.broadcast.emit(MSG.message["new message"], {
    //   username: socket.username,
    //   message: data,
    // });
  });

  // when the client emits 'add user', this listens and executes
  socket.on(MSG.user["add user"], (username) => {
    if (username === "") return;
    // we store the username in the socket session for this client
    userService.addUser({ id: socket.id, username });
  });

  socket.on(MSG.user["change username"], (username) => {
    if (username === "") return;
    userService.changeUsername({ id: socket.id, username });
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
    userService.removeUser(socket.id);
    socketService.removeSocket(socket.id);
  });
});

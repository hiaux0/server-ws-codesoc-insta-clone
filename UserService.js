// @ts-check

const { MSG } = require("./messages");

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string | null} username
 */

class UserService {
  /** @type {User[]} */
  users = [];
  socketService;

  constructor(socketService) {
    this.socketService = socketService;
  }

  report() {
    console.log(
      ">>>> USER REPORT --------------------------------------------------------------",
    );
    console.log(`There are ${this.users.length} users.`);
    this.users.forEach((user, index) => {
      console.log(`    (${index + 1}) - ${user.username} - ${user.id}`);
    });
  }

  /**
   * @param {string} usersSocketId
   */
  getSocketForUser(usersSocketId) {
    const target = this.socketService.getSocket(usersSocketId);
    return target;
  }

  /** @param {string} id */
  getUser(id) {
    const target = this.users.find((user) => user.id === id);
    return target;
  }

  /** @param {User} newUser */
  addUser(newUser) {
    // TODO: note, this is a username check, think about relation to .id
    const alreadyExists = this.users.find((user) => user.id === newUser.id);
    const socket = this.getSocketForUser(newUser.id);

    if (alreadyExists !== undefined) {
      alreadyExists.username = socket.emit(MSG.user["user already exists"]);
      return;
    }

    this.users.push(newUser);

    socket.emit(MSG.auth["login"], {
      numUsers: this.users.length,
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit(MSG.user["user joined"], {
      username: newUser.username,
      numUsers: this.users.length,
    });
    socket.broadcast.emit(MSG.user["updateUserList"], {
      users: this.users,
    });
    socket.emit(MSG.user["updateUserList"], {
      users: this.users,
    });

    return this.users;
  }

  /** @param {User} user */
  changeUsername(user) {
    const targetUser = this.getUser(user.id);
    if (!targetUser) return;

    const oldUsername = targetUser.username;
    targetUser.username = user.username;

    const payload = {
      oldUsername,
      username: user.username,
    };
    this.getSocketForUser(user.id).broadcast.emit(
      MSG.user["change username"],
      payload,
    );
  }

  /**
   * @param {string} userId
   */
  removeUser(userId) {
    const socket = this.getSocketForUser(userId);
    const user = this.getUser(userId);

    const updated = this.users.filter((user) => user.id !== userId);
    this.users = updated;

    // echo globally that this client has left
    socket?.broadcast.emit(MSG.user["user left"], {
      username: user?.username,
      numUsers: this.users.length,
    });
  }
}

module.exports = { UserService };

// @ts-check

const { MSG } = require("./messages");

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 */

class UserService {
  /** @type {User[]} */
  users = [];
  socket;

  constructor(socket) {
    this.socket = socket;
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

    if (alreadyExists !== undefined) {
      alreadyExists.username = this.socket.emit(
        MSG.user["user already exists"],
      );
      return;
    }

    this.users.push(newUser);

    this.socket.emit(MSG.auth["login"], {
      numUsers: this.users.length,
    });
    // echo globally (all clients) that a person has connected
    this.socket.broadcast.emit(MSG.user["user joined"], {
      username: newUser.username,
      numUsers: this.users.length,
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
    this.socket.broadcast.emit(MSG.user["change username"], payload);
  }

  /**
   * @param {string} userId
   */
  removeUser(userId) {
    const updated = this.users.filter((user) => user.id === userId);
    this.users = updated;

    // echo globally that this client has left
    this.socket.broadcast.emit(MSG.user["user left"], {
      username: this.socket.username,
      numUsers: this.users.length,
    });
  }
}

module.exports = { UserService };

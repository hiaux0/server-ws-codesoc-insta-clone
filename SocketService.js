// @ts-check

class SocketService {
  sockets = [];

  report() {
    console.log(`There are currently ${this.sockets.length} sockets open.`);
  }

  addSocket(socket) {
    this.sockets.push(socket);
  }

  removeSocket(socketId) {
    const filtered = this.sockets.filter((socket) => socket.id === socketId);
    this.sockets = filtered;
  }
}

module.exports = { SocketService };

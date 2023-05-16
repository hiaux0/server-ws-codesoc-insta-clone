// @ts-check

class SocketService {
  sockets = [];

  report() {
    console.log(`There are currently ${this.sockets.length} sockets open.`);
  }

  getSocket(socketId) {
    const target = this.sockets.find((s) => s.id === socketId);
    return target;
  }

  addSocket(socket) {
    const existing = this.getSocket(socket.id);
    if (existing) return;
    this.sockets.push(socket);
  }

  removeSocket(socketId) {
    const filtered = this.sockets.filter((socket) => socket.id !== socketId);
    this.sockets = filtered;
  }
}

module.exports = { SocketService };

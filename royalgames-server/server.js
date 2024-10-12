const express = require('express');
const cors = require('cors');

const app = express();

class Server {
  constructor() {
    const port = process.env.PORT || 3001;
     const http = require('http');
    const server = http.createServer(app);
    const SocketIo = require("socket.io");
    const io = new SocketIo.Server(server, {
      cors: {
        origin: "https://royalgamescasino.onrender.com",
      },
    });

    app.use(express.static(__dirname + '/public'));

    app.get('/', (req, res) => {
      res.sendFile(__dirname + '/public/index.html');
    });

    app.use((req, res) => {
      res.sendFile(__dirname + '/public/index.html');
    });

    io.on('connection', (socket) => {
      console.log('a user connected');
    });

    this.app = app;
    this.server = server;
    this.io = io;
    this.port = port;
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`App listening on port ${this.port}`)
    });

    return this.io;
  }
}

module.exports = Server;

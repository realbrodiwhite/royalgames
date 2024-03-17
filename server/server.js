const express = require('express');
const path = require('path');
const app = express();

class Server {
  constructor() {
    const port = process.env.PORT || 10000;
    const app = express();
    const http = require('http');
    const server = http.createServer(app);
    const SocketIo = require("socket.io");
    const io = new SocketIo.Server(server, {
      cors: {
        origin: "*",
      },
    });

    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '../client/build/')));


    // The "catch-all" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'));
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
      console.log(`Example app listening on port ${this.port}`)
    });

    return this.io;
  }
}

module.exports = Server;
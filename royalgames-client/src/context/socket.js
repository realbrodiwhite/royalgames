// socket.js - Client-side Socket.IO integration

import React from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('newUser', (message) => {
  console.log(message);
});

socket.on('userLeft', (message) => {
  console.log(message);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

const SocketContext = React.createContext();

// ... (rest of the file)

export { socket, SocketContext };

// socket.js - Client-side Socket.IO integration

import React, { useEffect, useState, createContext, useContext } from 'react';
import io from 'socket.io-client';

// Create a context for the socket
const socket = createContext();

// Custom hook to use the socket
export const useSocket = () => {
  return useContext(socket);
};

// Socket provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(process.env.REACT_APP_SERVER, {
      withCredentials: true,
    });

    // Set the socket instance in state
    setSocket(socketInstance);

    // Handle socket events
    socketInstance.on('connect', () => {
      console.log('Connected to server');
    });

    socketInstance.on('newUser ', (message) => {
      console.log(message);
    });

    socketInstance.on('userLeft', (message) => {
      console.log(message);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
      console.log('Socket disconnected');
    };
  }, []);

  return (
    <socket.Provider value={socket}>
      {children}
    </socket.Provider>
  );
};

// Export the context for use in components
export { socket };
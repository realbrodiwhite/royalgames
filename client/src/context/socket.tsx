// src/context/socket.tsx

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketContextProps {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextProps>({
  socket: null,
});

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize the socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3000');

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Memoized function to handle reconnection attempts
  const retryConnect = useCallback((): void => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  // Memoized event handlers
  const handleConnect = useCallback((): void => {
    console.log('Socket connected');
    // Additional logic on connect
  }, []);

  const handleDisconnect = useCallback((): void => {
    console.log('Socket disconnected');
    // Attempt to reconnect
    retryConnect();
  }, [retryConnect]);

  // Set up event listeners
  useEffect(() => {
    if (socket) {
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      // Clean up event listeners on unmount or when socket changes
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [socket, handleConnect, handleDisconnect]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

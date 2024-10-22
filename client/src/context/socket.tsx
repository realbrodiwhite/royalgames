import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useContext
} from 'react';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
}

// Create context with a default value
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Custom hook for using the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Use production URL or fallback to environment PORT
    const SOCKET_URL = process.env.NODE_ENV === 'production' 
      ? 'https://royalgamescasino.onrender.com'
      : `http://localhost:${process.env.PORT || 3000}`;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const retryConnect = useCallback(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  const handleConnect = useCallback(() => {
    console.log('Socket connected');
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('Socket disconnected');
    retryConnect();
  }, [retryConnect]);

  useEffect(() => {
    if (socket) {
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

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

export { SocketContext };
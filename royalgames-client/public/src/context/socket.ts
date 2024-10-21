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

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const retryConnect = useCallback((): void => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  const handleConnect = useCallback((): void => {
    console.log('Socket connected');
  }, []);

  const handleDisconnect = useCallback((): void => {
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

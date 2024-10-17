import React, { useEffect, useState, createContext, useContext } from 'react';
import io, { Socket } from 'socket.io-client';

interface ISocketContext {
  socket: Socket | null;
  error: string | null;
}

const SocketContext = createContext<ISocketContext>({ socket: null, error: null });

export const useSocket = () => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const retryConnect = () => {
      const socketInstance: Socket = io(process.env.REACT_APP_SERVER, {
        withCredentials: true,
      });

      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Connected to server');
      });

      socketInstance.on('newUser    ', (message) => {
        console.log(message);
      });

      socketInstance.on('userLeft', (message) => {
        console.log(message);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from server');
        // retryConnect();
      });

      socketInstance.on('error', (error) => {
        setError(error.message);
        console.error('Socket error:', error);

        setRetryCount((r) => r + 1);

        if (retryCount < 3) {
          // Retry the connection after 1 second
          setTimeout(retryConnect, 1000);
        } else {
          // Display an error message after 3 retries
          setError('Failed to connect to the server. Please try again later.');
        }
      });

      return () => {
        socketInstance.disconnect();
        setSocket(null);
        console.log('Socket disconnected');
      };
    };

    retryConnect();
  }, [retryCount]);

  if (error) {
    return (
      <div>
        <h2>Error</h2>
        <p>{error}</p>
        <p>Please try again later or contact support if the issue persists.</p>
      </div>
    );
  }

  return (
    <SocketContext.Provider value={{ socket, error }}>
      {children}
    </SocketContext.Provider>
  );
};
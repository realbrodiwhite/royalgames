import React, { useEffect, useState, createContext, useContext } from 'react';
import type { FC, ReactNode } from 'react';
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
  children: ReactNode;
}

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const connectToSocket = (url: string) => {
    try {
      const socketInstance: Socket = io(url, {
        withCredentials: true,
      });

      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Connected to server');
      });

      socketInstance.on('newUser  ', (message) => {
        console.log(message);
      });

      socketInstance.on('userLeft', (message) => {
        console.log(message);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from server');
        retryConnect();
      });

      socketInstance.on('error', (error) => {
        handleSocketError(error);
      });

      return () => {
        socketInstance.disconnect();
        setSocket(null);
        console.log('Socket disconnected');
      };
    } catch (error) {
      handleSocketError(error);
    }
  };

  const handleSocketError = (error: Error) => {
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
  };

  const retryConnect = () => {
    if (!process.env.REACT_APP_SERVER) {
      setError('Server URL is not set. Please configure the environment variable.');
      return;
    }

    connectToSocket(process.env.REACT_APP_SERVER);
  };

  useEffect(() => {
    retryConnect();
  }, [retryCount]);

  if (error) {
    return (
      <ErrorDisplay error={error} />
    );
  }

  return (
    <SocketContext.Provider value={{ socket, error }}>
      {children}
    </SocketContext.Provider>
  );
};

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: FC<ErrorDisplayProps> = ({ error }) => {
  const handleRetry = () => {
    retryConnect();
  };

  return (
    <div>
      <h2>Error</h2>
      <p>{error}</p>
      <p>
        Please try again later or contact support if the issue persists.
        <button onClick={handleRetry}>Retry</button>
      </p>
    </div>
  );
};
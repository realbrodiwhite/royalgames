import { createContext } from 'react';
import { io } from 'socket.io-client';
import { SocketConfig } from '@types/socket';

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);
export const SocketContext = createContext(socket);
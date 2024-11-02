import { useContext } from 'react';
import { SocketContext } from '@context/socket';

export const useSocket = () => {
  return useContext(SocketContext);
};
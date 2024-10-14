// lobbySlice.js - Redux slice for lobby state management

import { createSlice } from '@reduxjs/toolkit';
import socket from './socket';

const initialState = {
  lobbyId: null,
  users: [],
};

const lobbySlice = createSlice({
  name: 'lobby',
  initialState,
  reducers: {
    joinLobby: (state, action) => {
      state.lobbyId = action.payload.lobbyId;
      socket.emit('joinLobby', action.payload.lobbyId);
    },
    leaveLobby: (state) => {
      if (state.lobbyId) {
        socket.emit('leaveLobby', state.lobbyId);
      }
      state.lobbyId = null;
    },
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    removeUser: (state, action) => {
      state.users = state.users.filter(user => user !== action.payload);
    },
  },
});

export const { joinLobby, leaveLobby, addUser, removeUser } = lobbySlice.actions;
export default lobbySlice.reducer;   
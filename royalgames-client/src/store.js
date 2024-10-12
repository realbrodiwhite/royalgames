// store.js - Setting up the Redux store

import { configureStore } from '@reduxjs/toolkit';
import lobbyReducer from './lobbySlice';

const store = configureStore({
  reducer: {
    lobby: lobbyReducer,
  },
});

export default store;

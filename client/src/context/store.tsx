import { configureStore } from '@reduxjs/toolkit';
import lobbyReducer from './lobbySlice';
import adminReducer from "./adminSlice";

const store = configureStore({
  reducer: {
    lobby: lobbyReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

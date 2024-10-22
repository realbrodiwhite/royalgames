import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  // Add other user properties here
}

interface AdminState {
  adminId: string | null;
  users: User[];
}

const initialState: AdminState = {
  adminId: null,
  users: []
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    joinAdmin: (state: AdminState, action: PayloadAction<string>) => {
      state.adminId = action.payload;
    },
    leaveLobby: (state: AdminState) => {
      state.adminId = null;
      state.users = [];
    },
    addUser: (state: AdminState, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    removeUser: (state: AdminState, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    leaveAdmin: (state: AdminState) => {
      state.adminId = null;
      state.users = [];
    },
  },
});

export const { joinAdmin, leaveLobby, addUser, removeUser, leaveAdmin } = adminSlice.actions;
export default adminSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: '',
  messages: [],
  roomUsers: [],
  isConnected: false
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setRoomUsers: (state, action) => {
      state.roomUsers = action.payload;
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.roomUsers = [];
      state.isConnected = false;
    }
  }
});

export const { 
  setUsername, 
  addMessage, 
  setRoomUsers, 
  setConnectionStatus, 
  clearChat
} = chatSlice.actions;

export default chatSlice.reducer;
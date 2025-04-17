import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  messages: [], //include information about {sender,content,timestamp}
};

const peerSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});
export const { addMessage, clearMessages } = peerSlice.actions;
export default peerSlice.reducer;

import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./features/chatSlice.jsx";
const store = configureStore({
    reducer: {
        chat: chatReducer,
    },
});
export default store;
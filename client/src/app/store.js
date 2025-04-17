import { configureStore } from '@reduxjs/toolkit';
import { chatReducer, peerReducer, roomReducer } from '../features/index';

export const store = configureStore({
    reducer:{
        room: roomReducer,
        peer: peerReducer,
        chat: chatReducer,
    },
});
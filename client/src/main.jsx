import "./process-polyfill.js"; // Add this line at the top
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import App from "./App.jsx";
import "./index.css";
import chatReducer from "./features/chatSlice.jsx";

// Create Redux store
const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
});

// Render the app
ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);

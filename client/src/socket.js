// // client/src/socket.js
// import { io } from "socket.io-client";
// const socket = io("http://localhost:5000");
// export default socket;
import { io } from 'socket.io-client';

// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development';
// Add this to socket.js for development only
if (process.env.NODE_ENV === 'development') {
    // This is ONLY for development - not for production
    // It allows WebRTC to work with self-signed certificates
    window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    if (window.RTCPeerConnection) {
        const originalRTCPeerConnection = window.RTCPeerConnection;
        window.RTCPeerConnection = function (...args) {
            if (args[0] && args[0].certificates) {
                delete args[0].certificates;
            }
            return new originalRTCPeerConnection(...args);
        };
        window.RTCPeerConnection.prototype = originalRTCPeerConnection.prototype;
    }
}
// Use HTTPS in development with self-signed certificate
const socketUrl = isDevelopment
    ? 'https://localhost:3001'
    : window.location.origin;

// Socket.io configuration
const socket = io(socketUrl, {
    transports: ['websocket'],
    secure: true,
    rejectUnauthorized: false // Accept self-signed certificate in development
});

// Socket event handlers
socket.on('connect', () => {
    console.log('Connected to socket server with ID:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected from socket server:', reason);
});

export default socket;
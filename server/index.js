// server/index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins (for development)
        methods: ['GET', 'POST'],
    },
});

app.use(cors());

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', socket.id);
    });

    socket.on('send-message', ({ roomId, message }) => {
        socket.to(roomId).emit('receive-message', { sender: socket.id, message });
    });

    socket.on('send-offer', (data) => {
        socket.to(data.roomId).emit('receive-offer', data);
    });

    socket.on('send-answer', (data) => {
        socket.to(data.roomId).emit('receive-answer', data);
    });

    socket.on('send-ice-candidate', (data) => {
        socket.to(data.roomId).emit('receive-ice-candidate', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});

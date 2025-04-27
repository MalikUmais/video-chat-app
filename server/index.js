const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

let server;
const certPaths = [
    {
        key: path.join(__dirname, 'localhost+2-key.pem'),
        cert: path.join(__dirname, 'localhost+2.pem')
    },
    {
        key: path.join(__dirname, 'certs', 'localhost+2-key.pem'),
        cert: path.join(__dirname, 'certs', 'localhost+2.pem')
    },
    {
        key: path.join(__dirname, 'certs', 'key.pem'),
        cert: path.join(__dirname, 'certs', 'cert.pem')
    }
];

let certLoaded = false;
for (const certPath of certPaths) {
    try {
        if (fs.existsSync(certPath.key) && fs.existsSync(certPath.cert)) {
            const privateKey = fs.readFileSync(certPath.key, 'utf8');
            const certificate = fs.readFileSync(certPath.cert, 'utf8');
            server = https.createServer({ key: privateKey, cert: certificate }, app);
            console.log(`HTTPS server created with certificates from ${path.dirname(certPath.key)}`);
            certLoaded = true;
            break;
        }
    } catch (error) {
        console.error(`Error loading certificates from ${path.dirname(certPath.key)}:`, error.message);
    }
}

if (!certLoaded) {
    console.warn('No SSL certificates found. Falling back to HTTP.');
    server = http.createServer(app);
}

const io = new Server(server, {
    transports: ['websocket'],
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const rooms = new Map();

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on('join-room', ({ roomId, username }) => {
        console.log(`${username} joined room ${roomId}`);

        // Leave all other rooms except its private room (socket.id)
        [...socket.rooms].forEach(room => {
            if (room !== socket.id) socket.leave(room);
        });

        socket.join(roomId);

        if (!rooms.has(roomId)) rooms.set(roomId, new Map());
        rooms.get(roomId).set(socket.id, { username });

        const users = Array.from(rooms.get(roomId)).map(([userId, data]) => ({
            userId,
            username: data.username
        }));

        socket.emit('all-users', { users });
        socket.to(roomId).emit('user-joined', { userId: socket.id, username });

        io.to(roomId).emit('room-users', { users });
    });

    socket.on('signal', ({ to, signal, from }) => {
        io.to(to).emit('signal', { signal, from });
    });

    socket.on('leave-room', ({ roomId }) => {
        handleLeave(socket, roomId);
    });

    socket.on('disconnect', () => {
        for (const [roomId] of rooms.entries()) {
            handleLeave(socket, roomId);
        }
    });

    function handleLeave(socket, roomId) {
        if (!rooms.has(roomId)) return;
        const users = rooms.get(roomId);
        if (!users.has(socket.id)) return;

        console.log(`${socket.id} left room ${roomId}`);
        users.delete(socket.id);

        socket.to(roomId).emit('user-left', { userId: socket.id });

        if (users.size === 0) {
            rooms.delete(roomId);
            console.log(`Deleted empty room ${roomId}`);
        } else {
            const updatedUsers = Array.from(users).map(([userId, data]) => ({
                userId,
                username: data.username
            }));
            io.to(roomId).emit('room-users', { users: updatedUsers });
        }
    }
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        secure: server instanceof https.Server,
        socketConnections: io.engine.clientsCount
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on ${PORT} (${server instanceof https.Server ? 'HTTPS' : 'HTTP'})`);
    if (!(server instanceof https.Server)) {
        console.warn('⚠️ WebRTC needs HTTPS in production!');
    }
});

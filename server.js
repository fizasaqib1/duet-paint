const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve all static files from root
app.use(express.static(path.join(__dirname)));

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create HTTP server
const server = http.createServer(app);

// Socket.io server
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
    socket.on('preview', (data) => socket.broadcast.emit('preview', data));
    socket.on('cursor', (data) => socket.broadcast.emit('cursor', data));
    socket.on('clearCanvas', () => io.emit('clearCanvas'));

    socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

// Start server
server.listen(3000, () => console.log('Server running on port 3000'));

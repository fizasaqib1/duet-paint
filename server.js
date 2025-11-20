const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('drawing', data => socket.broadcast.emit('drawing', data));
  socket.on('cursor', data => socket.broadcast.emit('cursor', data));
  socket.on('clearCanvas', () => io.emit('clearCanvas'));

  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port', process.env.PORT || 3000);
});

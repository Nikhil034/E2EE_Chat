const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// In-memory key store: socketId -> publicKey (JWK)
const publicKeys = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Client registers their public key
  socket.on('register-key', (jwkPublicKey) => {
    publicKeys[socket.id] = jwkPublicKey;
    // Broadcast updated peer list (id + public key) to everyone
    io.emit('peer-list', Object.entries(publicKeys).map(([id, key]) => ({ id, key })));
    console.log(`Key registered for ${socket.id}`);
  });

  // Relay encrypted message to target peer only
  socket.on('send-message', ({ to, ciphertext, iv, senderPublicKey }) => {
    io.to(to).emit('receive-message', {
      from: socket.id,
      ciphertext,
      iv,
      senderPublicKey,
    });
  });

  socket.on('disconnect', () => {
    delete publicKeys[socket.id];
    io.emit('peer-list', Object.entries(publicKeys).map(([id, key]) => ({ id, key })));
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(3000, () => console.log('Server running at http://localhost:3000'));

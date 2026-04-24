const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

// In-memory key store: socketId -> exported public keys (JWK)
const publicKeys = {};

function getPeerList() {
  return Object.entries(publicKeys).map(([id, keys]) => ({
    id,
    encryptKey: keys.encryptKey,
    signKey: keys.signKey,
  }));
}

function broadcastPeerList() {
  io.emit("peer-list", getPeerList());
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Client registers their public key
  socket.on("register-key", ({ encryptKey, signKey }) => {
    publicKeys[socket.id] = { encryptKey, signKey };
    broadcastPeerList();
    console.log(`Keys registered for ${socket.id}`);
  });

  // Relay encrypted message to target peer only
  socket.on(
    "send-message",
    ({ to, ciphertext, iv, senderPublicKey, senderSigningKey, signature, msgId }) => {
      if (!to) {
        return;
      }

      io.to(to).emit("receive-message", {
        from: socket.id,
        ciphertext,
        iv,
        senderPublicKey,
        senderSigningKey,
        signature,
        msgId,
      });
    },
  );

  socket.on("typing-start", ({ to }) => {
    if (!to) {
      return;
    }

    io.to(to).emit("typing-start", { from: socket.id });
  });

  socket.on("typing-stop", ({ to }) => {
    if (!to) {
      return;
    }

    io.to(to).emit("typing-stop", { from: socket.id });
  });

  socket.on("message-reaction", ({ to, msgId, emoji, action }) => {
    if (!to || !msgId || !emoji || !action) {
      return;
    }

    io.to(to).emit("message-reaction", {
      from: socket.id,
      msgId,
      emoji,
      action,
    });
  });

  // Relay delivered ack back to original sender
  socket.on("msg-delivered", ({ to, msgId }) => {
    io.to(to).emit("msg-delivered", { msgId });
  });

  // Relay read ack back to original sender
  socket.on("msg-read", ({ to, msgId }) => {
    io.to(to).emit("msg-read", { msgId });
  });

  socket.on("disconnect", () => {
    delete publicKeys[socket.id];
    broadcastPeerList();
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(3000, () =>
  console.log("Server running at http://localhost:3000"),
);

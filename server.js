const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  // First-cut attachment support for small encrypted files/images.
  maxHttpBufferSize: 10 * 1024 * 1024,
});

app.use(express.static(path.join(__dirname, "public")));

// In-memory key store: socketId -> exported public keys (JWK)
const publicKeys = {};
const groups = {};

function createGroupId() {
  return "grp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

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

function getGroupList() {
  return Object.entries(groups).map(([id, group]) => ({
    id,
    name: group.name,
    members: Array.from(group.members),
    memberCount: group.members.size,
  }));
}

function broadcastGroupList() {
  io.emit("group-list", getGroupList());
}

function isGroupMember(groupId, socketId) {
  return Boolean(groups[groupId]?.members.has(socketId));
}

function removeSocketFromGroups(socketId) {
  let changed = false;

  for (const [groupId, group] of Object.entries(groups)) {
    if (!group.members.has(socketId)) {
      continue;
    }

    group.members.delete(socketId);
    changed = true;

    if (group.members.size === 0) {
      delete groups[groupId];
    }
  }

  return changed;
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.emit("group-list", getGroupList());

  // Client registers their public key
  socket.on("register-key", ({ encryptKey, signKey }) => {
    publicKeys[socket.id] = { encryptKey, signKey };
    broadcastPeerList();
    console.log(`Keys registered for ${socket.id}`);
  });

  // Relay encrypted message to target peer only
  socket.on("send-message", ({ to, ...message }) => {
    if (!to) {
      return;
    }

    io.to(to).emit("receive-message", {
      from: socket.id,
      ...message,
    });
  });

  socket.on("request-groups", () => {
    socket.emit("group-list", getGroupList());
  });

  socket.on("create-group", ({ name }) => {
    const groupName = typeof name === "string" ? name.trim() : "";
    if (!groupName) {
      return;
    }

    const groupId = createGroupId();
    groups[groupId] = {
      name: groupName,
      members: new Set([socket.id]),
    };

    socket.join(groupId);
    broadcastGroupList();
    socket.emit("group-selected", { groupId });
  });

  socket.on("join-group", ({ groupId }) => {
    if (!groupId || !groups[groupId]) {
      return;
    }

    groups[groupId].members.add(socket.id);
    socket.join(groupId);
    broadcastGroupList();
  });

  socket.on("leave-group", ({ groupId }) => {
    if (!groupId || !groups[groupId]) {
      return;
    }

    groups[groupId].members.delete(socket.id);
    socket.leave(groupId);

    if (groups[groupId].members.size === 0) {
      delete groups[groupId];
    }

    broadcastGroupList();
  });

  socket.on(
    "distribute-group-sender-key",
    ({ groupId, keyId, senderPublicKey, senderSigningKey, distributions }) => {
      if (
        !groupId ||
        !keyId ||
        !Array.isArray(distributions) ||
        !isGroupMember(groupId, socket.id)
      ) {
        return;
      }

      for (const distribution of distributions) {
        if (
          !distribution?.to ||
          !distribution?.ciphertext ||
          !distribution?.iv ||
          !distribution?.signature ||
          distribution.to === socket.id ||
          !isGroupMember(groupId, distribution.to)
        ) {
          continue;
        }

        io.to(distribution.to).emit("group-sender-key", {
          from: socket.id,
          groupId,
          keyId,
          ciphertext: distribution.ciphertext,
          iv: distribution.iv,
          signature: distribution.signature,
          senderPublicKey,
          senderSigningKey,
        });
      }
    },
  );

  socket.on("send-group-message", ({ groupId, ...message }) => {
    if (!groupId || !isGroupMember(groupId, socket.id)) {
      return;
    }

    socket.to(groupId).emit("receive-group-message", {
      groupId,
      from: socket.id,
      ...message,
    });
  });

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
    const groupsChanged = removeSocketFromGroups(socket.id);
    broadcastPeerList();
    if (groupsChanged) {
      broadcastGroupList();
    }
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(3000, () =>
  console.log("Server running at http://localhost:3000"),
);

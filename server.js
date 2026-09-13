const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);
const io = new Server(server, {
  // Encrypted image/video payloads are base64-wrapped JSON.
  maxHttpBufferSize: 20 * 1024 * 1024,
});

app.use((req, res, next) => {
  res.set("Referrer-Policy", "no-referrer");
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Permissions-Policy", "display-capture=()");
  if (
    req.path === "/" ||
    req.path.endsWith(".html") ||
    req.path.endsWith(".css") ||
    req.path.endsWith(".js")
  ) {
    res.set("Cache-Control", "no-store");
  }
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use(express.static(path.join(__dirname, "public")));

const publicKeys = {};
const groups = {};

function createGroupId() {
  return "grp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function sanitizeDisplayName(name) {
  if (typeof name !== "string") {
    return "";
  }

  return name.replace(/\s+/g, " ").trim().slice(0, 32);
}

function sanitizeAvatar(avatar) {
  if (typeof avatar !== "string") {
    return "";
  }

  if (!avatar.startsWith("data:image/")) {
    return "";
  }

  if (avatar.length > 120000) {
    return "";
  }

  return avatar;
}

function getPeerList() {
  return Object.entries(publicKeys).map(([id, keys]) => ({
    id,
    displayName: keys.displayName,
    avatar: keys.avatar || "",
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

function relayToPeer(socket, eventName, { to, ...payload }) {
  if (!to || typeof to !== "string" || to === socket.id) {
    return;
  }

  io.to(to).emit(eventName, {
    from: socket.id,
    ...payload,
  });
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.emit("group-list", getGroupList());

  socket.on("register-key", ({ encryptKey, signKey, displayName, avatar }) => {
    if (!encryptKey || !signKey) {
      return;
    }

    publicKeys[socket.id] = {
      encryptKey,
      signKey,
      displayName: sanitizeDisplayName(displayName) || "Anonymous",
      avatar: sanitizeAvatar(avatar),
    };
    broadcastPeerList();
    console.log(`Keys registered for ${socket.id}`);
  });

  socket.on("update-name", (displayName) => {
    if (!publicKeys[socket.id]) {
      return;
    }

    publicKeys[socket.id].displayName =
      sanitizeDisplayName(displayName) || "Anonymous";
    broadcastPeerList();
  });

  socket.on("update-profile", ({ displayName, avatar } = {}) => {
    if (!publicKeys[socket.id]) {
      return;
    }

    if (displayName !== undefined) {
      publicKeys[socket.id].displayName =
        sanitizeDisplayName(displayName) || "Anonymous";
    }

    if (avatar !== undefined) {
      publicKeys[socket.id].avatar = sanitizeAvatar(avatar);
    }

    broadcastPeerList();
  });

  socket.on("send-message", ({ to, ...message }) => {
    relayToPeer(socket, "receive-message", { to, ...message });
  });

  socket.on("request-groups", () => {
    socket.emit("group-list", getGroupList());
  });

  socket.on("create-group", ({ name }) => {
    const groupName = sanitizeDisplayName(name);
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
    relayToPeer(socket, "typing-start", { to });
  });

  socket.on("typing-stop", ({ to }) => {
    relayToPeer(socket, "typing-stop", { to });
  });

  socket.on("message-reaction", ({ to, msgId, emoji, action }) => {
    if (!to || !msgId || !emoji || !action) {
      return;
    }

    relayToPeer(socket, "message-reaction", { to, msgId, emoji, action });
  });

  socket.on("msg-delivered", ({ to, msgId }) => {
    relayToPeer(socket, "msg-delivered", { to, msgId });
  });

  socket.on("msg-read", ({ to, msgId }) => {
    relayToPeer(socket, "msg-read", { to, msgId });
  });

  socket.on("view-once-opened", ({ to, msgId }) => {
    relayToPeer(socket, "view-once-opened", { to, msgId });
  });

  socket.on("call-signal", ({ to, data }) => {
    if (!to || !data || typeof data !== "object") {
      return;
    }

    relayToPeer(socket, "call-signal", { to, data });
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

const PORT = Number(process.env.PORT) || 3000;

server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running at http://localhost:${PORT}`),
);

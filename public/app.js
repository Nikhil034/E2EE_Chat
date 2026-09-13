const socket = io();

const QUICK_REACTIONS = ["❤️", "👍", "😂", "🔥"];
const ATTACHMENT_SIZE_LIMIT = 12 * 1024 * 1024;
const NAME_STORAGE_KEY = "e2ee.displayName";
const THEME_STORAGE_KEY = "e2ee.theme";
const AVATAR_STORAGE_KEY = "e2ee.avatar";
const INSTALL_DISMISS_KEY = "e2ee.installDismissed";
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

const NAME_ADJECTIVES = [
  "Amber", "Brave", "Calm", "Dusk", "Eager", "Frost", "Gentle", "Hidden",
  "Ivory", "Jade", "Keen", "Lunar", "Misty", "Noble", "Olive", "Prime",
  "Quiet", "Rapid", "Silver", "True", "Ultra", "Vivid", "Warm", "Young",
];
const NAME_NOUNS = [
  "Aspen", "Badger", "Cedar", "Dove", "Ember", "Falcon", "Grove", "Heron",
  "Iris", "Juniper", "Kestrel", "Lotus", "Maple", "North", "Orchid", "Pine",
  "Quill", "River", "Sage", "Thistle", "Umber", "Vale", "Willow", "Yarrow",
];
const AVATAR_COLORS = [
  "#ea580c", "#ca8a04", "#16a34a", "#0d9488", "#2563eb", "#7c3aed",
  "#db2777", "#e11d48", "#0891b2", "#4f46e5", "#65a30d", "#c026d3",
];

const ICONS = {
  sun: iconPath(
    "M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1zm0 11a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zM5.5 11a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h1.5a1 1 0 0 1 1 1zm16 1a1 1 0 1 0 0-2H20a1 1 0 1 0 0 2h1.5zM7.05 7.05a1 1 0 0 1 0 1.41L6 9.52A1 1 0 0 1 4.58 8.1l1.06-1.06a1 1 0 0 1 1.41 0zm12.37 12.37a1 1 0 0 1-1.41 0L16.95 18a1 1 0 0 1 1.41-1.41l1.06 1.06a1 1 0 0 1 0 1.41zM7.05 16.95a1 1 0 0 1 1.41 0L9.52 18A1 1 0 1 1 8.1 19.42l-1.06-1.06a1 1 0 0 1 0-1.41zm12.37-12.37a1 1 0 0 1 0 1.41L18 7.05A1 1 0 0 1 16.59 5.63l1.06-1.06a1 1 0 0 1 1.41 0zM12 18a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V19a1 1 0 0 1 1-1z",
  ),
  moon: iconPath(
    "M16.5 3.5A8.5 8.5 0 1 1 4.7 14.7 7 7 0 0 0 16.5 3.5z",
  ),
  bell: iconPath(
    "M12 22a2.2 2.2 0 0 0 2.2-2.2h-4.4A2.2 2.2 0 0 0 12 22zm6.5-6.2V11a6.5 6.5 0 1 0-13 0v4.8L4 17.7V19h16v-1.3l-1.5-1.9z",
  ),
  back: iconPath("M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2z"),
  shield: iconPath(
    "M12 2 20 5v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3z",
  ),
  phone: iconPath(
    "M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.5.6 3.6.1.4 0 .7-.3 1L6.6 10.8z",
  ),
  video: iconPath(
    "M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4z",
  ),
  attach: iconPath(
    "M16.5 6.5v10a4.5 4.5 0 1 1-9 0V6a3 3 0 1 1 6 0v9.5a1.5 1.5 0 1 1-3 0V7H9v8.5a3 3 0 1 0 6 0V6a4.5 4.5 0 1 0-9 0v10.5a6 6 0 1 0 12 0V6.5h-1.5z",
  ),
  send: iconPath("M2 21l21-9L2 3v7l15 2-15 2v7z"),
  close: iconPath(
    "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  ),
};

const statusEl = document.getElementById("status");
const presenceSummaryEl = document.getElementById("presence-summary");
const notificationsBtnEl = document.getElementById("notifications-btn");
const themeBtnEl = document.getElementById("theme-btn");
const displayNameInputEl = document.getElementById("display-name-input");
const myAvatarEl = document.getElementById("my-avatar");
const avatarInputEl = document.getElementById("avatar-input");
const avatarResetBtnEl = document.getElementById("avatar-reset-btn");
const installCardEl = document.getElementById("install-card");
const installTitleEl = document.getElementById("install-title");
const installCopyEl = document.getElementById("install-copy");
const installBtnEl = document.getElementById("install-btn");
const installDismissEl = document.getElementById("install-dismiss");
const myFingerprintEl = document.getElementById("my-fingerprint");
const myFingerprintHexEl = document.getElementById("my-fingerprint-hex");
const peerFingerprintEl = document.getElementById("peer-fingerprint");
const peerFingerprintHexEl = document.getElementById("peer-fingerprint-hex");
const peerListEl = document.getElementById("peer-list");
const groupNameInputEl = document.getElementById("group-name-input");
const createGroupBtnEl = document.getElementById("create-group-btn");
const groupListEl = document.getElementById("group-list");
const leaveGroupBtnEl = document.getElementById("leave-group-btn");
const chatEl = document.getElementById("chat");
const typingIndicatorEl = document.getElementById("typing-indicator");
const attachBtnEl = document.getElementById("attach-btn");
const attachmentInputEl = document.getElementById("attachment-input");
const msgInputEl = document.getElementById("msg-input");
const sendBtnEl = document.getElementById("send-btn");
const composerEl = document.getElementById("composer");
const appEl = document.getElementById("app");
const welcomeEl = document.getElementById("welcome");
const conversationEl = document.getElementById("conversation");
const backBtnEl = document.getElementById("back-btn");
const chatAvatarEl = document.getElementById("chat-avatar");
const chatTitleEl = document.getElementById("chat-title");
const chatSubtitleEl = document.getElementById("chat-subtitle");
const verifyBtnEl = document.getElementById("verify-btn");
const audioCallBtnEl = document.getElementById("audio-call-btn");
const videoCallBtnEl = document.getElementById("video-call-btn");
const verifyModalEl = document.getElementById("verify-modal");
const verifyCloseBtnEl = document.getElementById("verify-close-btn");
const mediaModalEl = document.getElementById("media-modal");
const mediaCloseBtnEl = document.getElementById("media-close-btn");
const mediaCancelBtnEl = document.getElementById("media-cancel-btn");
const mediaSendBtnEl = document.getElementById("media-send-btn");
const mediaPreviewEl = document.getElementById("media-preview");
const mediaMetaEl = document.getElementById("media-meta");
const viewOnceRowEl = document.getElementById("view-once-row");
const viewOnceToggleEl = document.getElementById("view-once-toggle");
const lightboxEl = document.getElementById("lightbox");
const lightboxBodyEl = document.getElementById("lightbox-body");
const lightboxCloseEl = document.getElementById("lightbox-close");
const viewOnceViewerEl = document.getElementById("view-once-viewer");
const viewOnceCloseEl = document.getElementById("view-once-close");
const viewOnceBodyEl = document.getElementById("view-once-body");
const incomingCallEl = document.getElementById("incoming-call");
const incomingAvatarEl = document.getElementById("incoming-avatar");
const incomingNameEl = document.getElementById("incoming-name");
const incomingTypeEl = document.getElementById("incoming-type");
const callDeclineBtnEl = document.getElementById("call-decline-btn");
const callAcceptBtnEl = document.getElementById("call-accept-btn");
const activeCallEl = document.getElementById("active-call");
const remoteVideoEl = document.getElementById("remote-video");
const localVideoEl = document.getElementById("local-video");
const callFallbackEl = document.getElementById("call-fallback");
const callAvatarEl = document.getElementById("call-avatar");
const callPeerNameEl = document.getElementById("call-peer-name");
const callTimerEl = document.getElementById("call-timer");
const callStateEl = document.getElementById("call-state");
const callMuteBtnEl = document.getElementById("call-mute-btn");
const callCameraBtnEl = document.getElementById("call-camera-btn");
const callFlipBtnEl = document.getElementById("call-flip-btn");
const callHangupBtnEl = document.getElementById("call-hangup-btn");
const reconnectBannerEl = document.getElementById("reconnect-banner");
const toastHostEl = document.getElementById("toast-host");
const captureShieldEl = document.getElementById("capture-shield");

let myKeyPair = null;
let myPublicKeyJwk = null;
let mySigningKeyPair = null;
let mySigningPublicKeyJwk = null;
let selectedPeer = null;
let selectedGroupId = null;
let visiblePeerIds = [];
let outgoingTypingPeerId = null;
let outgoingTypingTimer = null;
let displayName = localStorage.getItem(NAME_STORAGE_KEY) || "";
let myAvatar = localStorage.getItem(AVATAR_STORAGE_KEY) || "";
let deferredInstallPrompt = null;
let nameUpdateTimer = null;
let stickToBottom = true;
let pendingMediaFile = null;
let pendingMediaUrl = null;
let viewOnceOpen = null;
let callSession = null;
let ringtoneCtx = null;
let ringtoneTimer = null;

const groups = new Map();
const peerKeys = {};
const peerSigningKeys = {};
const peerProfiles = new Map();
const typingPeers = new Set();
const messageStates = new Map();
const messageRegistry = new Map();
const groupSenderKeyState = new Map();
const conversations = new Map();
const drafts = new Map();

const WORD_LIST = [
  "alpha", "bravo", "cedar", "delta", "eagle", "flame", "globe", "hotel",
  "india", "jungle", "kite", "lemon", "mango", "north", "ocean", "paper",
  "quill", "radio", "storm", "table", "ultra", "voice", "water", "xenon",
  "yacht", "zebra", "amber", "bolt", "crane", "drift", "echo", "frost",
  "grace", "haze", "iron", "jade", "karma", "lotus", "marble", "nova",
  "orbit", "pixel", "quartz", "river", "solar", "terra", "unity", "vapor",
  "wave", "xylem", "yield", "zonal", "apex", "blaze", "comet", "dune",
  "ember", "forge", "glyph", "helix", "ionic", "jewel", "knot", "lunar",
  "maple", "nexus", "onyx", "prism", "relay", "shard", "titan", "umbra",
  "vortex", "warp", "xray", "yoke", "zone", "arch", "beam", "cliff",
  "dawn", "edge", "fern", "gate", "haven", "isle", "jolt", "lamp",
  "moss", "node", "opal", "peak", "quake", "reed", "slate", "thorn",
  "vale", "wind", "yarn", "zinc", "arc", "bay", "crest", "dial",
  "elm", "ford", "glen", "hull", "ink", "jaw", "kelp", "lake",
  "mill", "nook", "ore", "pine", "quest", "root", "sand", "tide",
  "weld", "xeno", "yew", "zest", "ashen", "birch", "coral", "dusk",
  "flint", "gust", "hawk", "ivy", "jasper", "lava", "mist", "nile",
  "peat", "quiver", "rime", "sage", "teal", "umber", "wren", "yucca",
  "zircon", "anvil", "brine", "chalk", "dew", "ebb", "fjord", "gravel",
  "hail", "ingot", "knoll", "loam", "moat", "ozone", "parch", "quoll",
  "rush", "scree", "turf", "virid", "whirl", "yarrow", "acorn", "basalt",
  "cobalt", "dross", "erode", "floe", "garnet", "hoar", "krill", "lichen",
  "marl", "nitro", "ochre", "pumice", "runoff", "schist", "talc", "vein",
  "wadi", "ylem", "agate", "berm", "cinder", "estuary", "graben", "horst",
  "invar", "kame", "levee", "outcrop", "playa", "quarry", "rift", "scarp",
  "tephra", "varve", "xenolith", "yardang", "zeolite",
];

function iconPath(d) {
  return `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="${d}"/></svg>`;
}

function generateMsgId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function peerConversationKey(id) {
  return "peer:" + id;
}

function groupConversationKey(id) {
  return "group:" + id;
}

function getSentMessageKey(msgId) {
  return "sent:" + msgId;
}

function getReceivedMessageKey(peerId, msgId) {
  return "received:" + peerId + ":" + msgId;
}

function getGroupMessageKey(groupId, senderId, msgId) {
  return `group:${groupId}:${senderId}:${msgId}`;
}

function getActiveConversationKey() {
  if (selectedPeer) {
    return peerConversationKey(selectedPeer.id);
  }
  if (selectedGroupId) {
    return groupConversationKey(selectedGroupId);
  }
  return null;
}

function ensureConversation(key) {
  if (!key) {
    return null;
  }
  if (!conversations.has(key)) {
    conversations.set(key, {
      key,
      messages: [],
      unread: 0,
      lastMessage: null,
    });
  }
  return conversations.get(key);
}

function getDisplayName(peerId) {
  if (!peerId || peerId === socket.id) {
    return displayName || "You";
  }
  return peerProfiles.get(peerId)?.displayName || "Someone";
}

function initials(name) {
  const parts = String(name || "?").trim().split(/\s+/).filter(Boolean);
  const letters = (parts[0]?.[0] || "?") + (parts[1]?.[0] || "");
  return letters.toUpperCase();
}

function avatarColor(seed) {
  const value = String(seed || "");
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getPeerAvatar(peerId) {
  if (!peerId || peerId === socket.id) {
    return myAvatar || "";
  }
  return peerProfiles.get(peerId)?.avatar || "";
}

function paintAvatar(el, name, seed, photo) {
  el.style.backgroundImage = "";
  if (photo) {
    el.textContent = "";
    el.style.background = avatarColor(seed || name);
    el.style.backgroundImage = `url("${photo}")`;
    el.classList.add("has-photo");
    return;
  }
  el.classList.remove("has-photo");
  el.textContent = initials(name);
  el.style.background = avatarColor(seed || name);
}

function refreshOwnAvatar() {
  paintAvatar(myAvatarEl, displayName || "You", socket.id || displayName, myAvatar);
  avatarResetBtnEl.hidden = !myAvatar;
}

function broadcastProfile() {
  if (!myPublicKeyJwk) {
    return;
  }
  socket.emit("update-profile", {
    displayName: displayName || "Anonymous",
    avatar: myAvatar || "",
  });
}

function compressImageFile(file, size = 128, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      const scale = Math.max(size / image.width, size / image.height);
      const drawW = image.width * scale;
      const drawH = image.height * scale;
      context.drawImage(
        image,
        (size - drawW) / 2,
        (size - drawH) / 2,
        drawW,
        drawH,
      );
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image"));
    };
    image.src = url;
  });
}

async function handleAvatarFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("Please choose an image.", "error");
    return;
  }
  try {
    const dataUrl = await compressImageFile(file);
    myAvatar = dataUrl;
    localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl);
    refreshOwnAvatar();
    broadcastProfile();
    registerPublicKeys();
    updateChatHeader();
    renderPeerList();
  } catch (error) {
    showToast(error.message || "Could not set photo.", "error");
  } finally {
    avatarInputEl.value = "";
  }
}

function clearAvatar() {
  myAvatar = "";
  localStorage.removeItem(AVATAR_STORAGE_KEY);
  refreshOwnAvatar();
  broadcastProfile();
  registerPublicKeys();
  updateChatHeader();
  renderPeerList();
}

function generateDummyNameFromJwk(jwk) {
  const seed = `${jwk?.x || ""}:${jwk?.y || ""}`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const adj = NAME_ADJECTIVES[Math.abs(hash) % NAME_ADJECTIVES.length];
  const noun = NAME_NOUNS[Math.abs(hash >>> 8) % NAME_NOUNS.length];
  return `${adj} ${noun}`;
}

function preferredTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_STORAGE_KEY, next);
  themeBtnEl.innerHTML = next === "dark" ? ICONS.sun : ICONS.moon;
  themeBtnEl.title =
    next === "dark" ? "Switch to light mode" : "Switch to dark mode";
  themeBtnEl.setAttribute("aria-label", themeBtnEl.title);
}

function toggleTheme() {
  applyTheme(
    document.documentElement.dataset.theme === "dark" ? "light" : "dark",
  );
}

function showToast(text, kind = "info") {
  const toast = document.createElement("div");
  toast.className = "toast" + (kind === "error" ? " error" : "");
  toast.textContent = text;
  toastHostEl.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

function dayKey(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDay(timestamp) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(timestamp) === dayKey(today)) {
    return "Today";
  }
  if (dayKey(timestamp) === dayKey(yesterday)) {
    return "Yesterday";
  }
  return new Date(timestamp).toLocaleDateString();
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function bytesToBase64(bytes) {
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function generateKeyPair() {
  return crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"],
  );
}

async function generateSigningKeyPair() {
  return crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
}

async function exportPublicKey(key) {
  return crypto.subtle.exportKey("jwk", key);
}

async function importPublicKey(jwk) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    [],
  );
}

async function importSigningPublicKey(jwk) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["verify"],
  );
}

async function deriveSharedKey(myPrivateKey, theirPublicKey) {
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: theirPublicKey },
    myPrivateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encrypt(aesKey, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoded,
  );
  return {
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

async function decrypt(aesKey, ciphertextB64, ivB64) {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(ivB64) },
    aesKey,
    base64ToBytes(ciphertextB64),
  );
  return new TextDecoder().decode(decrypted);
}

async function encryptBytes(aesKey, bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    bytes,
  );
  return {
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

async function decryptBytes(aesKey, ciphertextB64, ivB64) {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(ivB64) },
    aesKey,
    base64ToBytes(ciphertextB64),
  );
  return new Uint8Array(decrypted);
}

async function signMessage(privateSignKey, plaintext) {
  const encoded = new TextEncoder().encode(plaintext);
  const signatureBuffer = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateSignKey,
    encoded,
  );
  return bytesToBase64(new Uint8Array(signatureBuffer));
}

async function verifySignature(publicSignKey, plaintext, signatureB64) {
  return crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    publicSignKey,
    base64ToBytes(signatureB64),
    new TextEncoder().encode(plaintext),
  );
}

async function readFileBytes(file) {
  return new Uint8Array(await file.arrayBuffer());
}

function getAttachmentKind(mimeType) {
  if (mimeType && mimeType.startsWith("image/")) {
    return "image";
  }
  if (mimeType && mimeType.startsWith("video/")) {
    return "video";
  }
  return "file";
}

function createAttachmentMeta({ name, mimeType, size, viewOnce = false }) {
  return {
    name,
    mimeType: mimeType || "application/octet-stream",
    size,
    kind: getAttachmentKind(mimeType),
    viewOnce: Boolean(viewOnce),
  };
}

function buildTextSignaturePayload(plaintext) {
  return JSON.stringify({
    msgType: "text",
    text: plaintext,
  });
}

function buildAttachmentSignaturePayload(attachmentMeta, ciphertext, iv) {
  return JSON.stringify({
    msgType: "attachment",
    name: attachmentMeta.name,
    mimeType: attachmentMeta.mimeType,
    size: attachmentMeta.size,
    kind: attachmentMeta.kind,
    viewOnce: Boolean(attachmentMeta.viewOnce),
    ciphertext,
    iv,
  });
}

function createAttachmentUrl(bytes, mimeType) {
  return URL.createObjectURL(
    new Blob([bytes], {
      type: mimeType || "application/octet-stream",
    }),
  );
}

async function getFingerprint(cryptoKey) {
  const rawBytes = await crypto.subtle.exportKey("raw", cryptoKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", rawBytes);
  const hashBytes = new Uint8Array(hashBuffer);
  const words = [
    WORD_LIST[hashBytes[0] % WORD_LIST.length],
    WORD_LIST[hashBytes[3] % WORD_LIST.length],
    WORD_LIST[hashBytes[6] % WORD_LIST.length],
    WORD_LIST[hashBytes[9] % WORD_LIST.length],
  ];
  const hex = Array.from(hashBytes.slice(0, 8))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return { words: words.join("-"), hex };
}

function notificationsSupported() {
  return "Notification" in window;
}

function updateNotificationUI() {
  notificationsBtnEl.innerHTML = ICONS.bell;
  if (!notificationsSupported()) {
    notificationsBtnEl.disabled = true;
    notificationsBtnEl.title = "Notifications are not supported here";
    return;
  }
  if (Notification.permission === "granted") {
    notificationsBtnEl.disabled = true;
    notificationsBtnEl.title = "Notifications enabled";
    return;
  }
  if (Notification.permission === "denied") {
    notificationsBtnEl.disabled = true;
    notificationsBtnEl.title = "Notifications are blocked";
    return;
  }
  notificationsBtnEl.disabled = false;
  notificationsBtnEl.title = "Enable notifications";
}

async function requestNotifications() {
  if (!notificationsSupported()) {
    return;
  }
  await Notification.requestPermission();
  updateNotificationUI();
}

function maybeShowNotification(title, body, tag, conversationKey) {
  if (!notificationsSupported() || Notification.permission !== "granted") {
    return;
  }
  const viewingThisChat =
    !document.hidden &&
    document.hasFocus() &&
    getActiveConversationKey() === conversationKey;
  if (viewingThisChat) {
    return;
  }
  const notification = new Notification(title, { body, tag });
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

function setComposerEnabled(enabled) {
  msgInputEl.disabled = !enabled;
  sendBtnEl.disabled = !enabled;
  attachBtnEl.disabled = !enabled;
}

function resizeComposer() {
  msgInputEl.style.height = "auto";
  msgInputEl.style.height = Math.min(msgInputEl.scrollHeight, 120) + "px";
}

function currentDraftKey() {
  return getActiveConversationKey();
}

function saveDraft() {
  const key = currentDraftKey();
  if (key) {
    drafts.set(key, msgInputEl.value);
  }
}

function restoreDraft() {
  const key = currentDraftKey();
  msgInputEl.value = key ? drafts.get(key) || "" : "";
  resizeComposer();
}

function snippetFor(message) {
  if (!message) {
    return "";
  }
  if (message.attachment) {
    if (message.attachment.viewOnce) {
      return message.attachment.kind === "video"
        ? "View once video"
        : "View once photo";
    }
    if (message.attachment.kind === "image") {
      return "Photo";
    }
    if (message.attachment.kind === "video") {
      return "Video";
    }
    return message.attachment.name || "File";
  }
  return message.text || "";
}

function createDayChip(timestamp) {
  const chip = document.createElement("div");
  chip.className = "day-chip";
  chip.textContent = formatDay(timestamp);
  return chip;
}

function createSignatureBadge(verified) {
  const badge = document.createElement("span");
  badge.className = "sig-badge " + (verified ? "sig-ok" : "sig-fail");
  badge.textContent = verified ? "signed" : "unverified";
  badge.title = verified
    ? "Signature verified"
    : "Signature could not be verified";
  return badge;
}

function closeLightbox() {
  lightboxEl.hidden = true;
  lightboxBodyEl.replaceChildren();
}

function openLightbox(url, kind, name) {
  lightboxBodyEl.replaceChildren();
  if (kind === "video") {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    lightboxBodyEl.appendChild(video);
  } else {
    const image = document.createElement("img");
    image.src = url;
    image.alt = name || "Photo";
    lightboxBodyEl.appendChild(image);
  }
  lightboxEl.hidden = false;
}

function consumeViewOnce() {
  if (!viewOnceOpen) {
    return;
  }
  const { message, url } = viewOnceOpen;
  URL.revokeObjectURL(url);
  if (message.attachment) {
    message.attachment.opened = true;
    message.attachment.bytes = null;
    message.attachment.downloadUrl = null;
  }
  if (
    message.conversationKey?.startsWith("peer:") &&
    message.peerId &&
    message.msgId
  ) {
    socket.emit("view-once-opened", {
      to: message.peerId,
      msgId: message.msgId,
    });
  }
  viewOnceOpen = null;
  viewOnceViewerEl.hidden = true;
  viewOnceBodyEl.replaceChildren();
  refreshMessageAttachment(message);
}

function openViewOnce(message) {
  const attachment = message.attachment;
  if (!attachment || attachment.opened || !attachment.bytes) {
    return;
  }
  const url = createAttachmentUrl(attachment.bytes, attachment.mimeType);
  viewOnceOpen = { message, url };
  viewOnceBodyEl.replaceChildren();
  if (attachment.kind === "video") {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.controlsList = "nodownload nofullscreen noremoteplayback";
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;
    video.addEventListener("ended", consumeViewOnce);
    video.addEventListener("pause", () => {
      if (document.hidden) {
        consumeViewOnce();
      }
    });
    viewOnceBodyEl.appendChild(video);
  } else {
    const image = document.createElement("img");
    image.src = url;
    image.alt = "View once photo";
    viewOnceBodyEl.appendChild(image);
  }
  viewOnceViewerEl.hidden = false;
}

function refreshMessageAttachment(message) {
  if (!message.el) {
    return;
  }
  const host = message.el.querySelector(".attachment-host");
  if (!host) {
    return;
  }
  host.replaceChildren(createAttachmentCard(message));
}

function createAttachmentCard(message) {
  const attachment = message.attachment;
  const wrapper = document.createElement("div");
  wrapper.className = "attachment-card";

  if (
    attachment.viewOnce &&
    message.type === "received" &&
    !attachment.opened
  ) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "view-once-tile";
    const title = document.createElement("strong");
    title.textContent =
      attachment.kind === "video" ? "View once video" : "View once photo";
    const hint = document.createElement("small");
    hint.textContent = "Tap to open. It disappears after viewing.";
    tile.appendChild(title);
    tile.appendChild(hint);
    tile.addEventListener("click", (event) => {
      event.stopPropagation();
      openViewOnce(message);
    });
    wrapper.appendChild(tile);
    return wrapper;
  }

  if (
    attachment.viewOnce &&
    ((message.type === "received" && attachment.opened) ||
      (message.type === "sent" && attachment.openedByPeer))
  ) {
    const tile = document.createElement("div");
    tile.className = "opened-tile";
    const title = document.createElement("strong");
    title.textContent = "Opened";
    const hint = document.createElement("small");
    hint.textContent =
      attachment.kind === "video" ? "View once video" : "View once photo";
    tile.appendChild(title);
    tile.appendChild(hint);
    wrapper.appendChild(tile);
    if (message.type === "sent" && attachment.downloadUrl) {
      appendMediaPreview(wrapper, attachment);
    }
    return wrapper;
  }

  if (attachment.viewOnce && message.type === "sent") {
    const badge = document.createElement("div");
    badge.className = "attachment-title";
    badge.textContent =
      attachment.kind === "video" ? "View once video" : "View once photo";
    wrapper.appendChild(badge);
  }

  appendMediaPreview(wrapper, attachment);

  const titleEl = document.createElement("div");
  titleEl.className = "attachment-title";
  titleEl.textContent = attachment.name;
  wrapper.appendChild(titleEl);

  const metaEl = document.createElement("div");
  metaEl.className = "attachment-meta";
  metaEl.textContent = `${attachment.kind} · ${formatFileSize(attachment.size)}`;
  wrapper.appendChild(metaEl);
  return wrapper;
}

function appendMediaPreview(wrapper, attachment) {
  if (!attachment.downloadUrl) {
    return;
  }
  if (attachment.kind === "image") {
    const image = document.createElement("img");
    image.className = "attachment-preview";
    image.src = attachment.downloadUrl;
    image.alt = attachment.name;
    image.draggable = false;
    image.addEventListener("click", () =>
      openLightbox(attachment.downloadUrl, "image", attachment.name),
    );
    wrapper.appendChild(image);
    return;
  }
  if (attachment.kind === "video") {
    const video = document.createElement("video");
    video.className = "attachment-preview";
    video.src = attachment.downloadUrl;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.controlsList = "nodownload noremoteplayback";
    video.disablePictureInPicture = true;
    wrapper.appendChild(video);
  }
}

function createReactionChip(emoji, label) {
  const chip = document.createElement("span");
  chip.className = "reaction-chip";
  chip.textContent = `${emoji} ${label}`;
  return chip;
}

function renderReactionState(message) {
  if (!message.reactionStripEl) {
    return;
  }
  message.reactionStripEl.replaceChildren();
  if (message.localReaction) {
    message.reactionStripEl.appendChild(
      createReactionChip(message.localReaction, "you"),
    );
  }
  if (message.remoteReaction) {
    message.reactionStripEl.appendChild(
      createReactionChip(message.remoteReaction, getDisplayName(message.peerId)),
    );
  }
  for (const button of message.reactionButtons || []) {
    button.classList.toggle(
      "active",
      message.localReaction === button.dataset.emoji,
    );
  }
}

function emitReaction(message, emoji, action) {
  socket.emit("message-reaction", {
    to: message.peerId,
    msgId: message.msgId,
    emoji,
    action,
  });
}

function toggleReaction(messageKey, emoji) {
  const message = messageRegistry.get(messageKey);
  if (!message) {
    return;
  }
  if (message.localReaction === emoji) {
    message.localReaction = null;
    emitReaction(message, emoji, "remove");
    renderReactionState(message);
    return;
  }
  if (message.localReaction) {
    emitReaction(message, message.localReaction, "remove");
  }
  message.localReaction = emoji;
  emitReaction(message, emoji, "add");
  renderReactionState(message);
}

function createMessageEl(message) {
  const messageEl = document.createElement("div");
  messageEl.className = "msg msg-" + message.type;
  message.el = messageEl;

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  if (message.type === "received" && selectedGroupId) {
    const whoEl = document.createElement("div");
    whoEl.className = "who";
    whoEl.textContent = message.who;
    bubble.appendChild(whoEl);
  }

  if (message.attachment) {
    const host = document.createElement("div");
    host.className = "attachment-host";
    host.appendChild(createAttachmentCard(message));
    bubble.appendChild(host);
  } else {
    const textEl = document.createElement("div");
    textEl.className = "bubble-text";
    textEl.textContent = message.text;
    bubble.appendChild(textEl);
  }

  const meta = document.createElement("div");
  meta.className = "bubble-meta";
  const timeEl = document.createElement("span");
  timeEl.textContent = formatTime(message.timestamp);
  meta.appendChild(timeEl);

  if (message.type !== "error" && message.type !== "system") {
    meta.appendChild(createSignatureBadge(message.verified));
  }

  if (message.type === "sent") {
    const tickEl = document.createElement("span");
    tickEl.className = "tick tick-" + (message.tickStatus || "sent");
    tickEl.textContent =
      message.tickStatus === "delivered" || message.tickStatus === "read"
        ? "✓✓"
        : "✓";
    message.tickEl = tickEl;
    meta.appendChild(tickEl);
  }

  bubble.appendChild(meta);
  messageEl.appendChild(bubble);

  const reactionStripEl = document.createElement("div");
  reactionStripEl.className = "reaction-strip";
  message.reactionStripEl = reactionStripEl;
  messageEl.appendChild(reactionStripEl);

  message.reactionButtons = [];
  if (
    message.type === "received" &&
    message.peerId &&
    message.msgId &&
    message.messageKey &&
    message.conversationKey?.startsWith("peer:")
  ) {
    const picker = document.createElement("div");
    picker.className = "reaction-picker";
    for (const emoji of QUICK_REACTIONS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "reaction-btn";
      button.dataset.emoji = emoji;
      button.textContent = emoji;
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleReaction(message.messageKey, emoji);
      });
      picker.appendChild(button);
      message.reactionButtons.push(button);
    }
    messageEl.appendChild(picker);
    messageEl.addEventListener("click", () => {
      messageEl.classList.toggle("is-picker-open");
    });
  }

  renderReactionState(message);
  return messageEl;
}

function maybeScrollChat() {
  if (stickToBottom) {
    chatEl.scrollTop = chatEl.scrollHeight;
  }
}

function renderActiveConversation() {
  chatEl.replaceChildren();
  const key = getActiveConversationKey();
  const conv = key ? conversations.get(key) : null;
  if (!conv) {
    return;
  }
  let lastDay = "";
  for (const message of conv.messages) {
    const day = dayKey(message.timestamp);
    if (day !== lastDay) {
      chatEl.appendChild(createDayChip(message.timestamp));
      lastDay = day;
    }
    chatEl.appendChild(createMessageEl(message));
  }
  stickToBottom = true;
  chatEl.scrollTop = chatEl.scrollHeight;
}

function appendMessage(who, text, options = {}) {
  const {
    type = "received",
    verified = false,
    msgId = null,
    peerId = null,
    messageKey = null,
    attachment = null,
    conversationKey = getActiveConversationKey(),
  } = options;

  if (!conversationKey) {
    if (type === "error") {
      showToast(text, "error");
    }
    return null;
  }

  const conv = ensureConversation(conversationKey);
  const previous = conv.messages[conv.messages.length - 1];
  const message = {
    who,
    text,
    type,
    verified,
    msgId,
    peerId,
    messageKey,
    attachment,
    conversationKey,
    timestamp: Date.now(),
    localReaction: null,
    remoteReaction: null,
    tickStatus: type === "sent" ? "sent" : null,
    reactionButtons: [],
  };
  conv.messages.push(message);
  conv.lastMessage = message;

  const isActive = getActiveConversationKey() === conversationKey;
  if (isActive) {
    if (!previous || dayKey(previous.timestamp) !== dayKey(message.timestamp)) {
      chatEl.appendChild(createDayChip(message.timestamp));
    }
    chatEl.appendChild(createMessageEl(message));
    maybeScrollChat();
  } else if (type === "received") {
    conv.unread += 1;
    renderPeerList();
    renderGroupList();
  }

  if (messageKey) {
    messageRegistry.set(messageKey, message);
  }
  return message;
}

function updateTick(message, status) {
  message.tickStatus = status;
  if (!message.tickEl) {
    return;
  }
  if (status === "delivered") {
    message.tickEl.textContent = "✓✓";
    message.tickEl.className = "tick tick-delivered";
  } else if (status === "read") {
    message.tickEl.textContent = "✓✓";
    message.tickEl.className = "tick tick-read";
  }
}

function updatePresenceSummary() {
  const count = visiblePeerIds.length;
  presenceSummaryEl.textContent =
    count === 1 ? "1 online" : `${count} online`;
}

function updateChatHeader() {
  if (selectedPeer) {
    const name = getDisplayName(selectedPeer.id);
    paintAvatar(
      chatAvatarEl,
      name,
      selectedPeer.id,
      getPeerAvatar(selectedPeer.id),
    );
    chatTitleEl.textContent = name;
    chatSubtitleEl.textContent = typingPeers.has(selectedPeer.id)
      ? "typing…"
      : "online · end-to-end encrypted";
    verifyBtnEl.hidden = false;
    audioCallBtnEl.hidden = false;
    videoCallBtnEl.hidden = false;
    leaveGroupBtnEl.hidden = true;
    typingIndicatorEl.textContent = typingPeers.has(selectedPeer.id)
      ? `${name} is typing…`
      : "";
    return;
  }

  if (selectedGroupId) {
    const group = groups.get(selectedGroupId);
    const name = group?.name || "Group";
    paintAvatar(chatAvatarEl, name, selectedGroupId);
    chatTitleEl.textContent = name;
    const memberNames = (group?.members || []).map((id) =>
      id === socket.id ? "you" : getDisplayName(id),
    );
    chatSubtitleEl.textContent = group
      ? `${group.memberCount} members · ${memberNames.join(", ")}`
      : "Group";
    verifyBtnEl.hidden = true;
    audioCallBtnEl.hidden = true;
    videoCallBtnEl.hidden = true;
    leaveGroupBtnEl.hidden = false;
    typingIndicatorEl.textContent = "";
  }
}

function showConversation() {
  welcomeEl.hidden = true;
  conversationEl.hidden = false;
  appEl.classList.add("chat-open");
}

function hideConversation() {
  saveDraft();
  welcomeEl.hidden = false;
  conversationEl.hidden = true;
  appEl.classList.remove("chat-open");
  selectedPeer = null;
  selectedGroupId = null;
  setComposerEnabled(false);
  msgInputEl.value = "";
  renderPeerList();
  renderGroupList();
}

function createChatItem({
  id,
  name,
  seed,
  preview,
  unread,
  active,
  typing,
  showPresence = true,
  photo = "",
  onClick,
}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "chat-item" + (active ? " active" : "");
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  paintAvatar(avatar, name, seed, photo);
  const body = document.createElement("div");
  body.className = "chat-item-body";
  const row = document.createElement("div");
  row.className = "chat-item-row";
  const nameEl = document.createElement("span");
  nameEl.className = "chat-item-name";
  nameEl.textContent = name;
  row.appendChild(nameEl);
  if (unread > 0) {
    const badge = document.createElement("span");
    badge.className = "unread-badge";
    badge.textContent = String(unread);
    row.appendChild(badge);
  }
  const previewEl = document.createElement("div");
  previewEl.className = "chat-item-preview";
  if (showPresence) {
    const dot = document.createElement("span");
    dot.className = "status-dot" + (typing ? " typing" : "");
    previewEl.appendChild(dot);
    previewEl.appendChild(document.createTextNode(" "));
  }
  previewEl.appendChild(
    document.createTextNode(typing ? "typing…" : preview),
  );
  body.appendChild(row);
  body.appendChild(previewEl);
  button.appendChild(avatar);
  button.appendChild(body);
  button.addEventListener("click", onClick);
  button.dataset.id = id;
  return button;
}

function renderPeerList() {
  peerListEl.replaceChildren();
  updatePresenceSummary();
  if (visiblePeerIds.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-note";
    empty.textContent =
      "Open this page in another tab or on another device to start a chat.";
    peerListEl.appendChild(empty);
    return;
  }

  for (const peerId of visiblePeerIds) {
    const conv = conversations.get(peerConversationKey(peerId));
    const name = getDisplayName(peerId);
    peerListEl.appendChild(
      createChatItem({
        id: peerId,
        name,
        seed: peerId,
        preview: snippetFor(conv?.lastMessage) || "Tap to chat",
        unread: conv?.unread || 0,
        active: selectedPeer?.id === peerId,
        typing: typingPeers.has(peerId),
        photo: getPeerAvatar(peerId),
        onClick: () => void selectPeer(peerId),
      }),
    );
  }
}

function renderGroupList() {
  groupListEl.replaceChildren();
  if (groups.size === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-note";
    empty.textContent = "No groups yet.";
    groupListEl.appendChild(empty);
    return;
  }

  const sortedGroups = Array.from(groups.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  for (const group of sortedGroups) {
    const isMember = group.members.includes(socket.id);
    const conv = conversations.get(groupConversationKey(group.id));
    groupListEl.appendChild(
      createChatItem({
        id: group.id,
        name: group.name,
        seed: group.id,
        preview: isMember
          ? snippetFor(conv?.lastMessage) ||
            `${group.memberCount} members · joined`
          : `${group.memberCount} members · tap to join`,
        unread: conv?.unread || 0,
        active: selectedGroupId === group.id,
        typing: false,
        showPresence: false,
        onClick: () => void selectGroup(group.id),
      }),
    );
  }
}

function setDisplayName(name, { broadcast = true, persist = true } = {}) {
  const next = name.replace(/\s+/g, " ").trim().slice(0, 32);
  if (!next) {
    return;
  }
  displayName = next;
  displayNameInputEl.value = next;
  if (persist) {
    localStorage.setItem(NAME_STORAGE_KEY, next);
  }
  refreshOwnAvatar();
  if (broadcast && myPublicKeyJwk) {
    broadcastProfile();
  }
  updateChatHeader();
  renderPeerList();
}

function registerPublicKeys() {
  if (!myPublicKeyJwk || !mySigningPublicKeyJwk) {
    return;
  }
  socket.emit("register-key", {
    encryptKey: myPublicKeyJwk,
    signKey: mySigningPublicKeyJwk,
    displayName: displayName || "Anonymous",
    avatar: myAvatar || "",
  });
}

function stopOutgoingTyping(targetPeerId = outgoingTypingPeerId) {
  if (outgoingTypingTimer) {
    window.clearTimeout(outgoingTypingTimer);
    outgoingTypingTimer = null;
  }
  if (!targetPeerId) {
    outgoingTypingPeerId = null;
    return;
  }
  socket.emit("typing-stop", { to: targetPeerId });
  if (outgoingTypingPeerId === targetPeerId) {
    outgoingTypingPeerId = null;
  }
}

function scheduleTypingTimeout(targetPeerId) {
  if (outgoingTypingTimer) {
    window.clearTimeout(outgoingTypingTimer);
  }
  outgoingTypingTimer = window.setTimeout(() => {
    stopOutgoingTyping(targetPeerId);
  }, 1200);
}

function handleComposerInput() {
  resizeComposer();
  saveDraft();
  if (!selectedPeer) {
    return;
  }
  const value = msgInputEl.value.trim();
  if (!value) {
    stopOutgoingTyping();
    return;
  }
  if (outgoingTypingPeerId && outgoingTypingPeerId !== selectedPeer.id) {
    stopOutgoingTyping(outgoingTypingPeerId);
  }
  if (outgoingTypingPeerId !== selectedPeer.id) {
    socket.emit("typing-start", { to: selectedPeer.id });
    outgoingTypingPeerId = selectedPeer.id;
  }
  scheduleTypingTimeout(selectedPeer.id);
}

async function selectPeer(id) {
  const peerKey = peerKeys[id];
  if (!peerKey) {
    return;
  }
  saveDraft();
  if (outgoingTypingPeerId && outgoingTypingPeerId !== id) {
    stopOutgoingTyping(outgoingTypingPeerId);
  }
  selectedGroupId = null;
  selectedPeer = {
    id,
    key: peerKey,
    signKey: peerSigningKeys[id],
  };
  const conv = ensureConversation(peerConversationKey(id));
  conv.unread = 0;
  const { words, hex } = await getFingerprint(selectedPeer.key);
  peerFingerprintEl.textContent = words;
  peerFingerprintHexEl.textContent = hex;
  setComposerEnabled(true);
  showConversation();
  updateChatHeader();
  restoreDraft();
  renderActiveConversation();
  renderPeerList();
  renderGroupList();
  msgInputEl.focus();
}

async function selectGroup(groupId) {
  const group = groups.get(groupId);
  if (!group) {
    return;
  }
  saveDraft();
  if (!group.members.includes(socket.id)) {
    socket.emit("join-group", { groupId });
  }
  if (outgoingTypingPeerId) {
    stopOutgoingTyping(outgoingTypingPeerId);
  }
  selectedPeer = null;
  selectedGroupId = groupId;
  const conv = ensureConversation(groupConversationKey(groupId));
  conv.unread = 0;
  peerFingerprintEl.textContent = "-";
  peerFingerprintHexEl.textContent = "";
  setComposerEnabled(true);
  showConversation();
  updateChatHeader();
  restoreDraft();
  renderActiveConversation();
  renderPeerList();
  renderGroupList();
  try {
    await ensureLocalSenderKeyForGroup(groupId);
  } catch (error) {
    appendMessage("system", `[group key setup failed: ${error.message}]`, {
      type: "error",
      conversationKey: groupConversationKey(groupId),
    });
  }
  msgInputEl.focus();
}

function ensureGroupSenderKeyState(groupId) {
  if (!groupSenderKeyState.has(groupId)) {
    groupSenderKeyState.set(groupId, {
      mySenderKey: null,
      mySenderKeyId: null,
      remoteSenderKeys: {},
      pendingMessages: [],
      pendingDistributions: new Set(),
      memberSnapshot: "",
    });
  }
  return groupSenderKeyState.get(groupId);
}

async function generateSenderKey() {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

async function exportSenderKeyRaw(key) {
  return new Uint8Array(await crypto.subtle.exportKey("raw", key));
}

async function importSenderKeyRaw(bytes) {
  return crypto.subtle.importKey(
    "raw",
    bytes,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function getGroupMemberSnapshot(group) {
  return [...group.members].sort().join(":");
}

function buildSenderKeyDistributionPayload({
  groupId,
  keyId,
  recipientId,
  ciphertext,
  iv,
}) {
  return JSON.stringify({
    kind: "group-sender-key",
    groupId,
    keyId,
    recipientId,
    ciphertext,
    iv,
  });
}

function buildGroupMessageSignaturePayload({
  groupId,
  keyId,
  msgId,
  msgType,
  ciphertext,
  iv,
  attachmentMeta = null,
}) {
  return JSON.stringify({
    kind: "group-message",
    groupId,
    keyId,
    msgId,
    msgType,
    ciphertext,
    iv,
    attachmentMeta,
  });
}

function resetGroupSenderKeyState(state, memberSnapshot) {
  state.mySenderKey = null;
  state.mySenderKeyId = null;
  state.remoteSenderKeys = {};
  state.pendingMessages = [];
  state.pendingDistributions = new Set();
  state.memberSnapshot = memberSnapshot;
}

async function distributeLocalSenderKey(groupId) {
  const group = groups.get(groupId);
  if (!group || !group.members.includes(socket.id)) {
    return;
  }
  const state = ensureGroupSenderKeyState(groupId);
  if (!state.mySenderKey || !state.mySenderKeyId) {
    return;
  }
  const senderKeyBytes = await exportSenderKeyRaw(state.mySenderKey);
  const distributions = [];
  for (const memberId of group.members) {
    if (memberId === socket.id || state.pendingDistributions.has(memberId)) {
      continue;
    }
    const memberPublicKey = peerKeys[memberId];
    if (!memberPublicKey) {
      continue;
    }
    const sharedKey = await deriveSharedKey(
      myKeyPair.privateKey,
      memberPublicKey,
    );
    const { ciphertext, iv } = await encryptBytes(sharedKey, senderKeyBytes);
    const signaturePayload = buildSenderKeyDistributionPayload({
      groupId,
      keyId: state.mySenderKeyId,
      recipientId: memberId,
      ciphertext,
      iv,
    });
    const signature = await signMessage(
      mySigningKeyPair.privateKey,
      signaturePayload,
    );
    distributions.push({ to: memberId, ciphertext, iv, signature });
  }
  if (distributions.length === 0) {
    return;
  }
  socket.emit("distribute-group-sender-key", {
    groupId,
    keyId: state.mySenderKeyId,
    senderPublicKey: myPublicKeyJwk,
    senderSigningKey: mySigningPublicKeyJwk,
    distributions,
  });
  for (const distribution of distributions) {
    state.pendingDistributions.add(distribution.to);
  }
}

async function ensureLocalSenderKeyForGroup(
  groupId,
  { forceRotate = false } = {},
) {
  const group = groups.get(groupId);
  if (!group || !group.members.includes(socket.id)) {
    return null;
  }
  const state = ensureGroupSenderKeyState(groupId);
  const memberSnapshot = getGroupMemberSnapshot(group);
  const membershipChanged =
    state.memberSnapshot && state.memberSnapshot !== memberSnapshot;
  if (forceRotate || membershipChanged) {
    resetGroupSenderKeyState(state, memberSnapshot);
  } else {
    state.memberSnapshot = memberSnapshot;
  }
  if (!state.mySenderKey) {
    state.mySenderKey = await generateSenderKey();
    state.mySenderKeyId = generateMsgId();
    state.pendingDistributions = new Set();
  }
  await distributeLocalSenderKey(groupId);
  return state;
}

async function processIncomingGroupMessage(
  payload,
  { allowQueue = true } = {},
) {
  const {
    groupId,
    from,
    keyId,
    msgType = "text",
    ciphertext,
    iv,
    signature,
    msgId,
    attachmentMeta,
    senderSigningKey,
  } = payload;
  const group = groups.get(groupId);
  if (!group || !group.members.includes(socket.id)) {
    return false;
  }
  const state = ensureGroupSenderKeyState(groupId);
  const senderKeyEntry = state.remoteSenderKeys[from];
  if (!senderKeyEntry || senderKeyEntry.keyId !== keyId) {
    if (allowQueue) {
      state.pendingMessages.push(payload);
    }
    return false;
  }
  const signingKey =
    senderSigningKey && signature
      ? peerSigningKeys[from] || (await importSigningPublicKey(senderSigningKey))
      : peerSigningKeys[from] || null;
  if (signingKey) {
    peerSigningKeys[from] = signingKey;
  }
  const verified =
    signingKey && signature
      ? await verifySignature(
          signingKey,
          buildGroupMessageSignaturePayload({
            groupId,
            keyId,
            msgId,
            msgType,
            ciphertext,
            iv,
            attachmentMeta,
          }),
          signature,
        )
      : false;
  const conversationKey = groupConversationKey(groupId);
  const senderLabel = getDisplayName(from);
  if (!verified) {
    appendMessage(
      "system",
      `[group message rejected from ${senderLabel}: signature verification failed]`,
      { type: "error", conversationKey },
    );
    return true;
  }
  if (msgType === "attachment") {
    const attachmentBytes = await decryptBytes(
      senderKeyEntry.key,
      ciphertext,
      iv,
    );
    const viewOnce = Boolean(attachmentMeta?.viewOnce);
    const attachment = {
      ...attachmentMeta,
      viewOnce,
      opened: false,
      bytes: viewOnce ? attachmentBytes : null,
      downloadUrl: viewOnce
        ? null
        : createAttachmentUrl(attachmentBytes, attachmentMeta?.mimeType),
    };
    appendMessage(senderLabel, "", {
      type: "received",
      verified,
      msgId,
      messageKey: getGroupMessageKey(groupId, from, msgId),
      attachment,
      conversationKey,
    });
    maybeShowNotification(
      `${senderLabel} shared ${attachment.kind} in ${group.name}`,
      attachment.viewOnce ? "View once media" : attachment.name,
      `group-attachment-${groupId}-${msgId}`,
      conversationKey,
    );
  } else {
    const plaintext = await decrypt(senderKeyEntry.key, ciphertext, iv);
    appendMessage(senderLabel, plaintext, {
      type: "received",
      verified,
      msgId,
      messageKey: getGroupMessageKey(groupId, from, msgId),
      conversationKey,
    });
    maybeShowNotification(
      `New group message in ${group.name}`,
      `${senderLabel}: ${plaintext}`,
      `group-message-${groupId}-${msgId}`,
      conversationKey,
    );
  }
  return true;
}

async function drainPendingGroupMessages(groupId, senderId) {
  const state = ensureGroupSenderKeyState(groupId);
  const remaining = [];
  for (const pendingMessage of state.pendingMessages) {
    if (
      pendingMessage.groupId === groupId &&
      pendingMessage.from === senderId
    ) {
      const processed = await processIncomingGroupMessage(pendingMessage, {
        allowQueue: false,
      });
      if (!processed) {
        remaining.push(pendingMessage);
      }
    } else {
      remaining.push(pendingMessage);
    }
  }
  state.pendingMessages = remaining;
}

async function handleIncomingGroupSenderKey({
  from,
  groupId,
  keyId,
  ciphertext,
  iv,
  signature,
  senderPublicKey,
  senderSigningKey,
}) {
  const group = groups.get(groupId);
  if (!group || !group.members.includes(socket.id)) {
    return;
  }
  const senderCryptoKey =
    peerKeys[from] || (await importPublicKey(senderPublicKey));
  peerKeys[from] = senderCryptoKey;
  const signingKey =
    senderSigningKey && signature
      ? peerSigningKeys[from] || (await importSigningPublicKey(senderSigningKey))
      : peerSigningKeys[from] || null;
  if (signingKey) {
    peerSigningKeys[from] = signingKey;
  }
  const verified =
    signingKey && signature
      ? await verifySignature(
          signingKey,
          buildSenderKeyDistributionPayload({
            groupId,
            keyId,
            recipientId: socket.id,
            ciphertext,
            iv,
          }),
          signature,
        )
      : false;
  if (!verified) {
    appendMessage(
      "system",
      `[group sender key rejected from ${getDisplayName(from)}]`,
      { type: "error", conversationKey: groupConversationKey(groupId) },
    );
    return;
  }
  const sharedKey = await deriveSharedKey(
    myKeyPair.privateKey,
    senderCryptoKey,
  );
  const senderKeyBytes = await decryptBytes(sharedKey, ciphertext, iv);
  const senderKey = await importSenderKeyRaw(senderKeyBytes);
  const state = ensureGroupSenderKeyState(groupId);
  state.remoteSenderKeys[from] = { keyId, key: senderKey };
  await drainPendingGroupMessages(groupId, from);
  updateChatHeader();
}

function closeMediaComposer() {
  if (pendingMediaUrl) {
    URL.revokeObjectURL(pendingMediaUrl);
  }
  pendingMediaFile = null;
  pendingMediaUrl = null;
  mediaPreviewEl.replaceChildren();
  mediaModalEl.hidden = true;
  attachmentInputEl.value = "";
  viewOnceToggleEl.checked = false;
}

function openMediaComposer(file) {
  if (!selectedPeer && !selectedGroupId) {
    return;
  }
  if (!file) {
    return;
  }
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    showToast("Please choose a photo or video.", "error");
    return;
  }
  if (file.size === 0) {
    showToast("Empty files cannot be shared.", "error");
    return;
  }
  if (file.size > ATTACHMENT_SIZE_LIMIT) {
    showToast(
      `That file is too large. Max ${formatFileSize(ATTACHMENT_SIZE_LIMIT)}.`,
      "error",
    );
    return;
  }
  if (pendingMediaUrl) {
    URL.revokeObjectURL(pendingMediaUrl);
  }
  pendingMediaFile = file;
  pendingMediaUrl = URL.createObjectURL(file);
  mediaPreviewEl.replaceChildren();
  if (file.type.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = pendingMediaUrl;
    video.controls = true;
    video.playsInline = true;
    mediaPreviewEl.appendChild(video);
  } else {
    const image = document.createElement("img");
    image.src = pendingMediaUrl;
    image.alt = file.name;
    mediaPreviewEl.appendChild(image);
  }
  mediaMetaEl.textContent = `${file.name} · ${formatFileSize(file.size)}`;
  viewOnceRowEl.hidden = false;
  viewOnceToggleEl.checked = false;
  mediaModalEl.hidden = false;
}

async function sendDirectAttachment(file, viewOnce) {
  if (!selectedPeer || !file) {
    return;
  }
  const targetPeer = selectedPeer;
  const bytes = await readFileBytes(file);
  const attachmentMeta = createAttachmentMeta({
    name: file.name,
    mimeType: file.type,
    size: file.size,
    viewOnce,
  });
  const sharedKey = await deriveSharedKey(
    myKeyPair.privateKey,
    targetPeer.key,
  );
  const { ciphertext, iv } = await encryptBytes(sharedKey, bytes);
  const signature = await signMessage(
    mySigningKeyPair.privateKey,
    buildAttachmentSignaturePayload(attachmentMeta, ciphertext, iv),
  );
  const msgId = generateMsgId();
  socket.emit("send-message", {
    to: targetPeer.id,
    msgType: "attachment",
    ciphertext,
    iv,
    attachmentMeta,
    senderPublicKey: myPublicKeyJwk,
    senderSigningKey: mySigningPublicKeyJwk,
    signature,
    msgId,
  });
  stopOutgoingTyping(targetPeer.id);
  const message = appendMessage("you", "", {
    type: "sent",
    verified: true,
    msgId,
    peerId: targetPeer.id,
    messageKey: getSentMessageKey(msgId),
    attachment: {
      ...attachmentMeta,
      downloadUrl: createAttachmentUrl(bytes, attachmentMeta.mimeType),
      opened: false,
      openedByPeer: false,
    },
    conversationKey: peerConversationKey(targetPeer.id),
  });
  if (message) {
    messageStates.set(msgId, message);
  }
}

async function sendGroupAttachment(file, viewOnce) {
  if (!selectedGroupId || !file) {
    return;
  }
  const group = groups.get(selectedGroupId);
  if (!group || !group.members.includes(socket.id)) {
    return;
  }
  const state = await ensureLocalSenderKeyForGroup(selectedGroupId);
  if (!state?.mySenderKey || !state.mySenderKeyId) {
    throw new Error("sender key unavailable");
  }
  const bytes = await readFileBytes(file);
  const attachmentMeta = createAttachmentMeta({
    name: file.name,
    mimeType: file.type,
    size: file.size,
    viewOnce,
  });
  const { ciphertext, iv } = await encryptBytes(state.mySenderKey, bytes);
  const msgId = generateMsgId();
  const signature = await signMessage(
    mySigningKeyPair.privateKey,
    buildGroupMessageSignaturePayload({
      groupId: selectedGroupId,
      keyId: state.mySenderKeyId,
      msgId,
      msgType: "attachment",
      ciphertext,
      iv,
      attachmentMeta,
    }),
  );
  socket.emit("send-group-message", {
    groupId: selectedGroupId,
    keyId: state.mySenderKeyId,
    msgType: "attachment",
    ciphertext,
    iv,
    attachmentMeta,
    senderSigningKey: mySigningPublicKeyJwk,
    signature,
    msgId,
  });
  appendMessage("you", "", {
    type: "sent",
    verified: true,
    msgId,
    messageKey: getGroupMessageKey(selectedGroupId, socket.id, msgId),
    attachment: {
      ...attachmentMeta,
      downloadUrl: createAttachmentUrl(bytes, attachmentMeta.mimeType),
      opened: false,
      openedByPeer: false,
    },
    conversationKey: groupConversationKey(selectedGroupId),
  });
}

async function sendPendingMedia() {
  const file = pendingMediaFile;
  const viewOnce = viewOnceToggleEl.checked;
  if (!file) {
    return;
  }
  mediaSendBtnEl.disabled = true;
  mediaSendBtnEl.textContent = "Sending…";
  try {
    if (selectedGroupId) {
      await sendGroupAttachment(file, viewOnce);
    } else {
      await sendDirectAttachment(file, viewOnce);
    }
    closeMediaComposer();
  } catch (error) {
    showToast(error.message || "Could not send media", "error");
  } finally {
    mediaSendBtnEl.disabled = false;
    mediaSendBtnEl.textContent = "Send";
  }
}

async function sendDirectText(text) {
  if (!text || !selectedPeer) {
    return;
  }
  const targetPeer = selectedPeer;
  const sharedKey = await deriveSharedKey(
    myKeyPair.privateKey,
    targetPeer.key,
  );
  const { ciphertext, iv } = await encrypt(sharedKey, text);
  const signature = await signMessage(
    mySigningKeyPair.privateKey,
    buildTextSignaturePayload(text),
  );
  const msgId = generateMsgId();
  socket.emit("send-message", {
    to: targetPeer.id,
    msgType: "text",
    ciphertext,
    iv,
    senderPublicKey: myPublicKeyJwk,
    senderSigningKey: mySigningPublicKeyJwk,
    signature,
    msgId,
  });
  stopOutgoingTyping(targetPeer.id);
  const message = appendMessage("you", text, {
    type: "sent",
    verified: true,
    msgId,
    peerId: targetPeer.id,
    messageKey: getSentMessageKey(msgId),
    conversationKey: peerConversationKey(targetPeer.id),
  });
  if (message) {
    messageStates.set(msgId, message);
  }
}

async function sendGroupText(text) {
  if (!text || !selectedGroupId) {
    return;
  }
  const group = groups.get(selectedGroupId);
  if (!group || !group.members.includes(socket.id)) {
    return;
  }
  const state = await ensureLocalSenderKeyForGroup(selectedGroupId);
  if (!state?.mySenderKey || !state.mySenderKeyId) {
    throw new Error("sender key unavailable");
  }
  const { ciphertext, iv } = await encrypt(state.mySenderKey, text);
  const msgId = generateMsgId();
  const signature = await signMessage(
    mySigningKeyPair.privateKey,
    buildGroupMessageSignaturePayload({
      groupId: selectedGroupId,
      keyId: state.mySenderKeyId,
      msgId,
      msgType: "text",
      ciphertext,
      iv,
    }),
  );
  socket.emit("send-group-message", {
    groupId: selectedGroupId,
    keyId: state.mySenderKeyId,
    msgType: "text",
    ciphertext,
    iv,
    senderSigningKey: mySigningPublicKeyJwk,
    signature,
    msgId,
  });
  appendMessage("you", text, {
    type: "sent",
    verified: true,
    msgId,
    messageKey: getGroupMessageKey(selectedGroupId, socket.id, msgId),
    conversationKey: groupConversationKey(selectedGroupId),
  });
}

function signalCall(to, data) {
  socket.emit("call-signal", { to, data });
}

function stopRingtone() {
  if (ringtoneTimer) {
    window.clearInterval(ringtoneTimer);
    ringtoneTimer = null;
  }
  if (ringtoneCtx) {
    ringtoneCtx.close().catch(() => {});
    ringtoneCtx = null;
  }
}

function startRingtone() {
  stopRingtone();
  try {
    ringtoneCtx = new AudioContext();
    const beep = () => {
      if (!ringtoneCtx) {
        return;
      }
      const oscillator = ringtoneCtx.createOscillator();
      const gain = ringtoneCtx.createGain();
      oscillator.frequency.value = 680;
      gain.gain.value = 0.05;
      oscillator.connect(gain).connect(ringtoneCtx.destination);
      oscillator.start();
      oscillator.stop(ringtoneCtx.currentTime + 0.18);
    };
    beep();
    ringtoneTimer = window.setInterval(beep, 1100);
  } catch {
    // Autoplay can fail until a user gesture; the incoming UI is enough.
  }
}

function setCallChrome(callType, statusText) {
  const name = getDisplayName(callSession?.peerId);
  const photo = getPeerAvatar(callSession?.peerId);
  paintAvatar(callAvatarEl, name, callSession?.peerId, photo);
  paintAvatar(incomingAvatarEl, name, callSession?.peerId, photo);
  callPeerNameEl.textContent = name;
  incomingNameEl.textContent = name;
  incomingTypeEl.textContent =
    callType === "video" ? "Incoming video call" : "Incoming voice call";
  callStateEl.textContent = statusText;
  callTimerEl.textContent = "00:00";
  activeCallEl.classList.toggle("audio-only", callType !== "video");
  callCameraBtnEl.style.display = callType === "video" ? "" : "none";
  callFlipBtnEl.hidden = callType !== "video";
  if (callType === "video") {
    void refreshCameraFlipAvailability();
  }
  callMuteBtnEl.classList.remove("active");
  callCameraBtnEl.classList.remove("active");
  callMuteBtnEl.textContent = "Mute";
  callCameraBtnEl.textContent = "Camera";
}

function createPeerConnection(peerId) {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      signalCall(peerId, { type: "ice", candidate: event.candidate });
    }
  };
  pc.ontrack = (event) => {
    remoteVideoEl.srcObject =
      event.streams[0] || new MediaStream([event.track]);
  };
  pc.onconnectionstatechange = () => {
    if (!callSession || callSession.pc !== pc) {
      return;
    }
    if (pc.connectionState === "connected") {
      onCallConnected();
    } else if (
      pc.connectionState === "failed" ||
      pc.connectionState === "closed"
    ) {
      void endCall({ notify: false, reason: "Call ended" });
    }
  };
  return pc;
}

async function getCallMedia(callType, facingMode = "user") {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video:
      callType === "video"
        ? {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        : false,
  });
}

function updateLocalPreviewMirror(facingMode) {
  localVideoEl.classList.toggle("mirrored", facingMode !== "environment");
}

async function refreshCameraFlipAvailability() {
  if (!callSession || callSession.callType !== "video") {
    callFlipBtnEl.hidden = true;
    return;
  }
  try {
    const videos = (await navigator.mediaDevices.enumerateDevices()).filter(
      (device) => device.kind === "videoinput",
    );
    callSession.canFlip = videos.length > 1;
    callFlipBtnEl.hidden = videos.length === 0;
  } catch {
    callFlipBtnEl.hidden = false;
  }
}

function getVideoSender() {
  if (!callSession?.pc) {
    return null;
  }
  return (
    callSession.pc.getSenders().find((item) => item.track?.kind === "video") ||
    null
  );
}

async function attachLocalVideoTrack(newTrack) {
  if (!callSession || !newTrack) {
    return;
  }
  const sender = getVideoSender();
  if (sender) {
    await sender.replaceTrack(newTrack);
  } else if (callSession.pc) {
    callSession.pc.addTrack(newTrack, callSession.localStream);
  }
  callSession.localStream.getVideoTracks().forEach((track) => {
    if (track !== newTrack) {
      callSession.localStream.removeTrack(track);
      track.stop();
    }
  });
  if (!callSession.localStream.getVideoTracks().includes(newTrack)) {
    callSession.localStream.addTrack(newTrack);
  }
  localVideoEl.srcObject = callSession.localStream;
  try {
    await localVideoEl.play();
  } catch {
    // autoplay can wait for the next gesture
  }
}

async function openVideoOnlyTrack(videoConstraints) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: videoConstraints,
  });
  const track = stream.getVideoTracks()[0] || null;
  stream.getTracks().forEach((item) => {
    if (item !== track) {
      item.stop();
    }
  });
  return track;
}

function onCallConnected() {
  if (!callSession || callSession.startedAt) {
    return;
  }
  if (callSession.timeout) {
    window.clearTimeout(callSession.timeout);
    callSession.timeout = null;
  }
  callSession.startedAt = Date.now();
  callStateEl.textContent =
    callSession.callType === "video" ? "Video call" : "Voice call";
  callSession.timer = window.setInterval(() => {
    if (!callSession?.startedAt) {
      return;
    }
    const total = Math.floor((Date.now() - callSession.startedAt) / 1000);
    const minutes = String(Math.floor(total / 60)).padStart(2, "0");
    const seconds = String(total % 60).padStart(2, "0");
    callTimerEl.textContent = `${minutes}:${seconds}`;
  }, 500);
}

async function flushIce() {
  if (!callSession?.pc?.remoteDescription) {
    return;
  }
  const queued = callSession.pendingIce.splice(0);
  for (const candidate of queued) {
    try {
      await callSession.pc.addIceCandidate(candidate);
    } catch (error) {
      console.warn("ICE candidate failed", error);
    }
  }
}

function cleanupCall() {
  stopRingtone();
  if (callSession?.timeout) {
    window.clearTimeout(callSession.timeout);
  }
  if (callSession?.timer) {
    window.clearInterval(callSession.timer);
  }
  callSession?.localStream?.getTracks().forEach((track) => track.stop());
  try {
    callSession?.pc?.close();
  } catch {
    // already closed
  }
  localVideoEl.srcObject = null;
  localVideoEl.classList.remove("mirrored");
  remoteVideoEl.srcObject = null;
  incomingCallEl.hidden = true;
  activeCallEl.hidden = true;
  callSession = null;
}

async function endCall({ notify = true, reason } = {}) {
  const session = callSession;
  if (!session) {
    incomingCallEl.hidden = true;
    activeCallEl.hidden = true;
    return;
  }
  if (notify) {
    signalCall(session.peerId, { type: "hangup" });
  }
  cleanupCall();
  if (reason) {
    showToast(reason);
  }
}

async function startCall(callType) {
  if (!selectedPeer) {
    return;
  }
  if (callSession) {
    showToast("You are already in a call.");
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("Calls are not supported in this browser.", "error");
    return;
  }
  const peerId = selectedPeer.id;
  try {
    const localStream = await getCallMedia(callType, "user");
    const pc = createPeerConnection(peerId);
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    localVideoEl.srcObject = localStream;
    updateLocalPreviewMirror("user");
    const openedVideo = localStream.getVideoTracks()[0];
    callSession = {
      peerId,
      callType,
      role: "caller",
      pc,
      localStream,
      pendingIce: [],
      startedAt: null,
      facingMode: openedVideo?.getSettings?.().facingMode || "user",
      videoDeviceId: openedVideo?.getSettings?.().deviceId || "",
    };
    void refreshCameraFlipAvailability();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    signalCall(peerId, {
      type: "offer",
      sdp: pc.localDescription,
      callType,
    });
    setCallChrome(callType, "Calling…");
    activeCallEl.hidden = false;
    callSession.timeout = window.setTimeout(() => {
      void endCall({ reason: "No answer" });
    }, 40000);
  } catch (error) {
    cleanupCall();
    showToast(error.message || "Could not start the call.", "error");
  }
}

async function acceptCall() {
  if (!callSession || callSession.role !== "callee") {
    return;
  }
  stopRingtone();
  if (callSession.timeout) {
    window.clearTimeout(callSession.timeout);
    callSession.timeout = null;
  }
  try {
    const localStream = await getCallMedia(callSession.callType, "user");
    const pc = createPeerConnection(callSession.peerId);
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    localVideoEl.srcObject = localStream;
    callSession.pc = pc;
    callSession.localStream = localStream;
    const openedVideo = localStream.getVideoTracks()[0];
    callSession.facingMode = openedVideo?.getSettings?.().facingMode || "user";
    callSession.videoDeviceId = openedVideo?.getSettings?.().deviceId || "";
    updateLocalPreviewMirror(callSession.facingMode);
    void refreshCameraFlipAvailability();
    await pc.setRemoteDescription(callSession.remoteOffer);
    await flushIce();
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    signalCall(callSession.peerId, {
      type: "answer",
      sdp: pc.localDescription,
    });
    incomingCallEl.hidden = true;
    setCallChrome(callSession.callType, "Connecting");
    activeCallEl.hidden = false;
  } catch (error) {
    signalCall(callSession.peerId, { type: "reject" });
    cleanupCall();
    showToast(error.message || "Could not accept the call.", "error");
  }
}

function rejectCall() {
  if (!callSession) {
    incomingCallEl.hidden = true;
    return;
  }
  signalCall(callSession.peerId, { type: "reject" });
  cleanupCall();
}

async function handleCallSignal({ from, data }) {
  if (!data?.type) {
    return;
  }
  if (data.type === "offer") {
    if (callSession) {
      signalCall(from, { type: "busy" });
      return;
    }
    callSession = {
      peerId: from,
      callType: data.callType === "video" ? "video" : "audio",
      role: "callee",
      remoteOffer: data.sdp,
      pendingIce: [],
      pc: null,
      localStream: null,
      startedAt: null,
      facingMode: "user",
    };
    setCallChrome(callSession.callType, "Incoming");
    incomingCallEl.hidden = false;
    startRingtone();
    callSession.timeout = window.setTimeout(() => {
      rejectCall();
    }, 40000);
    return;
  }

  if (!callSession || callSession.peerId !== from) {
    if (data.type === "ice" || data.type === "answer") {
      return;
    }
  }

  if (data.type === "answer" && callSession?.role === "caller") {
    await callSession.pc.setRemoteDescription(data.sdp);
    await flushIce();
    callStateEl.textContent = "Connecting";
    return;
  }

  if (data.type === "ice") {
    if (!callSession) {
      return;
    }
    if (!callSession.pc || !callSession.pc.remoteDescription) {
      callSession.pendingIce.push(data.candidate);
      return;
    }
    try {
      await callSession.pc.addIceCandidate(data.candidate);
    } catch (error) {
      console.warn("ICE candidate failed", error);
    }
    return;
  }

  if (data.type === "hangup") {
    cleanupCall();
    showToast("Call ended");
    return;
  }

  if (data.type === "reject") {
    cleanupCall();
    showToast("Call declined");
    return;
  }

  if (data.type === "busy") {
    cleanupCall();
    showToast("Busy");
  }
}

function toggleMute() {
  if (!callSession?.localStream) {
    return;
  }
  const audioTracks = callSession.localStream.getAudioTracks();
  const enabled = audioTracks.some((track) => track.enabled);
  audioTracks.forEach((track) => {
    track.enabled = !enabled;
  });
  callMuteBtnEl.classList.toggle("active", enabled);
  callMuteBtnEl.textContent = enabled ? "Unmute" : "Mute";
}

function toggleCamera() {
  if (!callSession?.localStream) {
    return;
  }
  const videoTracks = callSession.localStream.getVideoTracks();
  if (videoTracks.length === 0) {
    return;
  }
  const enabled = videoTracks.some((track) => track.enabled);
  videoTracks.forEach((track) => {
    track.enabled = !enabled;
  });
  callCameraBtnEl.classList.toggle("active", enabled);
  callCameraBtnEl.textContent = enabled ? "Camera off" : "Camera";
}

async function switchCamera() {
  if (!callSession || callSession.callType !== "video" || callSession.flipping) {
    return;
  }

  const oldTrack = callSession.localStream?.getVideoTracks()[0];
  if (!oldTrack) {
    showToast("Turn the camera on first, then tap Flip.", "error");
    return;
  }

  callSession.flipping = true;
  callFlipBtnEl.disabled = true;

  const settings = oldTrack.getSettings ? oldTrack.getSettings() : {};
  const currentFacing = settings.facingMode || callSession.facingMode || "user";
  const nextFacing = currentFacing === "environment" ? "user" : "environment";
  const currentId = settings.deviceId || callSession.videoDeviceId || "";

  try {
    try {
      await oldTrack.applyConstraints({ facingMode: { exact: nextFacing } });
      const applied = oldTrack.getSettings ? oldTrack.getSettings() : {};
      if (applied.facingMode && applied.facingMode !== currentFacing) {
        callSession.facingMode = applied.facingMode;
        callSession.videoDeviceId = applied.deviceId || currentId;
        updateLocalPreviewMirror(applied.facingMode);
        return;
      }
    } catch {
      // Many browsers cannot flip in place; reopen the other camera below.
    }

    const videos = (await navigator.mediaDevices.enumerateDevices()).filter(
      (device) => device.kind === "videoinput" && device.deviceId,
    );
    let nextDevice = null;
    if (videos.length > 1) {
      const index = videos.findIndex((device) => device.deviceId === currentId);
      nextDevice = videos[(index + 1) % videos.length];
      if (!nextDevice || nextDevice.deviceId === currentId) {
        nextDevice = videos.find((device) => device.deviceId !== currentId) || null;
      }
    }

    oldTrack.stop();
    callSession.localStream.removeTrack(oldTrack);

    const attempts = [];
    if (nextDevice?.deviceId) {
      attempts.push({ deviceId: { exact: nextDevice.deviceId } });
    }
    attempts.push({ facingMode: { exact: nextFacing } });
    attempts.push({ facingMode: nextFacing });
    attempts.push({ facingMode: { ideal: nextFacing } });
    attempts.push(true);

    let newTrack = null;
    let lastError = null;
    for (const video of attempts) {
      try {
        newTrack = await openVideoOnlyTrack(video);
        if (newTrack) {
          break;
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (!newTrack) {
      try {
        const restored = await openVideoOnlyTrack(
          currentId
            ? { deviceId: { exact: currentId } }
            : { facingMode: currentFacing || "user" },
        );
        if (restored) {
          await attachLocalVideoTrack(restored);
          updateLocalPreviewMirror(currentFacing);
        }
      } catch {
        // The original camera may also be busy; the call stays audio-only until hangup.
      }
      throw lastError || new Error("switch failed");
    }

    await attachLocalVideoTrack(newTrack);
    const applied = newTrack.getSettings ? newTrack.getSettings() : {};
    callSession.facingMode = applied.facingMode || nextFacing;
    callSession.videoDeviceId = applied.deviceId || nextDevice?.deviceId || "";
    updateLocalPreviewMirror(callSession.facingMode);
  } catch (error) {
    console.warn("switchCamera failed", error);
    const name = error?.name || "";
    if (name === "NotFoundError" || name === "OverconstrainedError") {
      showToast("No second camera found on this device.", "error");
    } else if (name === "NotAllowedError") {
      showToast("Camera permission is blocked for this site.", "error");
    } else {
      showToast(
        "Could not switch camera. Close other apps using the camera and try Flip again.",
        "error",
      );
    }
  } finally {
    if (callSession) {
      callSession.flipping = false;
    }
    callFlipBtnEl.disabled = false;
  }
}

async function init() {
  const themeParam = new URLSearchParams(location.search).get("theme");
  applyTheme(
    themeParam === "light" || themeParam === "dark"
      ? themeParam
      : preferredTheme(),
  );
  backBtnEl.innerHTML = ICONS.back;
  verifyBtnEl.innerHTML = ICONS.shield;
  audioCallBtnEl.innerHTML = ICONS.phone;
  videoCallBtnEl.innerHTML = ICONS.video;
  attachBtnEl.innerHTML = ICONS.attach;
  sendBtnEl.innerHTML = ICONS.send;
  verifyCloseBtnEl.innerHTML = ICONS.close;
  mediaCloseBtnEl.innerHTML = ICONS.close;
  lightboxCloseEl.innerHTML = ICONS.close;
  viewOnceCloseEl.innerHTML = ICONS.close;
  updateNotificationUI();
  displayNameInputEl.value = displayName;
  refreshOwnAvatar();
  setupInstallPrompt();
  registerServiceWorker();
  setupCaptureGuards();

  try {
    myKeyPair = await generateKeyPair();
    myPublicKeyJwk = await exportPublicKey(myKeyPair.publicKey);
    mySigningKeyPair = await generateSigningKeyPair();
    mySigningPublicKeyJwk = await exportPublicKey(mySigningKeyPair.publicKey);
    if (!displayName) {
      setDisplayName(generateDummyNameFromJwk(myPublicKeyJwk), {
        broadcast: false,
      });
    }
    const { words, hex } = await getFingerprint(myKeyPair.publicKey);
    myFingerprintEl.textContent = words;
    myFingerprintHexEl.textContent = hex;
    statusEl.textContent = "Keys ready. Connecting…";
    if (socket.connected) {
      statusEl.textContent = "Connected. Select a chat.";
      refreshOwnAvatar();
      registerPublicKeys();
    }
  } catch (error) {
    statusEl.textContent = "Key setup failed.";
    showToast(error.message || "Could not generate keys.", "error");
  }
}

socket.on("connect", () => {
  reconnectBannerEl.hidden = true;
  statusEl.textContent = myPublicKeyJwk
    ? "Connected. Select a chat."
    : "Connected. Preparing keys…";
  refreshOwnAvatar();
  registerPublicKeys();
  socket.emit("request-groups");
});

socket.on("disconnect", () => {
  reconnectBannerEl.hidden = false;
  statusEl.textContent = "Disconnected. Reconnecting…";
  visiblePeerIds = [];
  selectedGroupId = null;
  selectedPeer = null;
  typingPeers.clear();
  groups.clear();
  groupSenderKeyState.clear();
  for (const peerId of Object.keys(peerKeys)) {
    delete peerKeys[peerId];
    delete peerSigningKeys[peerId];
  }
  void endCall({ notify: false });
  hideConversation();
});

socket.on("peer-list", async (peers) => {
  const connectedPeerIds = [];
  for (const peer of peers) {
    if (peer.id === socket.id) {
      continue;
    }
    if (!peer.encryptKey || !peer.signKey) {
      continue;
    }
    try {
      peerKeys[peer.id] = await importPublicKey(peer.encryptKey);
      peerSigningKeys[peer.id] = await importSigningPublicKey(peer.signKey);
      peerProfiles.set(peer.id, {
        displayName: peer.displayName || "Someone",
        avatar: peer.avatar || "",
      });
      connectedPeerIds.push(peer.id);
    } catch (error) {
      console.warn("Failed to import peer keys:", error);
    }
  }
  for (const peerId of Object.keys(peerKeys)) {
    if (!connectedPeerIds.includes(peerId)) {
      delete peerKeys[peerId];
      delete peerSigningKeys[peerId];
      typingPeers.delete(peerId);
    }
  }
  visiblePeerIds = connectedPeerIds;

  if (callSession && !connectedPeerIds.includes(callSession.peerId)) {
    void endCall({ notify: false, reason: "Peer left the call" });
  }

  if (selectedPeer && visiblePeerIds.includes(selectedPeer.id)) {
    selectedPeer = {
      id: selectedPeer.id,
      key: peerKeys[selectedPeer.id],
      signKey: peerSigningKeys[selectedPeer.id],
    };
    const { words, hex } = await getFingerprint(selectedPeer.key);
    peerFingerprintEl.textContent = words;
    peerFingerprintHexEl.textContent = hex;
    updateChatHeader();
  } else if (selectedPeer) {
    showToast(`${getDisplayName(selectedPeer.id)} went offline.`);
    hideConversation();
    return;
  }

  renderPeerList();
  renderGroupList();
  for (const group of groups.values()) {
    if (group.members.includes(socket.id)) {
      try {
        await ensureLocalSenderKeyForGroup(group.id);
      } catch (error) {
        console.warn("Failed to refresh sender key after peer sync:", error);
      }
    }
  }
});

socket.on("group-list", async (serverGroups) => {
  groups.clear();
  for (const group of serverGroups) {
    groups.set(group.id, group);
    if (group.members.includes(socket.id)) {
      const state = ensureGroupSenderKeyState(group.id);
      const memberSnapshot = getGroupMemberSnapshot(group);
      if (state.memberSnapshot && state.memberSnapshot !== memberSnapshot) {
        resetGroupSenderKeyState(state, memberSnapshot);
      } else {
        state.memberSnapshot = memberSnapshot;
      }
    }
  }
  for (const groupId of Array.from(groupSenderKeyState.keys())) {
    const group = groups.get(groupId);
    if (!group || !group.members.includes(socket.id)) {
      groupSenderKeyState.delete(groupId);
    }
  }
  if (selectedGroupId) {
    const group = groups.get(selectedGroupId);
    if (!group || !group.members.includes(socket.id)) {
      hideConversation();
    } else {
      updateChatHeader();
    }
  }
  for (const group of groups.values()) {
    if (group.members.includes(socket.id)) {
      try {
        await ensureLocalSenderKeyForGroup(group.id);
      } catch (error) {
        console.warn("Failed to distribute sender key for group:", error);
      }
    }
  }
  renderGroupList();
});

socket.on("group-selected", ({ groupId }) => {
  if (groupId) {
    void selectGroup(groupId);
  }
});

socket.on("group-sender-key", (payload) => {
  void handleIncomingGroupSenderKey(payload);
});

socket.on("receive-group-message", (payload) => {
  void processIncomingGroupMessage(payload);
});

socket.on("typing-start", ({ from }) => {
  typingPeers.add(from);
  renderPeerList();
  if (selectedPeer?.id === from) {
    updateChatHeader();
  }
});

socket.on("typing-stop", ({ from }) => {
  typingPeers.delete(from);
  renderPeerList();
  if (selectedPeer?.id === from) {
    updateChatHeader();
  }
});

socket.on(
  "receive-message",
  async ({
    msgType = "text",
    from,
    ciphertext,
    iv,
    senderPublicKey,
    senderSigningKey,
    signature,
    msgId,
    attachmentMeta,
  }) => {
    socket.emit("msg-delivered", { to: from, msgId });
    typingPeers.delete(from);
    const conversationKey = peerConversationKey(from);
    try {
      const senderCryptoKey =
        peerKeys[from] || (await importPublicKey(senderPublicKey));
      peerKeys[from] = senderCryptoKey;
      const signingKey =
        senderSigningKey && signature
          ? peerSigningKeys[from] ||
            (await importSigningPublicKey(senderSigningKey))
          : null;
      if (signingKey) {
        peerSigningKeys[from] = signingKey;
      }
      const sharedKey = await deriveSharedKey(
        myKeyPair.privateKey,
        senderCryptoKey,
      );
      const messageKey = getReceivedMessageKey(from, msgId);
      const senderLabel = getDisplayName(from);
      if (msgType === "attachment") {
        const verified =
          signingKey && signature
            ? await verifySignature(
                signingKey,
                buildAttachmentSignaturePayload(
                  attachmentMeta,
                  ciphertext,
                  iv,
                ),
                signature,
              )
            : false;
        const attachmentBytes = await decryptBytes(sharedKey, ciphertext, iv);
        const viewOnce = Boolean(attachmentMeta?.viewOnce);
        const attachment = {
          ...attachmentMeta,
          viewOnce,
          opened: false,
          bytes: viewOnce ? attachmentBytes : null,
          downloadUrl: viewOnce
            ? null
            : createAttachmentUrl(attachmentBytes, attachmentMeta?.mimeType),
        };
        appendMessage(senderLabel, "", {
          type: "received",
          verified,
          msgId,
          peerId: from,
          messageKey,
          attachment,
          conversationKey,
        });
        maybeShowNotification(
          `${senderLabel} shared ${attachment.kind}`,
          attachment.viewOnce ? "View once media" : attachment.name,
          `attachment-${from}-${msgId}`,
          conversationKey,
        );
      } else {
        const plaintext = await decrypt(sharedKey, ciphertext, iv);
        const verified =
          signingKey && signature
            ? await verifySignature(
                signingKey,
                buildTextSignaturePayload(plaintext),
                signature,
              )
            : false;
        appendMessage(senderLabel, plaintext, {
          type: "received",
          verified,
          msgId,
          peerId: from,
          messageKey,
          conversationKey,
        });
        maybeShowNotification(
          `New message from ${senderLabel}`,
          plaintext,
          `message-${from}`,
          conversationKey,
        );
      }
      socket.emit("msg-read", { to: from, msgId });
    } catch (error) {
      appendMessage("system", `[decryption failed: ${error.message}]`, {
        type: "error",
        conversationKey,
      });
    }
    renderPeerList();
  },
);

socket.on("message-reaction", ({ from, msgId, emoji, action }) => {
  const message = messageRegistry.get(getSentMessageKey(msgId));
  if (!message) {
    return;
  }
  message.remoteReaction = action === "remove" ? null : emoji;
  renderReactionState(message);
  if (action === "add") {
    maybeShowNotification(
      `${getDisplayName(from)} reacted ${emoji}`,
      "to one of your messages",
      `reaction-${msgId}`,
      message.conversationKey,
    );
  }
});

socket.on("view-once-opened", ({ msgId }) => {
  const message = messageRegistry.get(getSentMessageKey(msgId));
  if (!message?.attachment) {
    return;
  }
  message.attachment.openedByPeer = true;
  refreshMessageAttachment(message);
});

socket.on("msg-delivered", ({ msgId }) => {
  const message = messageStates.get(msgId);
  if (message) {
    updateTick(message, "delivered");
  }
});

socket.on("msg-read", ({ msgId }) => {
  const message = messageStates.get(msgId);
  if (message) {
    updateTick(message, "read");
  }
});

socket.on("call-signal", (payload) => {
  void handleCallSignal(payload);
});

themeBtnEl.addEventListener("click", toggleTheme);
notificationsBtnEl.addEventListener("click", requestNotifications);
backBtnEl.addEventListener("click", hideConversation);

displayNameInputEl.addEventListener("input", () => {
  window.clearTimeout(nameUpdateTimer);
  nameUpdateTimer = window.setTimeout(() => {
    setDisplayName(displayNameInputEl.value);
  }, 400);
});
displayNameInputEl.addEventListener("change", () => {
  setDisplayName(displayNameInputEl.value);
});

createGroupBtnEl.addEventListener("click", () => {
  const name = groupNameInputEl.value.trim();
  if (!name) {
    return;
  }
  socket.emit("create-group", { name });
  groupNameInputEl.value = "";
});
groupNameInputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    createGroupBtnEl.click();
  }
});
leaveGroupBtnEl.addEventListener("click", () => {
  if (!selectedGroupId) {
    return;
  }
  socket.emit("leave-group", { groupId: selectedGroupId });
  hideConversation();
});

verifyBtnEl.addEventListener("click", () => {
  if (!selectedPeer) {
    showToast("Open a 1:1 chat to verify identity.");
    return;
  }
  verifyModalEl.hidden = false;
});
verifyCloseBtnEl.addEventListener("click", () => {
  verifyModalEl.hidden = true;
});
verifyModalEl.addEventListener("click", (event) => {
  if (event.target === verifyModalEl) {
    verifyModalEl.hidden = true;
  }
});

composerEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = msgInputEl.value.trim();
  if (!text) {
    return;
  }
  try {
    if (selectedGroupId) {
      await sendGroupText(text);
    } else {
      await sendDirectText(text);
    }
    msgInputEl.value = "";
    saveDraft();
    resizeComposer();
    msgInputEl.focus();
  } catch (error) {
    showToast(error.message || "Send failed", "error");
  }
});

msgInputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composerEl.requestSubmit();
  }
});
msgInputEl.addEventListener("input", handleComposerInput);

attachBtnEl.addEventListener("click", () => {
  if (!selectedPeer && !selectedGroupId) {
    return;
  }
  attachmentInputEl.click();
});
attachmentInputEl.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  openMediaComposer(file);
});
mediaCloseBtnEl.addEventListener("click", closeMediaComposer);
mediaCancelBtnEl.addEventListener("click", closeMediaComposer);
mediaSendBtnEl.addEventListener("click", () => void sendPendingMedia());

lightboxCloseEl.addEventListener("click", closeLightbox);
lightboxEl.addEventListener("click", (event) => {
  if (event.target === lightboxEl) {
    closeLightbox();
  }
});
viewOnceCloseEl.addEventListener("click", consumeViewOnce);
viewOnceViewerEl.addEventListener("click", (event) => {
  if (event.target === viewOnceViewerEl) {
    consumeViewOnce();
  }
});

conversationEl.addEventListener("dragover", (event) => {
  event.preventDefault();
});
conversationEl.addEventListener("drop", (event) => {
  event.preventDefault();
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    openMediaComposer(file);
  }
});
document.addEventListener("paste", (event) => {
  if (!selectedPeer && !selectedGroupId) {
    return;
  }
  const items = event.clipboardData?.items || [];
  for (const item of items) {
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) {
        event.preventDefault();
        openMediaComposer(file);
        break;
      }
    }
  }
});

chatEl.addEventListener("scroll", () => {
  const slack = 96;
  stickToBottom =
    chatEl.scrollHeight - chatEl.scrollTop - chatEl.clientHeight < slack;
});

audioCallBtnEl.addEventListener("click", () => void startCall("audio"));
videoCallBtnEl.addEventListener("click", () => void startCall("video"));
callAcceptBtnEl.addEventListener("click", () => void acceptCall());
callDeclineBtnEl.addEventListener("click", rejectCall);
callHangupBtnEl.addEventListener("click", () =>
  void endCall({ reason: "Call ended" }),
);
callMuteBtnEl.addEventListener("click", toggleMute);
callCameraBtnEl.addEventListener("click", toggleCamera);
callFlipBtnEl.addEventListener("click", () => void switchCamera());

myAvatarEl.addEventListener("click", () => avatarInputEl.click());
avatarInputEl.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  void handleAvatarFile(file);
});
avatarResetBtnEl.addEventListener("click", clearAvatar);

function isStandaloneDisplay() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function setupInstallPrompt() {
  if (isStandaloneDisplay() || localStorage.getItem(INSTALL_DISMISS_KEY)) {
    return;
  }
  if (isIosDevice()) {
    installTitleEl.textContent = "Add to Home Screen";
    installCopyEl.textContent =
      "On iPhone/iPad: tap Share, then Add to Home Screen.";
    installBtnEl.hidden = true;
    installCardEl.hidden = false;
    return;
  }
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installTitleEl.textContent = "Install app";
    installCopyEl.textContent = "Add E2EE Chat to your home screen.";
    installBtnEl.hidden = false;
    installCardEl.hidden = false;
  });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.warn("Service worker not registered:", error);
  }
}

installBtnEl.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installCardEl.hidden = true;
});

installDismissEl.addEventListener("click", () => {
  localStorage.setItem(INSTALL_DISMISS_KEY, "1");
  installCardEl.hidden = true;
});

function flashCaptureShield() {
  if (!captureShieldEl) {
    return;
  }
  captureShieldEl.hidden = false;
  window.setTimeout(() => {
    captureShieldEl.hidden = true;
  }, 800);
}

function isCaptureShortcut(event) {
  const key = event.key;
  if (key === "PrintScreen") {
    return true;
  }
  const comboS = key === "s" || key === "S";
  if (event.metaKey && event.shiftKey && comboS) {
    return true;
  }
  if (event.ctrlKey && event.shiftKey && comboS) {
    return true;
  }
  return false;
}

function setupCaptureGuards() {
  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  document.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
  document.addEventListener("copy", (event) => {
    if (!event.target.closest("input, textarea")) {
      event.preventDefault();
    }
  });
  document.addEventListener("cut", (event) => {
    if (!event.target.closest("input, textarea")) {
      event.preventDefault();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (isCaptureShortcut(event)) {
      event.preventDefault();
      flashCaptureShield();
      if (viewOnceOpen) {
        consumeViewOnce();
      }
    }
  });
  document.addEventListener("keyup", (event) => {
    if (event.key === "PrintScreen") {
      flashCaptureShield();
      if (viewOnceOpen) {
        consumeViewOnce();
      }
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && viewOnceOpen) {
      consumeViewOnce();
    }
  });
  window.addEventListener("blur", () => {
    if (viewOnceOpen) {
      consumeViewOnce();
    }
  });
  window.addEventListener("pagehide", () => {
    if (viewOnceOpen) {
      consumeViewOnce();
    }
  });
  window.addEventListener("beforeprint", () => {
    flashCaptureShield();
    if (viewOnceOpen) {
      consumeViewOnce();
    }
  });
  window.addEventListener("afterprint", () => {
    if (captureShieldEl) {
      captureShieldEl.hidden = true;
    }
  });
}

window.addEventListener("beforeunload", () => {
  stopOutgoingTyping();
  if (callSession) {
    signalCall(callSession.peerId, { type: "hangup" });
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }
  if (!verifyModalEl.hidden) {
    verifyModalEl.hidden = true;
  } else if (!mediaModalEl.hidden) {
    closeMediaComposer();
  } else if (!lightboxEl.hidden) {
    closeLightbox();
  } else if (!viewOnceViewerEl.hidden) {
    consumeViewOnce();
  }
});

init();

#!/usr/bin/env python3
"""Build the E2EE Chat complete technical specification PDF from this codebase."""

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    CondPageBreak,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = "/home/nikhil/NIKHIL_SDE/2026/E2EE/E2EE-Chat-Technical-Specification.pdf"

GREEN = colors.HexColor("#008069")
DARK = colors.HexColor("#111b21")
MUTED = colors.HexColor("#667781")
ROW = colors.HexColor("#f0f2f5")
HEAD_BG = colors.HexColor("#111b21")
ACCENT_SOFT = colors.HexColor("#d9fdd3")
LINE = colors.HexColor("#d1d7db")
WHITE = colors.white
CODE_BG = colors.HexColor("#f6f8fa")


def esc(text):
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def styles():
    base = getSampleStyleSheet()
    s = {
        "cover_kicker": ParagraphStyle(
            "cover_kicker",
            fontName="Helvetica",
            fontSize=10,
            textColor=GREEN,
            alignment=TA_LEFT,
            tracking=1.2,
            spaceAfter=8,
        ),
        "cover_title": ParagraphStyle(
            "cover_title",
            fontName="Helvetica-Bold",
            fontSize=28,
            leading=34,
            textColor=DARK,
            spaceAfter=10,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            fontName="Helvetica",
            fontSize=12,
            leading=17,
            textColor=MUTED,
            spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "h1",
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=DARK,
            spaceBefore=16,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "h2",
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=16,
            textColor=GREEN,
            spaceBefore=12,
            spaceAfter=6,
        ),
        "h3": ParagraphStyle(
            "h3",
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=DARK,
            spaceBefore=9,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body",
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=DARK,
            alignment=TA_LEFT,
            spaceAfter=7,
        ),
        "note": ParagraphStyle(
            "note",
            fontName="Helvetica-Oblique",
            fontSize=9,
            leading=12,
            textColor=MUTED,
            spaceAfter=8,
            leftIndent=8,
            rightIndent=8,
        ),
        "cell": ParagraphStyle(
            "cell",
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            textColor=DARK,
        ),
        "cell_h": ParagraphStyle(
            "cell_h",
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=11,
            textColor=WHITE,
        ),
        "code": ParagraphStyle(
            "code",
            fontName="Courier",
            fontSize=7.4,
            leading=10,
            textColor=DARK,
            backColor=CODE_BG,
            leftIndent=6,
            rightIndent=6,
            spaceBefore=4,
            spaceAfter=8,
        ),
        "toc": ParagraphStyle(
            "toc",
            fontName="Helvetica",
            fontSize=10,
            leading=16,
            textColor=DARK,
        ),
        "footer": ParagraphStyle(
            "footer",
            fontName="Helvetica",
            fontSize=8,
            textColor=MUTED,
        ),
        "caption": ParagraphStyle(
            "caption",
            fontName="Helvetica-Oblique",
            fontSize=8,
            leading=10,
            textColor=MUTED,
            spaceAfter=10,
            spaceBefore=2,
        ),
    }
    return s


S = styles()


def P(text, style="body"):
    return Paragraph(text, S[style])


def H(text, level=1):
    return Paragraph(esc(text), S[f"h{level}"])


def bullets(items):
    flow = []
    for item in items:
        flow.append(
            ListItem(
                Paragraph(item, S["body"]),
                leftIndent=12,
                bulletColor=GREEN,
            )
        )
    return ListFlowable(
        flow,
        bulletType="bullet",
        start="•",
        leftIndent=16,
        bulletFontName="Helvetica",
        bulletFontSize=9,
        spaceAfter=6,
    )


def code_block(text):
    return Preformatted(text.strip("\n"), S["code"])


def table(headers, rows, widths):
    head = [Paragraph(esc(h), S["cell_h"]) for h in headers]
    body = []
    for row in rows:
        body.append([Paragraph(cell, S["cell"]) for cell in row])
    data = [head] + body
    grid = Table(data, colWidths=widths, repeatRows=1)
    cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), HEAD_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.3, LINE),
        ("BACKGROUND", (0, 1), (-1, 1), ROW),
    ]
    for i in range(2, len(data)):
        if i % 2 == 1:
            cmds.append(("BACKGROUND", (0, i), (-1, i), ROW))
    grid.setStyle(TableStyle(cmds))
    return grid


W = 7.5 * inch  # printable width at 0.5" side margins? we'll use 0.7"
# letter width 8.5, margins 0.7 each => 7.1
PAGE_W = letter[0]
PAGE_H = letter[1]
ML = 0.7 * inch
MR = 0.7 * inch
MT = 0.75 * inch
MB = 0.7 * inch
CW = PAGE_W - ML - MR  # 7.1 inch


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(GREEN)
    canvas.rect(0, PAGE_H - 8, PAGE_W, 8, fill=1, stroke=0)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(ML, PAGE_H - 0.48 * inch, "E2EE Chat  ·  Complete Technical Specification")
    canvas.drawRightString(PAGE_W - MR, PAGE_H - 0.48 * inch, "Source: this repository")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.4)
    canvas.line(ML, PAGE_H - 0.55 * inch, PAGE_W - MR, PAGE_H - 0.55 * inch)
    canvas.line(ML, 0.48 * inch, PAGE_W - MR, 0.48 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(ML, 0.32 * inch, "Describes the implemented system, not a generic E2EE design.")
    canvas.drawRightString(PAGE_W - MR, 0.32 * inch, f"Page {doc.page}")
    canvas.restoreState()


def cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(DARK)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setFillColor(GREEN)
    canvas.rect(0, PAGE_H - 18, PAGE_W, 18, fill=1, stroke=0)
    canvas.rect(0, 0, PAGE_W, 14, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica", 10)
    canvas.drawString(ML, PAGE_H - 1.4 * inch, "INTERNAL TECHNICAL DOCUMENT")
    canvas.setFont("Helvetica-Bold", 32)
    canvas.drawString(ML, PAGE_H - 2.15 * inch, "E2EE Chat")
    canvas.setFont("Helvetica", 16)
    canvas.setFillColor(colors.HexColor("#d9fdd3"))
    canvas.drawString(ML, PAGE_H - 2.55 * inch, "Complete platform specification")
    canvas.setStrokeColor(GREEN)
    canvas.setLineWidth(2)
    canvas.line(ML, PAGE_H - 2.75 * inch, ML + 2.4 * inch, PAGE_H - 2.75 * inch)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica", 11)
    y = PAGE_H - 3.3 * inch
    lines = [
        "Every implemented feature, algorithm, event, and limitation",
        "in this repository — cryptography, fingerprints, presence,",
        "signed messages, groups, View once media, WebRTC calls,",
        "notifications, and the relay server.",
        "",
        "This document is generated from the actual code paths in",
        "server.js and public/app.js. It is not a marketing overview.",
    ]
    for line in lines:
        canvas.drawString(ML, y, line)
        y -= 16
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.HexColor("#8696a0"))
    meta = [
        "Package: e2ee  ·  version 1.0.0",
        "Runtime: Node.js + browser Web Crypto + WebRTC",
        "Relay: Express 5.2 + Socket.IO 4.8 on port 3000",
        "Date of this snapshot: 13 September 2026",
    ]
    y = 1.6 * inch
    for line in meta:
        canvas.drawString(ML, y, line)
        y -= 14
    canvas.restoreState()


def story():
    s = []

    def h1(t):
        s.append(H(t, 1))

    def h2(t):
        s.append(H(t, 2))

    def h3(t):
        s.append(H(t, 3))

    def p(t):
        s.append(P(t))

    def n(t):
        s.append(P(t, "note"))

    def cap(t):
        s.append(P(t, "caption"))

    s.append(PageBreak())
    h1("Contents")
    toc = [
        "1. Purpose and how to read this document",
        "2. System architecture",
        "3. Technology stack",
        "4. Trust model and what the server can see",
        "5. Cryptographic building blocks",
        "6. Session bootstrap and key lifecycle",
        "7. Safety numbers (fingerprints)",
        "8. Display names, avatars, and the peer directory",
        "9. Presence, online status, and disconnect",
        "10. Direct (1:1) end-to-end messaging",
        "11. Signed messages (authentication)",
        "12. Delivery and read receipts",
        "13. Typing indicators",
        "14. Emoji reactions",
        "15. Groups and sender keys",
        "16. Photos, video, attachments, and View once",
        "17. Voice and video calls (WebRTC)",
        "18. Browser notifications and in-app toasts",
        "19. Client UI systems",
        "20. Relay server internals",
        "21. Complete Socket.IO event catalog",
        "22. In-memory client and server state",
        "23. Constants, limits, and identifiers",
        "24. Encoding and serialization",
        "25. Security properties and honest limitations",
        "26. Repository map",
        "27. Worked examples (message + call)",
        "28. Glossary",
    ]
    for item in toc:
        s.append(P(esc(item), "toc"))

    h1("1. Purpose and how to read this document")
    p(
        "This specification describes <b>this</b> E2EE Chat platform as implemented. "
        "Every algorithm name, curve, IV length, Socket.IO event, timeout, and UI "
        "behavior below is taken from <font name='Courier'>server.js</font> and "
        "<font name='Courier'>public/app.js</font>. If a popular messenger does "
        "something differently (Signal protocol, sealed sender, TURN, persistent "
        "accounts), that difference is called out rather than implied."
    )
    p(
        "The product is a browser chat app: two or more tabs or devices connect to "
        "a Node relay. The relay forwards ciphertext, public keys, presence, group "
        "membership, call signaling, and display names. It never receives message "
        "plaintext, attachment bytes in the clear, or long-term private keys."
    )
    n(
        "Private keys live only in the tab that generated them. Reloading the page "
        "destroys identity. That is an implementation fact, not an accident of this write-up."
    )

    h1("2. System architecture")
    h2("2.1 Components")
    p("Three moving parts:")
    s.append(
        bullets(
            [
                "<b>Browser client</b> (<font name='Courier'>public/index.html</font>, "
                "<font name='Courier'>styles.css</font>, <font name='Courier'>app.js</font>) "
                "owns keys, encryption, signatures, media, WebRTC, and UI.",
                "<b>Relay server</b> (<font name='Courier'>server.js</font>) is an Express "
                "static file host plus a Socket.IO message switch.",
                "<b>Peer browsers</b> are other tabs or devices running the same client. "
                "There is no account database, no login, and no offline store.",
            ]
        )
    )
    h2("2.2 Data plane vs control plane")
    p(
        "Chat <b>content</b> (text and file bytes) is encrypted with AES-GCM before it "
        "touches the socket. Call <b>media</b> (microphone and camera) never goes through "
        "Node at all: after SDP/ICE signaling, audio and video are peer-to-peer DTLS-SRTP "
        "inside the browsers. Everything else — who is online, display names, public keys, "
        "group membership, typing flags, receipt IDs, reaction emoji, View-once-opened "
        "acks, and WebRTC SDP/ICE — is plaintext metadata on the relay."
    )
    h2("2.3 Connection path")
    p(
        "The browser loads <font name='Courier'>http://localhost:3000/</font>. Express "
        "serves the static files with <font name='Courier'>Cache-Control: no-store</font> "
        "for HTML, CSS, and JS. The page then opens a Socket.IO connection to the same "
        "origin. Socket.IO 4 uses Engine.IO underneath (WebSocket when possible, HTTP "
        "long-polling as fallback). The server listens on <b>port 3000</b> on all interfaces."
    )
    h2("2.4 Identity in one sentence")
    p(
        "A user is the Socket.IO <font name='Courier'>socket.id</font> of the current "
        "tab, plus two ephemeral P-256 key pairs generated in that tab, plus a display "
        "name string. There is no password, no user ID, and no device list."
    )

    h1("3. Technology stack")
    s.append(
        table(
            ["Layer", "Technology", "Where / why"],
            [
                [
                    "Runtime (server)",
                    "Node.js (CommonJS)",
                    "Loads <font name='Courier'>server.js</font>. Start command: <font name='Courier'>npm start</font> → <font name='Courier'>node server.js</font>.",
                ],
                [
                    "HTTP",
                    "Express ^5.2.1",
                    "Static files from <font name='Courier'>public/</font>. No REST API for chat.",
                ],
                [
                    "Realtime",
                    "Socket.IO ^4.8.3",
                    "All chat, presence, groups, receipts, reactions, View-once acks, and call signaling.",
                ],
                [
                    "Crypto",
                    "Web Crypto API (<font name='Courier'>crypto.subtle</font>)",
                    "ECDH, ECDSA, AES-GCM, SHA-256, CSPRNG. Runs only in the browser.",
                ],
                [
                    "Randomness",
                    "<font name='Courier'>crypto.getRandomValues</font>",
                    "12-byte AES-GCM IVs.",
                ],
                [
                    "Calls",
                    "WebRTC (<font name='Courier'>RTCPeerConnection</font>, <font name='Courier'>getUserMedia</font>)",
                    "Voice and video. DTLS-SRTP for media. SDP/ICE over Socket.IO.",
                ],
                [
                    "NAT traversal",
                    "STUN only: <font name='Courier'>stun:stun.l.google.com:19302</font>",
                    "No TURN server is configured. Some NATs will fail to connect.",
                ],
                [
                    "Notifications",
                    "Browser Notification API",
                    "Optional; requires permission. Not push/FCM.",
                ],
                [
                    "Audio (ringtone)",
                    "Web Audio API <font name='Courier'>OscillatorNode</font>",
                    "680 Hz beep, 180 ms, every 1.1 s while ringing.",
                ],
                [
                    "Persistence",
                    "<font name='Courier'>localStorage</font> only",
                    "Keys: <font name='Courier'>e2ee.displayName</font>, <font name='Courier'>e2ee.theme</font>. No IndexedDB. No key storage.",
                ],
                [
                    "UI",
                    "Vanilla HTML/CSS/JS",
                    "No React/Vue. CSS variables for light/dark.",
                ],
                [
                    "Media preview",
                    "<font name='Courier'>URL.createObjectURL</font> / <font name='Courier'>revokeObjectURL</font>",
                    "Decrypted bytes become blob URLs in the tab.",
                ],
            ],
            [1.35 * inch, 2.15 * inch, 3.6 * inch],
        )
    )
    cap("Table 1. Stack as declared in package.json and as used in the browser.")

    h1("4. Trust model and what the server can see")
    h2("4.1 What the client trusts")
    s.append(
        bullets(
            [
                "The browser's Web Crypto implementation (origin-bound, not polyfilled).",
                "That the JavaScript served from this origin was not replaced (there is no subresource integrity on the local files).",
                "That the peer's ECDH and ECDSA public keys belong to the human you think they do — this is what fingerprints are for.",
                "That Socket.IO delivers events to the <font name='Courier'>socket.id</font> you addressed (the relay can lie; signatures detect tampering of content, not of routing).",
            ]
        )
    )
    h2("4.2 What the relay is allowed to see (and does)")
    s.append(
        bullets(
            [
                "Every socket id, connect and disconnect time.",
                "Display names (plaintext).",
                "Exported public keys (JWK): ECDH encryption key and ECDSA signing key.",
                "Who sends to whom (<font name='Courier'>to</font> / <font name='Courier'>from</font>).",
                "Ciphertext and IV (base64). The relay cannot decrypt them without private keys.",
                "Attachment metadata that travels beside ciphertext: filename, MIME type, size, kind, View-once flag.",
                "Group names, member lists, and room joins/leaves.",
                "Typing start/stop, reaction emoji, delivery/read message IDs, View-once-opened acks.",
                "WebRTC SDP offers/answers and ICE candidates (which include IP addresses).",
            ]
        )
    )
    h2("4.3 What the relay must not see (and does not, if the client is honest)")
    s.append(
        bullets(
            [
                "ECDH or ECDSA private keys.",
                "AES-GCM keys (pairwise or group sender keys).",
                "Message plaintext.",
                "Raw photo/video bytes (only AES-GCM ciphertext).",
                "Microphone or camera samples (those stay on the WebRTC peer connection).",
            ]
        )
    )
    n(
        "A modified client can send plaintext. The protocol does not force other honest "
        "clients to accept unsigned or unverifiable payloads: 1:1 and group handlers "
        "verify ECDSA before showing content, and failed verification is shown as an error."
    )

    h1("5. Cryptographic building blocks")
    p(
        "All of the following are Web Crypto algorithm identifiers passed verbatim to "
        "<font name='Courier'>crypto.subtle</font>. There is no custom cipher, no "
        "Signal Double Ratchet, no X3DH, no prekeys, and no deniable encryption."
    )
    s.append(
        table(
            ["Job", "Algorithm", "Parameters", "Extractable / usages"],
            [
                [
                    "Key agreement (1:1 and wrapping group sender keys)",
                    "ECDH",
                    "namedCurve <b>P-256</b> (NIST secp256r1)",
                    "Keys generated extractable. Private usage: <font name='Courier'>deriveKey</font>. Peer public imported with empty usages.",
                ],
                [
                    "Message and file encryption",
                    "AES-GCM",
                    "Key length <b>256</b> bits. IV <b>12 bytes</b> (96-bit nonce) from CSPRNG. Web Crypto appends a 128-bit GCM tag to the ciphertext.",
                    "Pairwise derived keys: extractable <b>false</b>. Group sender keys: generated extractable so they can be exported raw and wrapped.",
                ],
                [
                    "Signatures",
                    "ECDSA",
                    "namedCurve <b>P-256</b>. Hash <b>SHA-256</b>.",
                    "Generated extractable. Usages <font name='Courier'>sign</font> and <font name='Courier'>verify</font>. Peer public imported with <font name='Courier'>verify</font> only.",
                ],
                [
                    "Fingerprints and (implicit) integrity of exported public keys",
                    "SHA-256",
                    "Digest of the <b>raw</b> ECDH public key bytes.",
                    "Hash only; not used as a MAC on messages (ECDSA covers that).",
                ],
                [
                    "IV / key generation",
                    "CSPRNG",
                    "<font name='Courier'>crypto.getRandomValues</font> for IVs; Web Crypto for keys.",
                    "IVs are never reused on purpose: a new 12-byte IV is created for every encrypt call.",
                ],
            ],
            [1.55 * inch, 1.15 * inch, 2.3 * inch, 2.1 * inch],
        )
    )
    cap("Table 2. Algorithms actually invoked. P-256 is NIST P-256, not Curve25519.")

    h2("5.1 Why this combination")
    p(
        "ECDH on P-256 is available in every modern browser without extra libraries. "
        "Each pair of users derives a shared AES-256-GCM key from (my private ECDH key, "
        "their public ECDH key). Because ECDH is symmetric in the two public points, "
        "Alice→Bob and Bob→Alice produce the same AES key. AES-GCM then provides "
        "confidentiality and ciphertext authenticity for that pair. ECDSA is a second "
        "key pair so that a man-in-the-middle who only swapped encryption keys still "
        "cannot forge a signature unless they also swapped signing keys — which fingerprints "
        "are meant to catch."
    )
    h2("5.2 What this is not")
    s.append(
        bullets(
            [
                "<b>Not Signal / Double Ratchet.</b> There is no per-message chain key, no skipped-message keys, and no future secrecy beyond 'close the tab'. Compromise of a private ECDH key decrypts all 1:1 traffic that used the corresponding pairwise AES key for that session.",
                "<b>Not X25519 / Ed25519.</b> The curve is NIST P-256.",
                "<b>Not password-authenticated.</b> No PAKE, no recovery codes.",
                "<b>Not sealed sender.</b> The relay always sees <font name='Courier'>from</font> as the socket id.",
            ]
        )
    )

    h1("6. Session bootstrap and key lifecycle")
    h2("6.1 On page load (init())")
    s.append(
        bullets(
            [
                "Apply theme from <font name='Courier'>?theme=</font>, else <font name='Courier'>localStorage e2ee.theme</font>, else <font name='Courier'>prefers-color-scheme</font>.",
                "Read display name from <font name='Courier'>localStorage e2ee.displayName</font> if present.",
                "<font name='Courier'>crypto.subtle.generateKey</font> for ECDH P-256 (extractable, usage deriveKey).",
                "Export the ECDH public key as JWK → <font name='Courier'>myPublicKeyJwk</font>.",
                "<font name='Courier'>generateKey</font> for ECDSA P-256 (extractable, sign+verify).",
                "Export the ECDSA public key as JWK → <font name='Courier'>mySigningPublicKeyJwk</font>.",
                "If no saved display name, generate a dummy name from the ECDH JWK coordinates (see §8).",
                "Compute the local fingerprint from the ECDH public key (see §7).",
                "If the socket is already connected, emit <font name='Courier'>register-key</font>.",
            ]
        )
    )
    h2("6.2 Registration payload")
    p("Event <font name='Courier'>register-key</font> body:")
    s.append(
        code_block(
            """{
  encryptKey:  <JWK of ECDH public key>,
  signKey:     <JWK of ECDSA public key>,
  displayName: <string, max 32 chars after sanitize>
}"""
        )
    )
    p(
        "The server stores that triple under <font name='Courier'>publicKeys[socket.id]</font> "
        "and broadcasts <font name='Courier'>peer-list</font> to every connected client. "
        "A later <font name='Courier'>update-name</font> changes only the display name and "
        "broadcasts again. Registration is rejected if either public key is missing."
    )
    h2("6.3 What is never persisted")
    p(
        "Private keys, derived AES keys, group sender keys, message history, receipts, "
        "and call state exist only in RAM in that tab. Closing or reloading the tab is a "
        "full identity reset. The next load is a new person as far as the network is concerned "
        "(new socket id, new keys). Only the display-name string and theme survive, via localStorage."
    )
    h2("6.4 Importing peers")
    p(
        "On <font name='Courier'>peer-list</font>, the client skips its own socket id. For every "
        "other entry with both keys, it <font name='Courier'>importKey</font>s the ECDH JWK "
        "(usages []) and the ECDSA JWK (usages ['verify']), stores them in "
        "<font name='Courier'>peerKeys</font> and <font name='Courier'>peerSigningKeys</font>, "
        "and records <font name='Courier'>peerProfiles[id].displayName</font>. Failed imports "
        "are logged and that peer is omitted from the visible list."
    )

    h1("7. Safety numbers (fingerprints)")
    p(
        "Fingerprints let two humans confirm they have the same ECDH public key, out of band "
        "(read aloud, compare screens). They are computed independently on each device from "
        "the local copy of a public key. The server is not involved."
    )
    h2("7.1 Algorithm")
    s.append(
        bullets(
            [
                "Export the ECDH public key with <font name='Courier'>exportKey('raw')</font>. For P-256 this is the uncompressed EC point (0x04 || X || Y), 65 bytes.",
                "SHA-256 that byte string → 32-byte digest.",
                "<b>Word form:</b> four words from <font name='Courier'>WORD_LIST</font>, joined by hyphens. Indexes are <font name='Courier'>hash[0]</font>, <font name='Courier'>hash[3]</font>, <font name='Courier'>hash[6]</font>, <font name='Courier'>hash[9]</font>, each modulo the list length.",
                "<b>Hex form:</b> the first 8 bytes of the digest, each printed as two lowercase hex digits (16 hex characters, no separators).",
            ]
        )
    )
    p(
        "Example shape: <font name='Courier'>echo-gravel-xray-quoll</font> plus hex "
        "<font name='Courier'>1e2fe7a07d634a3d</font>. The UI shows words in a large "
        "monospace line and hex underneath."
    )
    h2("7.2 Where they appear")
    p(
        "Your own fingerprint is computed once after key generation and shown in the "
        "Verify identity dialog. The selected 1:1 peer's fingerprint is computed when "
        "you open that chat (<font name='Courier'>selectPeer</font>) from "
        "<font name='Courier'>peerKeys[id]</font>. Groups do not show a pairwise fingerprint; "
        "the Verify button is hidden in group chats. Users are instructed to read the "
        "words aloud."
    )
    h2("7.3 What a match proves")
    p(
        "Matching words mean both devices hashed the same raw ECDH public key. That binds "
        "the encryption key. It does <b>not</b> by itself bind the ECDSA signing key "
        "(a separate JWK). In this app both keys are sent together on "
        "<font name='Courier'>register-key</font> and both are imported from the same "
        "peer-list row, so a relay that swaps only one of them would still be visible as "
        "a fingerprint mismatch on the encryption key, or as signature failures if only "
        "the signing key were swapped."
    )
    n(
        "Fingerprints are not SAS from a PAKE and not QR codes. There is no 'mark as verified' "
        "bit stored; verification is a human procedure each session."
    )

    h1("8. Display names, avatars, and the peer directory")
    h2("8.1 Design rule")
    p(
        "Socket IDs are implementation identifiers. The UI never shows them. Chats, headers, "
        "notifications, call screens, and group member lists use display names. The server "
        "still routes by socket id."
    )
    h2("8.2 Dummy name generation")
    p(
        "If localStorage has no name after keys exist, the client builds one from the ECDH "
        "public JWK:"
    )
    s.append(
        bullets(
            [
                "Seed string: <font name='Courier'>jwk.x + ':' + jwk.y</font> (the JWK coordinates).",
                "32-bit FNV-1a: offset basis 2166136261, prime 16777619, XOR then multiply for each character code.",
                "Adjective = <font name='Courier'>NAME_ADJECTIVES[abs(hash) % 24]</font>.",
                "Noun = <font name='Courier'>NAME_NOUNS[abs(hash &gt;&gt;&gt; 8) % 24]</font>.",
                "Result like <font name='Courier'>Calm Heron</font> or <font name='Courier'>Brave Grove</font>.",
            ]
        )
    )
    p(
        "The name is written to localStorage and included in <font name='Courier'>register-key</font>. "
        "The user can edit the sidebar field (max 32 characters). Input is debounced 400 ms "
        "and also sent on change via <font name='Courier'>update-name</font>."
    )
    h2("8.3 Server-side sanitize")
    p(
        "<font name='Courier'>sanitizeDisplayName</font> requires a string, collapses "
        "whitespace, trims, and slices to 32 characters. Empty names become "
        "<font name='Courier'>Anonymous</font> on the server. Group names use the same "
        "sanitizer."
    )
    h2("8.4 Avatars")
    p(
        "Initials: first letter of the first word plus first letter of the second word, "
        "uppercased (one letter if a single word). Color: 32-bit rolling hash "
        "<font name='Courier'>hash = hash * 31 + charCode</font> of a seed (socket id for "
        "people, group id for groups), modulo 12 colors. This is cosmetic, not a security property."
    )
    h2("8.5 Peer list rendering")
    p(
        "The Chats list is <font name='Courier'>visiblePeerIds</font> — everyone in the last "
        "peer-list who is not you and whose keys imported. Each row shows avatar, display "
        "name, a green presence dot, preview text (last message snippet, or 'typing…', or "
        "'Tap to chat'), and an unread badge. There is no 'Peers' heading exposing raw IDs."
    )

    h1("9. Presence, online status, and disconnect")
    h2("9.1 Online means 'registered in this process'")
    p(
        "A peer is online if their socket is connected <b>and</b> they have successfully "
        "emitted <font name='Courier'>register-key</font>. The server object "
        "<font name='Courier'>publicKeys</font> is the source of truth. "
        "<font name='Courier'>peer-list</font> is broadcast on register, on name change, "
        "and on disconnect."
    )
    h2("9.2 Client handling of peer-list")
    p(
        "The client rebuilds <font name='Courier'>visiblePeerIds</font>. Keys for IDs no "
        "longer in the list are deleted, and those IDs are removed from "
        "<font name='Courier'>typingPeers</font>. If you are in a 1:1 chat with someone "
        "who disappeared, the client toasts that they went offline and returns to the "
        "welcome screen. If a call is up with a vanished peer, the call is torn down "
        "locally without sending hangup (the socket is already gone)."
    )
    h2("9.3 Disconnect on the server")
    p(
        "Socket.IO <font name='Courier'>disconnect</font>: delete "
        "<font name='Courier'>publicKeys[id]</font>, remove the id from every group "
        "(deleting empty groups), broadcast peer-list, and broadcast group-list if "
        "membership changed. There is no 'last seen' timestamp and no offline inbox."
    )
    h2("9.4 Reconnect")
    p(
        "The client shows a top banner 'Reconnecting to the relay…'. On "
        "<font name='Courier'>connect</font> it hides the banner, re-registers keys, and "
        "requests groups. Because keys are still in RAM if the <b>socket</b> dropped but "
        "the <b>tab</b> did not, the same key pair is re-registered — but the socket id "
        "is new, so everyone else sees a new peer. If the tab itself reloaded, keys are new too."
    )
    h2("9.5 Header presence copy")
    p(
        "1:1 subtitle: <font name='Courier'>online · end-to-end encrypted</font>, or "
        "<font name='Courier'>typing…</font> while a typing event is active. Sidebar "
        "summary: <font name='Courier'>N online</font>. Group subtitle: member count and "
        "display names (you + others)."
    )

    h1("10. Direct (1:1) end-to-end messaging")
    h2("10.1 Shared AES key")
    p(
        "For peer P, the client calls <font name='Courier'>deriveKey</font> with algorithm "
        "ECDH, public = P's imported ECDH key, base key = my ECDH private key, derived "
        "key algorithm AES-GCM 256, extractable false, usages encrypt+decrypt. This is "
        "done on every send and every receive (no long-lived key cache). The operation is "
        "deterministic: both sides get the same AES key."
    )
    h2("10.2 Sending text")
    s.append(
        bullets(
            [
                "Read the composer, trim. Empty text is ignored.",
                "UTF-8 encode with <font name='Courier'>TextEncoder</font>.",
                "New 12-byte IV. AES-GCM encrypt. Base64 the IV and ciphertext (chunked; see §24).",
                "Build the signature payload (see §11) and ECDSA-sign it.",
                "Allocate <font name='Courier'>msgId</font> = base36(timestamp) + 4 random base36 chars.",
                "Emit <font name='Courier'>send-message</font> with to, msgType 'text', ciphertext, iv, both public JWKs, signature, msgId.",
                "Stop typing notifications. Append a local 'sent' bubble with tick 'sent'. Store the message under <font name='Courier'>messageStates[msgId]</font> for later ticks.",
            ]
        )
    )
    p("The plaintext is <b>not</b> on the wire. The signature is over the plaintext JSON, but only the signature bytes travel with the ciphertext.")
    h2("10.3 Receiving text")
    s.append(
        bullets(
            [
                "Immediately emit <font name='Courier'>msg-delivered</font> to the sender (the ciphertext arrived; decryption has not run yet).",
                "Clear typing state for that sender.",
                "Import sender keys if needed (messages also carry <font name='Courier'>senderPublicKey</font> / <font name='Courier'>senderSigningKey</font> so a race with peer-list still decrypts).",
                "Derive the same AES key. Decrypt. UTF-8 decode.",
                "Verify ECDSA over the reconstructed text payload.",
                "Append into conversation <font name='Courier'>peer:&lt;from&gt;</font>. Show a signed/unverified badge.",
                "Emit <font name='Courier'>msg-read</font> after successful handling (including after a failed decrypt path? only on the success path after append).",
                "Maybe show a desktop notification (§18).",
            ]
        )
    )
    h2("10.4 Conversation isolation")
    p(
        "Messages are stored per conversation key <font name='Courier'>peer:&lt;socketId&gt;</font> "
        "or <font name='Courier'>group:&lt;groupId&gt;</font>. Opening a chat renders only that "
        "array. If the conversation is not open, <font name='Courier'>unread</font> increments "
        "and a badge appears. Switching chats saves the composer draft in a Map keyed by "
        "conversation id and restores it on return. History is RAM-only."
    )
    h2("10.5 Composer")
    p(
        "Enter sends; Shift+Enter is a newline. The textarea autosizes up to 120 px. "
        "The composer is disabled until a peer or group is selected. Stick-to-bottom "
        "scrolling uses a 96 px slack: if you scrolled up, new messages do not yank the view."
    )

    h1("11. Signed messages (authentication)")
    h2("11.1 Why a second key")
    p(
        "ECDH+AES-GCM authenticates the <b>ciphertext</b> under the shared key. Anyone who "
        "can derive that key (the two parties, or an attacker who swapped both ECDH keys) "
        "can produce valid GCM tags. ECDSA is an origin signature under a key that is not "
        "used for encryption, so recipients can show a 'signed' badge meaning: this payload "
        "matches the signing public key we associated with that peer."
    )
    h2("11.2 Text payload (canonical JSON)")
    s.append(
        code_block(
            """JSON.stringify({
  msgType: "text",
  text: <plaintext string>
})"""
        )
    )
    p(
        "That exact UTF-8 string is what <font name='Courier'>subtle.sign({name:'ECDSA', hash:'SHA-256'}, privateSignKey, bytes)</font> "
        "signs. Verification uses the same JSON on the receiver after decrypt. Field order "
        "is the insertion order above; do not pretty-print or reorder keys."
    )
    h2("11.3 Attachment payload")
    s.append(
        code_block(
            """JSON.stringify({
  msgType: "attachment",
  name, mimeType, size, kind,
  viewOnce: Boolean(viewOnce),
  ciphertext,  // base64
  iv           // base64
})"""
        )
    )
    p(
        "Signing the ciphertext (not the raw file) means the signature is over what actually "
        "went on the wire plus the metadata, including the View-once flag. A relay that "
        "flips <font name='Courier'>viewOnce</font> or swaps the ciphertext will fail verification."
    )
    h2("11.4 Group payloads")
    p("Sender-key wrap:")
    s.append(
        code_block(
            """JSON.stringify({
  kind: "group-sender-key",
  groupId, keyId, recipientId,
  ciphertext, iv
})"""
        )
    )
    p("Group message:")
    s.append(
        code_block(
            """JSON.stringify({
  kind: "group-message",
  groupId, keyId, msgId, msgType,
  ciphertext, iv,
  attachmentMeta   // object or null
})"""
        )
    )
    h2("11.5 UI")
    p(
        "A small badge on every non-system bubble: green 'signed' if "
        "<font name='Courier'>verify</font> returned true, red 'unverified' otherwise. "
        "Failed group signatures are rejected with a system error line and the body is not shown."
    )
    n(
        "Display names are not signed. A relay can rename a peer in peer-list. Fingerprints "
        "still bind keys; they do not bind the label 'Calm Heron'."
    )

    h1("12. Delivery and read receipts")
    p("This is WhatsApp-style ticks, implemented as two relayed events. They are <b>not</b> encrypted and not signed.")
    s.append(
        table(
            ["Tick", "Meaning in this app", "How it is set"],
            [
                [
                    "✓  (gray, class tick-sent)",
                    "This tab emitted send-message (or the local echo of a group send).",
                    "Created with the outgoing bubble. Title 'sent'.",
                ],
                [
                    "✓✓ (gray, tick-delivered)",
                    "The recipient's client received the socket event and emitted msg-delivered. Decryption may not have succeeded yet.",
                    "On msg-delivered, look up messageStates[msgId] and updateTick('delivered').",
                ],
                [
                    "✓✓ (blue #53bdeb, tick-read)",
                    "The recipient finished the receive handler success path and emitted msg-read.",
                    "On msg-read, updateTick('read').",
                ],
            ],
            [1.7 * inch, 2.7 * inch, 2.7 * inch],
        )
    )
    cap("Table 3. Receipts. Group sends do not get ticks (no per-member ack protocol).")
    p(
        "Both events are <font name='Courier'>relayToPeer</font>: { to, msgId }. The server "
        "adds <font name='Courier'>from</font>. A missing to, a non-string to, or sending "
        "to self is dropped. There is no retry if the original sender already disconnected."
    )

    h1("13. Typing indicators")
    p(
        "1:1 only. While the composer has non-empty text and a peer is selected, the client "
        "emits <font name='Courier'>typing-start</font> once, then resets a 1200 ms timer "
        "on every input. When the timer fires, or the field is cleared, or the chat is left, "
        "or the tab unloads, it emits <font name='Courier'>typing-stop</font>."
    )
    p(
        "Receivers add/remove the sender in <font name='Courier'>typingPeers</font>, refresh "
        "the sidebar ('typing…' + blue dot), and if that chat is open, set the header subtitle "
        "to 'typing…' and the line under the thread to '&lt;name&gt; is typing…'. Incoming "
        "messages also clear typing for that sender. Groups have no typing events."
    )

    h1("14. Emoji reactions")
    p(
        "Quick set, hard-coded in the client as the four Unicode emoji heart, thumbs-up, "
        "face-with-tears-of-joy, and fire (the JS array is those four characters). The picker is shown on <b>received 1:1</b> "
        "messages only (hover on fine pointers; tap toggles <font name='Courier'>.is-picker-open</font> "
        "on touch). Clicking an emoji toggles it: second click on the same emoji removes it. "
        "Only one local reaction is stored at a time; changing emoji sends remove for the old "
        "one then add for the new."
    )
    p(
        "Wire: <font name='Courier'>message-reaction</font> { to, msgId, emoji, action } "
        "where action is <font name='Courier'>'add'</font> or <font name='Courier'>'remove'</font>. "
        "The original sender looks up <font name='Courier'>sent:&lt;msgId&gt;</font> in "
        "<font name='Courier'>messageRegistry</font> and sets <font name='Courier'>remoteReaction</font>. "
        "Chips render under the bubble ('you' vs the peer's display name). Reactions are not "
        "encrypted, not signed, and not implemented for groups."
    )

    h1("15. Groups and sender keys")
    h2("15.1 Room state on the server")
    p(
        "Groups are in-memory: id → { name, members: Set(socket.id) }. Create emits "
        "<font name='Courier'>create-group</font> { name }; the server makes "
        "<font name='Courier'>grp_</font> + Date.now().toString(36) + 4 random chars, "
        "adds the creator, <font name='Courier'>socket.join(groupId)</font>, broadcasts "
        "<font name='Courier'>group-list</font>, and emits <font name='Courier'>group-selected</font> "
        "to the creator. Join/leave add or remove the socket from the Set and the Socket.IO room. "
        "Empty groups are deleted. Group-list rows include id, name, members array, memberCount."
    )
    h2("15.2 Why sender keys")
    p(
        "A naive group send would ECDH-wrap the message once per member (fan-out N encrypts). "
        "This app instead gives <b>each member their own AES-256-GCM sender key</b>. A member "
        "encrypts group traffic once with their sender key; everyone else decrypts with the "
        "copy they were given. Distribution of that key is pairwise: wrapped to each other "
        "member with the 1:1 ECDH AES key, then signed."
    )
    h2("15.3 Local sender-key state (per group)")
    s.append(
        code_block(
            """{
  mySenderKey,          // CryptoKey AES-GCM 256
  mySenderKeyId,        // generateMsgId()
  remoteSenderKeys,     // { [socketId]: { keyId, key } }
  pendingMessages,      // ciphertext waiting for the matching keyId
  pendingDistributions, // member ids already wrapped this generation
  memberSnapshot        // sorted member ids joined by ':'
}"""
        )
    )
    h2("15.4 Rotation")
    p(
        "On every group-list and after peer-list, if the member snapshot string changed, "
        "the client <b>resets</b> that group's sender-key state (drops my key, remote keys, "
        "and pending queues) and generates a fresh sender key. That is the entire membership "
        "ratchet: new members must not read old sender keys; leaving members should not "
        "receive new ones. There is no delayed-leave window."
    )
    h2("15.5 Distribution")
    p(
        "For each other member with a known ECDH key who is not already in "
        "<font name='Courier'>pendingDistributions</font>: export sender key as 32 raw bytes, "
        "ECDH-derive the pairwise AES key, AES-GCM encrypt those 32 bytes, sign the wrap "
        "payload, push { to, ciphertext, iv, signature }. One "
        "<font name='Courier'>distribute-group-sender-key</font> event carries the array plus "
        "the sender's public encryption and signing JWKs. The server forwards each wrap only "
        "if both parties are still members and required fields exist."
    )
    h2("15.6 Receiving a wrap")
    p(
        "Verify ECDSA; reject with a system error if it fails. Decrypt the 32 bytes with the "
        "pairwise key, <font name='Courier'>importKey('raw', … AES-GCM 256)</font>, store under "
        "<font name='Courier'>remoteSenderKeys[from]</font>, then drain "
        "<font name='Courier'>pendingMessages</font> for that sender."
    )
    h2("15.7 Sending and receiving group messages")
    p(
        "Send: ensure local sender key, AES-GCM encrypt with <b>that</b> key (not pairwise), "
        "sign the group-message payload, emit <font name='Courier'>send-group-message</font>. "
        "The server checks membership and does <font name='Courier'>socket.to(groupId).emit</font> "
        "(everyone in the room except the sender). Receive: if we do not yet have "
        "<font name='Courier'>remoteSenderKeys[from].keyId === keyId</font>, queue the packet. "
        "Otherwise verify, decrypt, and render. Attachments use the same key with "
        "<font name='Courier'>encryptBytes</font>."
    )
    n(
        "Calls are 1:1 only. Group reactions, group typing, and group receipts are not implemented. "
        "The server can see group membership and ciphertext sizes."
    )

    h1("16. Photos, video, attachments, and View once")
    h2("16.1 What can be sent")
    p(
        "The file picker accepts <font name='Courier'>image/*,video/*</font>. Drag-and-drop "
        "onto the conversation and clipboard paste of a file also open the media composer. "
        "Non-image/non-video files are rejected with a toast. Empty files are rejected. "
        "Client size limit: <b>12 MiB</b> (<font name='Courier'>ATTACHMENT_SIZE_LIMIT</font>). "
        "Socket.IO <font name='Courier'>maxHttpBufferSize</font> is <b>20 MiB</b> to leave room "
        "for JSON/base64 expansion (~4/3) plus envelope fields."
    )
    h2("16.2 Composer")
    p(
        "Choosing a file does not send immediately. A modal previews the image or video, "
        "shows name and size, and offers a <b>View once</b> switch (default off). Cancel "
        "revokes the preview object URL. Send encrypts, then closes the modal."
    )
    h2("16.3 Encryption")
    p(
        "The file is read as <font name='Courier'>Uint8Array</font> via "
        "<font name='Courier'>arrayBuffer()</font>. 1:1 uses the pairwise AES-GCM key; groups "
        "use the sender key. Same 12-byte IV + AES-GCM as text. Metadata traveling with the "
        "ciphertext:"
    )
    s.append(
        code_block(
            """attachmentMeta = {
  name, mimeType, size,
  kind: "image" | "video" | "file",
  viewOnce: true | false
}"""
        )
    )
    p(
        "Kind is derived from the MIME prefix <font name='Courier'>image/</font> or "
        "<font name='Courier'>video/</font>. The signature covers metadata + ciphertext + iv "
        "(§11.3)."
    )
    h2("16.4 Normal media (viewOnce false)")
    p(
        "After decrypt, the client creates a blob URL and renders an "
        "<font name='Courier'>&lt;img&gt;</font> or <font name='Courier'>&lt;video controls playsinline&gt;</font>. "
        "Clicking a normal image opens a lightbox. The sender keeps a local blob URL of the "
        "original bytes (not re-downloaded)."
    )
    h2("16.5 View once — what it is")
    p(
        "A UX constraint inspired by WhatsApp view-once, <b>not</b> a cryptographic "
        "self-destruct that the recipient's OS cannot bypass. The ciphertext is ordinary "
        "AES-GCM. The flag tells honest clients to withhold a persistent preview."
    )
    h3("Recipient, unopened")
    p(
        "Decrypted bytes stay in RAM on the message object (<font name='Courier'>attachment.bytes</font>). "
        "<font name='Courier'>downloadUrl</font> is null. The bubble is a tile: 'View once photo' "
        "or 'View once video' — 'Tap to open. It disappears after viewing.' No thumbnail."
    )
    h3("Recipient, opening")
    p(
        "Click creates a blob URL, opens a fullscreen viewer. Videos autoplay, "
        "<font name='Courier'>controlsList='nodownload noremoteplayback'</font>, "
        "picture-in-picture disabled; ended → consume. Closing the viewer (X, overlay click, "
        "Escape) always consumes."
    )
    h3("Consume")
    p(
        "Revoke the blob URL. Set opened=true. Null out bytes and downloadUrl. Re-render the "
        "tile as 'Opened'. If the conversation key starts with <font name='Courier'>peer:</font>, "
        "emit <font name='Courier'>view-once-opened</font> { to: sender, msgId } so the sender "
        "can mark <font name='Courier'>openedByPeer</font>. Group view-once does not notify "
        "the whole room; consumption is local."
    )
    h3("Sender")
    p(
        "Keeps a normal preview of what they sent, labeled View once. When the 1:1 peer opens "
        "it, the sender's tile can show Opened while still displaying their own copy."
    )
    h2("16.6 What View once does not do")
    s.append(
        bullets(
            [
                "Does not stop screenshots, screen recording, or a modified client saving the bytes.",
                "Does not make the relay delete ciphertext (the relay never stored it beyond in-flight socket buffers).",
                "Does not survive reload: RAM is gone, so an unopened view-once is simply lost.",
                "Does not encrypt with a special one-time key; it is the same AES-GCM session key.",
            ]
        )
    )
    h2("16.7 Historical bug that was fixed")
    p(
        "An earlier path used <font name='Courier'>btoa(String.fromCharCode(...bytes))</font> "
        "on the whole file. Spreading a multi-megabyte Uint8Array overflows the JS call stack "
        "('Maximum call stack size exceeded'). Encoding now chunks at 0x8000 bytes (§24)."
    )

    h1("17. Voice and video calls (WebRTC)")
    h2("17.1 Scope")
    p(
        "1:1 only. Buttons in the chat header: phone (audio) and camera (video). Groups hide "
        "both. One call session per tab. A second offer while busy is answered with "
        "<font name='Courier'>type: 'busy'</font>."
    )
    h2("17.2 Media capture")
    p("getUserMedia constraints:")
    s.append(
        code_block(
            """audio: true
video: false                         // voice call
video: {                             // video call
  facingMode: "user",
  width:  { ideal: 1280 },
  height: { ideal: 720 }
}"""
        )
    )
    p(
        "Tracks are added to <font name='Courier'>RTCPeerConnection</font> with "
        "<font name='Courier'>addTrack</font>. Local video is shown muted "
        "(<font name='Courier'>#local-video</font>) so you do not hear yourself. Remote "
        "stream is attached in <font name='Courier'>pc.ontrack</font>. Audio-only calls "
        "add class <font name='Courier'>audio-only</font>, hide both video elements, and "
        "show a large avatar instead. The camera button is hidden on voice calls."
    )
    h2("17.3 Peer connection")
    s.append(
        code_block(
            """new RTCPeerConnection({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
})"""
        )
    )
    p(
        "No TURN, no multiple STUN, no iceTransportPolicy. Browsers will gather host, "
        "srflx (via Google STUN), and possibly existing relay candidates from the OS, but "
        "this app never provisions a TURN URI. Symmetric NAT / firewall pairs may fail. "
        "Localhost and many home NATs succeed."
    )
    h2("17.4 Signaling (all over Socket.IO call-signal)")
    p(
        "Client emits <font name='Courier'>{ to, data }</font>. Server relays "
        "<font name='Courier'>{ from, data }</font> if to is a different string. "
        "<font name='Courier'>data.type</font> is the discriminator:"
    )
    s.append(
        table(
            ["data.type", "Who sends it", "Payload", "Receiver action"],
            [
                [
                    "offer",
                    "Caller, after setLocalDescription(offer)",
                    "sdp: RTCSessionDescription, callType: 'audio' | 'video'",
                    "If idle: store remoteOffer, show incoming UI, start ringtone, 40 s timeout. If busy: reply busy.",
                ],
                [
                    "answer",
                    "Callee, after accept + setLocalDescription(answer)",
                    "sdp: RTCSessionDescription",
                    "Caller setRemoteDescription, flush queued ICE.",
                ],
                [
                    "ice",
                    "Either, on onicecandidate",
                    "candidate: RTCIceCandidate",
                    "If remote description not set yet, push on pendingIce[]; else addIceCandidate.",
                ],
                [
                    "hangup",
                    "Either, user ends or timeout 'No answer'",
                    "(none required)",
                    "cleanupCall(); toast 'Call ended'.",
                ],
                [
                    "reject",
                    "Callee Decline, or 40 s ring timeout, or getUserMedia failure on accept",
                    "(none)",
                    "Caller cleanup; toast 'Call declined'.",
                ],
                [
                    "busy",
                    "Callee already in callSession",
                    "(none)",
                    "Caller cleanup; toast 'Busy'.",
                ],
            ],
            [0.9 * inch, 1.7 * inch, 2.0 * inch, 2.5 * inch],
        )
    )
    cap("Table 4. Call signaling. SDP and ICE are not encrypted at the application layer.")
    h2("17.5 Offer/answer sequence (caller)")
    s.append(
        bullets(
            [
                "getUserMedia → create RTCPeerConnection → addTrack each track.",
                "createOffer → setLocalDescription(offer) (this starts ICE gathering).",
                "signal offer + callType. Show in-call UI with status 'Calling…'.",
                "40 s timer: if no answer, hangup with reason 'No answer'.",
                "On answer: setRemoteDescription, flushIce.",
                "onconnectionstatechange 'connected' → start MM:SS timer, set status to 'Voice call' or 'Video call'.",
                "'failed' or 'closed' → local end without hangup notify.",
            ]
        )
    )
    h2("17.6 Callee accept")
    p(
        "Incoming UI shows display name and 'Incoming voice/video call'. Accept is a user "
        "gesture (required for getUserMedia). Flow: getUserMedia → new PC → addTrack → "
        "setRemoteDescription(stored offer) → flush queued ICE → createAnswer → "
        "setLocalDescription → signal answer → show in-call 'Connecting'."
    )
    h2("17.7 In-call controls")
    s.append(
        bullets(
            [
                "<b>Mute:</b> toggles <font name='Courier'>enabled</font> on all local audio tracks. Button shows Mute / Unmute.",
                "<b>Camera:</b> toggles local video tracks. Off looks like a black/empty remote tile depending on the browser.",
                "<b>Hang up:</b> stop all local tracks, pc.close(), clear videos, signal hangup, hide overlays.",
                "beforeunload also sends hangup if a session exists.",
            ]
        )
    )
    h2("17.8 Media encryption (browser, not our code)")
    p(
        "WebRTC encrypts media with <b>DTLS-SRTP</b> (DTLS 1.2 handshake, then SRTP keys). "
        "That is inside Chromium/Firefox/WebKit. This codebase does not implement SRTP, does "
        "not pin DTLS certificates against the chat ECDH fingerprint, and does not use "
        "insertable streams / E2EE inserts. Identity for the call is 'the socket we signaled', "
        "plus whatever ICE path the browsers negotiated. An attacker who can MITM signaling "
        "and the media path could sit in the middle; an attacker who can only see the Node "
        "relay sees SDP/ICE but not the SRTP packets if the P2P path does not go through them."
    )
    h2("17.9 Ringtone")
    p(
        "Web Audio oscillator 680 Hz, gain 0.05, 180 ms pulse, interval 1100 ms. Autoplay "
        "may fail until a gesture; the incoming modal is still shown. stopRingtone closes "
        "the AudioContext."
    )
    h2("17.10 Timeouts and glare")
    p(
        "Incoming ring: 40 s then reject. Outgoing: 40 s then hangup 'No answer'. There is "
        "no glare-resolution (no 'lower socket id wins'). Simultaneous calls → one side is "
        "busy. No group calls, no screen share, no renegotiation mid-call (you cannot upgrade "
        "voice to video without a new call)."
    )

    h1("18. Browser notifications and in-app toasts")
    h2("18.1 Permission")
    p(
        "The bell button calls <font name='Courier'>Notification.requestPermission()</font>. "
        "If the API is missing, the button is disabled. If permission is granted or denied, "
        "the button is disabled and the title explains the state. There is no server-side "
        "push, no service worker, and no notification after the tab is fully closed."
    )
    h2("18.2 When a notification fires")
    p(
        "<font name='Courier'>maybeShowNotification(title, body, tag, conversationKey)</font> "
        "returns immediately unless permission is granted. It also suppresses the popup if "
        "the document is visible, focused, <b>and</b> the active conversation is the one "
        "the event belongs to. Clicking a notification focuses the window."
    )
    p("Sources: 1:1 text, 1:1 attachment, group text, group attachment, reaction add on one of your sent messages.")
    h2("18.3 Toasts")
    p(
        "Ephemeral in-app messages (4.2 s) for errors and call outcomes: send failures, "
        "media too large, already in a call, call declined/busy/ended, peer offline, "
        "getUserMedia errors. They are not encrypted events; they are local UI."
    )

    h1("19. Client UI systems")
    h2("19.1 Layout")
    p(
        "Desktop: CSS grid, 360 px sidebar + chat pane. Mobile (max-width 860 px): sidebar "
        "fills the screen; opening a chat hides the sidebar and shows the chat pane full "
        "screen with a back button. Welcome pane shows until a conversation is selected."
    )
    h2("19.2 Theme")
    p(
        "<font name='Courier'>document.documentElement.dataset.theme</font> is "
        "<font name='Courier'>light</font> or <font name='Courier'>dark</font>. CSS custom "
        "properties switch surfaces, bubbles, and wallpaper. Query "
        "<font name='Courier'>?theme=light|dark</font> overrides on load and writes localStorage."
    )
    h2("19.3 Verify dialog")
    p(
        "Modal with your fingerprint words+hex and the selected peer's words+hex, plus the "
        "instruction to read them aloud. Escape or backdrop click closes it."
    )
    h2("19.4 Message chrome")
    p(
        "Incoming bubbles left, outgoing right. Group incoming shows the sender display name "
        "in the bubble. Time is locale hh:mm. Date chips: Today, Yesterday, or "
        "<font name='Courier'>toLocaleDateString()</font>. Signature badge and ticks sit in "
        "the bubble meta row."
    )
    h2("19.5 Sidebar snippets")
    p(
        "Last message preview: text as-is; normal image → 'Photo'; video → 'Video'; view-once "
        "→ 'View once photo/video'; other files → name."
    )

    h1("20. Relay server internals")
    p(
        "<font name='Courier'>server.js</font> is a single Node process. State is two objects: "
        "<font name='Courier'>publicKeys</font> and <font name='Courier'>groups</font>. No "
        "database, no Redis, no TLS termination in-app (plain HTTP on :3000)."
    )
    h2("20.1 Static middleware")
    p(
        "Paths <font name='Courier'>/</font>, <font name='Courier'>*.html</font>, "
        "<font name='Courier'>*.css</font>, <font name='Courier'>*.js</font> get "
        "<font name='Courier'>Cache-Control: no-store</font> so UI iteration is not stuck on "
        "cached JS. Then <font name='Courier'>express.static(public/)</font>."
    )
    h2("20.2 Socket.IO options")
    p(
        "<font name='Courier'>maxHttpBufferSize: 20 * 1024 * 1024</font>. Default Engine.IO "
        "limit is 1 MiB, which would reject encrypted videos. There is no custom adapter; "
        "rooms are in-process only (one Node instance)."
    )
    h2("20.3 relayToPeer")
    p(
        "Helper used by send-message, typing, reactions, receipts, view-once-opened, and "
        "call-signal. Drops the event if <font name='Courier'>to</font> is missing, not a "
        "string, or equals the sender. Otherwise "
        "<font name='Courier'>io.to(to).emit(event, { from: socket.id, ...payload })</font>. "
        "It does not check that <font name='Courier'>to</font> is still in publicKeys; a "
        "disconnected target simply does not receive the packet."
    )
    h2("20.4 Group send path")
    p(
        "<font name='Courier'>send-group-message</font> is not relayToPeer. It checks "
        "<font name='Courier'>isGroupMember</font>, then "
        "<font name='Courier'>socket.to(groupId).emit('receive-group-message', { groupId, from, ... })</font>. "
        "Non-members cannot inject into the room via this handler. The server does not "
        "inspect ciphertext."
    )
    h2("20.5 Sender-key distribution guard")
    p(
        "Requires groupId, keyId, an array of distributions, and membership of the sender. "
        "Each element needs to, ciphertext, iv, signature; to ≠ sender; to must be a member. "
        "Valid rows are forwarded as <font name='Courier'>group-sender-key</font>."
    )

    h1("21. Complete Socket.IO event catalog")
    p("Unless noted, payloads are JSON. Binary is not used; ciphertext is base64 inside JSON.")
    s.append(
        table(
            ["Event", "Dir", "Content on the wire", "Encrypted?"],
            [
                ["register-key", "C to S", "encryptKey JWK, signKey JWK, displayName", "No (public)"],
                ["update-name", "C to S", "displayName string", "No"],
                ["peer-list", "S to all", "[{ id, displayName, encryptKey, signKey }]", "No"],
                ["send-message", "C to S", "to, msgType, ciphertext, iv, attachmentMeta?, keys, signature, msgId", "Body yes"],
                ["receive-message", "S to peer", "from + same fields", "Body yes"],
                ["msg-delivered / msg-read", "relay", "to, msgId", "No"],
                ["typing-start / typing-stop", "relay", "to", "No"],
                ["message-reaction", "relay", "to, msgId, emoji, action", "No"],
                ["view-once-opened", "relay", "to, msgId", "No"],
                ["call-signal", "relay", "to, data.{type, sdp?, candidate?, callType?}", "No (SDP)"],
                ["request-groups", "C to S", "(none)", "-"],
                ["group-list", "S to clients", "[{ id, name, members, memberCount }]", "No"],
                ["create-group", "C to S", "name", "No"],
                ["group-selected", "S to creator", "groupId", "No"],
                ["join-group / leave-group", "C to S", "groupId", "No"],
                ["distribute-group-sender-key", "C to S", "groupId, keyId, public JWKs, distributions[]", "Key wrap yes"],
                ["group-sender-key", "S to member", "from, groupId, keyId, ciphertext, iv, signature, JWKs", "Key wrap yes"],
                ["send-group-message", "C to S", "groupId, keyId, msgType, ciphertext, iv, meta, signature, msgId", "Body yes"],
                ["receive-group-message", "S to room", "groupId, from, + same (not echoed to sender)", "Body yes"],
                ["connect / disconnect", "engine", "socket id", "-"],
            ],
            [1.9 * inch, 1.05 * inch, 2.55 * inch, 1.6 * inch],
        )
    )
    cap(
        "Table 5. Every application event. Dir 'relay' means client to server to target peer. "
        "'Body yes' means plaintext is not on the wire; ciphertext is."
    )

    h1("22. In-memory client and server state")
    h2("22.1 Server")
    s.append(
        bullets(
            [
                "<font name='Courier'>publicKeys[socketId] = { encryptKey, signKey, displayName }</font>",
                "<font name='Courier'>groups[groupId] = { name, members: Set }</font>",
                "Socket.IO rooms named by groupId",
            ]
        )
    )
    h2("22.2 Client maps and sets")
    s.append(
        table(
            ["Name", "Holds"],
            [
                ["peerKeys / peerSigningKeys", "Imported CryptoKey objects keyed by socket id"],
                ["peerProfiles", "displayName per socket id"],
                ["visiblePeerIds", "Online peers to render"],
                ["typingPeers", "Set of socket ids currently typing"],
                ["groups", "Map of group id → last group-list row"],
                ["groupSenderKeyState", "Per-group sender-key machine (§15.3)"],
                ["conversations", "Map of conversation key → { messages, unread, lastMessage }"],
                ["drafts", "Unsent composer text per conversation"],
                ["messageRegistry", "messageKey → message object (reactions)"],
                ["messageStates", "msgId → outgoing 1:1 message (ticks)"],
                ["callSession", "Single { peerId, callType, role, pc, localStream, pendingIce, timers } or null"],
            ],
            [2.3 * inch, 4.8 * inch],
        )
    )

    h1("23. Constants, limits, and identifiers")
    s.append(
        table(
            ["Constant", "Value", "Role"],
            [
                ["Port", "3000", "HTTP + Socket.IO"],
                ["maxHttpBufferSize", "20 MiB", "Socket.IO incoming packet cap"],
                ["ATTACHMENT_SIZE_LIMIT", "12 MiB", "Client reject before encrypt"],
                ["AES key", "256-bit", "GCM"],
                ["IV", "12 bytes", "Per encrypt"],
                ["GCM tag", "128-bit (Web Crypto default)", "Appended to ciphertext"],
                ["Curve", "P-256", "ECDH and ECDSA"],
                ["Hash", "SHA-256", "ECDSA and fingerprints"],
                ["Display name", "32 chars", "Sanitize slice"],
                ["Typing idle", "1200 ms", "Auto typing-stop"],
                ["Call ring/answer", "40 s", "Reject or 'No answer'"],
                ["Toast", "4200 ms", "Auto-remove"],
                ["Ringtone", "680 Hz, 180 ms, every 1100 ms", "Incoming call"],
                ["STUN", "stun:stun.l.google.com:19302", "ICE only"],
                ["Video ideal", "1280×720, user camera", "getUserMedia"],
                ["Quick reactions", "heart, thumbs-up, joy, fire", "Picker (Unicode emoji in app.js)"],
                ["Theme storage", "e2ee.theme", "light | dark"],
                ["Name storage", "e2ee.displayName", "string"],
                ["Base64 chunk", "0x8000 bytes", "Avoid call-stack overflow"],
            ],
            [1.9 * inch, 2.4 * inch, 2.8 * inch],
        )
    )
    cap("Table 6. Numbers you can grep in the source.")
    h2("23.1 Identifier formats")
    s.append(
        bullets(
            [
                "<b>socket.id</b> — assigned by Socket.IO (e.g. <font name='Courier'>k-NNfG9x…</font>). Routing key. Hidden in UI.",
                "<b>msgId</b> — <font name='Courier'>Date.now().toString(36) + Math.random().toString(36).slice(2,6)</font>. Unique enough for a session, not a UUID.",
                "<b>groupId</b> — <font name='Courier'>grp_</font> + same timestamp/random pattern.",
                "<b>sender keyId</b> — same generator as msgId.",
                "<b>conversationKey</b> — <font name='Courier'>peer:&lt;id&gt;</font> or <font name='Courier'>group:&lt;id&gt;</font>.",
                "<b>messageKey</b> — <font name='Courier'>sent:&lt;msgId&gt;</font>, <font name='Courier'>received:&lt;peerId&gt;:&lt;msgId&gt;</font>, or <font name='Courier'>group:&lt;groupId&gt;:&lt;senderId&gt;:&lt;msgId&gt;</font>.",
            ]
        )
    )

    h1("24. Encoding and serialization")
    h2("24.1 JWK public keys")
    p(
        "Web Crypto <font name='Courier'>exportKey('jwk')</font> for EC P-256 public keys "
        "yields <font name='Courier'>{ kty:'EC', crv:'P-256', x, y, ext:true }</font> "
        "(and <font name='Courier'>key_ops</font>). These JSON objects are what the relay "
        "stores and fans out. Private JWKs are never exported in this codebase."
    )
    h2("24.2 Base64 of binary")
    p(
        "<font name='Courier'>bytesToBase64</font> walks the Uint8Array in 32768-byte "
        "windows, <font name='Courier'>String.fromCharCode(...subarray)</font> each window, "
        "concatenates, then <font name='Courier'>btoa</font>. Decode: "
        "<font name='Courier'>atob</font> then <font name='Courier'>charCodeAt</font> into "
        "a Uint8Array. This is standard base64, not base64url. IVs, ciphertexts, signatures, "
        "and wrapped sender keys all use it."
    )
    h2("24.3 Text")
    p("UTF-8 via TextEncoder / TextDecoder. JSON.stringify for signature payloads with a fixed key order as written in source.")
    h2("24.4 SDP")
    p(
        "RTCSessionDescription objects are sent as the browser produces them (type + sdp "
        "string). ICE candidates are the RTCIceCandidate init dictionaries. No trickle "
        "policy beyond 'send every onicecandidate'."
    )

    h1("25. Security properties and honest limitations")
    h2("25.1 Properties you can claim for an honest, unmodified client")
    s.append(
        bullets(
            [
                "The Node relay cannot read message text or attachment bytes.",
                "GCM tags detect bit-flips on ciphertext (with the usual AES-GCM caveats).",
                "ECDSA detects forged or altered signed payloads if the signing key is the one you fingerprinted alongside the encryption key.",
                "Group sender keys are wrapped to members pairwise; non-members are not sent wraps (server-enforced membership check plus client skip).",
                "WebRTC media is DTLS-SRTP between browsers when ICE succeeds.",
            ]
        )
    )
    h2("25.2 Properties you must not claim")
    s.append(
        bullets(
            [
                "<b>No forward secrecy.</b> One ECDH private key decrypts all 1:1 messages of that tab session.",
                "<b>No post-compromise security / ratchet.</b>",
                "<b>No persistent identity.</b> Refresh = new keys. You cannot verify a person across days except by reading fingerprints every session.",
                "<b>No metadata privacy.</b> Who talked to whom, when, sizes, names, SDP IPs are visible to the relay.",
                "<b>Display names are not authenticated.</b>",
                "<b>View once is not screenshot-proof and not cryptographically enforced.</b>",
                "<b>No TURN.</b> Calls can fail on hard NAT.",
                "<b>No certificate pinning of the web origin.</b> A malicious host serving this JS can steal keys.",
                "<b>No multi-device.</b> Each tab is a separate person.",
                "<b>No offline delivery.</b> If the peer is gone, the ciphertext is dropped.",
                "<b>Receipts and typing are forgeable</b> by anyone who can emit as that socket (i.e. the client or a compromised tab).",
                "<b>Call signaling is not bound to chat fingerprints</b> (no SAS on DTLS certs).",
                "<b>P-256 is not the Signal curve.</b> Implementation quality equals the browser's Web Crypto.",
                "<b>Single-process relay.</b> Restart wipes online users and groups.",
            ]
        )
    )
    h2("25.3 XSS / injection")
    p(
        "Message text is assigned with <font name='Courier'>textContent</font>, not innerHTML. "
        "Display names likewise. SVG icons are constants in source. This is the correct DOM "
        "discipline for not executing peer-controlled HTML."
    )

    h1("26. Repository map")
    s.append(
        table(
            ["Path", "Role"],
            [
                ["package.json", "name e2ee, start script, dependencies express + socket.io"],
                ["server.js", "HTTP static + Socket.IO relay, all server events"],
                ["public/index.html", "DOM: sidebar, chat, modals, call overlays"],
                ["public/styles.css", "Light/dark tokens, layout, bubbles, call UI"],
                ["public/app.js", "All client crypto, UI, WebRTC, notifications"],
                ["public/socket.io/socket.io.js", "Served by the Socket.IO library, not a file in git"],
            ],
            [2.2 * inch, 4.9 * inch],
        )
    )
    p("No test suite beyond <font name='Courier'>node --check server.js</font>. No TypeScript. No bundler.")

    h1("27. Worked examples")
    h2("27.1 Alice sends the text “Hello” to Bob")
    s.append(
        bullets(
            [
                "Alice's tab already has ECDH (dA, QA) and ECDSA (sA, SA). Bob is in peer-list with QB, SB. Alice selected Bob.",
                "sharedKey = ECDH(dA, QB) → AES-256-GCM key K. Bob will compute ECDH(dB, QA) = K.",
                "iv = 12 random bytes. C = AES-GCM_K(UTF-8('Hello'), iv).",
                "sig = ECDSA-SHA256_sA( JSON {msgType:'text', text:'Hello'} ).",
                "Alice → server: send-message { to: bobSocket, msgType:'text', ciphertext:b64(C), iv:b64(iv), senderPublicKey:QA, senderSigningKey:SA, signature:b64(sig), msgId }.",
                "Server → Bob: receive-message { from: aliceSocket, …same… }.",
                "Bob emits msg-delivered immediately. Decrypts with K. Verifies sig with SB. Shows bubble + signed. Emits msg-read.",
                "Alice's ticks go ✓ then ✓✓ gray then ✓✓ blue. Relay saw sockets, sizes, and base64, not 'Hello'.",
            ]
        )
    )
    h2("27.2 Alice starts a video call to Bob")
    s.append(
        bullets(
            [
                "getUserMedia(audio + 1280×720 user camera). RTCPeerConnection with Google STUN. addTrack all tracks.",
                "createOffer/setLocalDescription. ICE gathering starts. Each candidate → call-signal { type:'ice' }.",
                "call-signal { type:'offer', sdp, callType:'video' } to Bob.",
                "Bob's tab is idle: incoming overlay, 680 Hz ringtone, 40 s timer. Bob clicks Accept (user gesture).",
                "Bob getUserMedia, new PC, setRemoteDescription(offer), add queued ICE, createAnswer, setLocalDescription, signal answer.",
                "Alice setRemoteDescription(answer), flush ICE. DTLS handshake, SRTP keys, connectionstate connected, timer 00:00.",
                "RTP audio/video flows peer-to-peer. Node only saw SDP and ICE (including candidates/IPs).",
                "Hang up: stop tracks, pc.close(), call-signal hangup.",
            ]
        )
    )
    h2("27.3 View-once photo")
    s.append(
        bullets(
            [
                "Alice picks a JPEG, toggles View once, Send. Bytes AES-GCM encrypted with K. attachmentMeta.viewOnce=true is inside the signed JSON.",
                "Bob decrypts, keeps bytes in RAM, shows a tile with no thumbnail.",
                "Bob taps: blob URL, fullscreen image. Close → revoke URL, bytes = null, tile 'Opened', view-once-opened to Alice.",
                "A dishonest Bob could have copied bytes before closing. The protocol cannot stop that.",
            ]
        )
    )

    h1("28. Glossary")
    s.append(
        table(
            ["Term", "Meaning in this project"],
            [
                ["Relay / server", "The Node process. Not a CA, not an IdP, not a media SFU."],
                ["Peer", "Another browser tab that registered keys. Identified by socket.id internally."],
                ["Pairwise key", "AES-256-GCM derived via ECDH P-256 between two users."],
                ["Sender key", "Per-member AES-256-GCM key for encrypting that member's group messages."],
                ["Fingerprint / safety number", "Four words + 16 hex chars from SHA-256(raw ECDH public key)."],
                ["Signed", "ECDSA-P-256-SHA-256 over a canonical JSON payload verified."],
                ["View once", "Honest-client flag to show media once, then drop RAM copies."],
                ["STUN", "Session Traversal Utilities for NAT — discovers public ICE candidates. Not a media relay."],
                ["TURN", "Relays media when P2P ICE fails. Not deployed here."],
                ["SDP", "Session Description Protocol — offer/answer text WebRTC uses to agree codecs and ICE."],
                ["ICE", "Interactive Connectivity Establishment — candidate pairs until one path works."],
                ["DTLS-SRTP", "How browsers encrypt WebRTC media after the DTLS handshake."],
                ["JWK", "JSON Web Key — the export format of public EC keys on the wire."],
                ["GCM", "Galois/Counter Mode — AEAD mode of AES used for all chat payloads."],
            ],
            [1.7 * inch, 5.4 * inch],
        )
    )

    s.append(Spacer(1, 16))
    p(
        "<b>End of specification.</b> If a behavior is not in this document, it is not in "
        "the current codebase. Adding accounts, the Signal protocol, TURN, or persistent "
        "keys would be new work, not a hidden mode of what ships today."
    )
    return s


def main():
    doc = SimpleDocTemplate(
        OUT,
        pagesize=letter,
        leftMargin=ML,
        rightMargin=MR,
        topMargin=MT,
        bottomMargin=MB,
        title="E2EE Chat — Complete Technical Specification",
        author="E2EE Chat codebase",
        subject="Algorithms, features, signaling, and limitations as implemented",
    )
    doc.build(
        story(),
        onFirstPage=cover_page,
        onLaterPages=header_footer,
    )
    print(OUT)


if __name__ == "__main__":
    main()

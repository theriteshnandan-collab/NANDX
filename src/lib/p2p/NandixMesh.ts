import Peer, { DataConnection, MediaConnection } from "peerjs";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { logFileTransfer, updateFileStatus, touchContact, bumpMessageCount, db, updateMessageStatus, getPendingMessages, ChatMessage } from "@/lib/db/NandixDB";
import { sovereignCrypto, SovereignCrypto } from "@/lib/crypto/SovereignCrypto";
import { trustEngine, TrustVouch } from "@/lib/crypto/TrustEngine";
import { BinaryProtocol } from "./BinaryProtocol";

/**
 * NANDIX PROTOCOL TYPE
 */
export type TridentWire = "RED" | "BLUE" | "GREEN";

export interface NandixPacket {
    type: string;
    wire: TridentWire;
    payload: any;
    meta?: {
        name?: string;
        size?: number;
        chunkIndex?: number;
        totalChunks?: number;
    };
}

/**
 * NANDIX MESH ENGINE v4 (The Trident)
 * Nuclear rebuild — PeerJS auto-IDs, no error recovery complexity,
 * direct chat relay, ICE servers for NAT traversal.
 */
export class NandixMesh {
    private static instance: NandixMesh;
    private peer: Peer | null = null;
    private ydoc: Y.Doc;
    private provider: WebrtcProvider | null = null;
    private currentSwarm: string | null = null;

    // Lanes
    private chatConnections: Map<string, DataConnection> = new Map();
    private fileConnections: Map<string, DataConnection> = new Map();
    private voiceConnections: Map<string, MediaConnection> = new Map();

    // Streaming Buffers
    private incomingStreams: Map<string, { chunks: BlobPart[], received: number, total: number, name: string, dbId?: number, encrypted?: boolean }> = new Map();
    private connectionQuality: Map<string, "direct" | "relay" | "unknown"> = new Map();
    private presence: Map<string, { status: "online" | "away" | "offline", lastSeen: number, profile?: any }> = new Map();
    private heartbeatTimer: NodeJS.Timeout | null = null;

    private myId: string | null = null;
    private packetListeners: Set<(packet: NandixPacket) => void> = new Set();
    private onStreamProgress?: (progress: number, fileName: string) => void;
    private connectionChangeCallback?: (count: number) => void;
    private onTypingCallback?: (peerId: string, isTyping: boolean) => void;
    private onSeenCallback?: (peerId: string, messageId: string) => void;
    private onReactionCallback?: (peerId: string, messageId: string, emoji: string) => void;
    private onRoomInviteCallback?: (peerId: string, roomId: string, roomName: string, inviteCode: string) => void;
    private onProfileCallback?: (peerId: string, profile: any) => void;
    private onIncomingCallCallback?: (call: MediaConnection) => void;
    private onRemoteStreamCallback?: (peerId: string, stream: MediaStream) => void;
    private onCallCloseCallback?: (peerId: string) => void;
    private onTrustVouchCallback?: (vouch: TrustVouch) => void;
    private onBotAnnounceCallback?: (peerId: string, botData: any) => void;
    private onConnectionCallback?: (peerId: string) => void;
    private onMessageCallback?: (peerId: string, text: string) => void;
    private onPresenceCallback?: (peerId: string, status: string) => void;

    private constructor() {
        this.ydoc = new Y.Doc();
    }

    public static getInstance(): NandixMesh {
        if (!NandixMesh.instance) {
            NandixMesh.instance = new NandixMesh();
        }
        return NandixMesh.instance;
    }

    public setPacketListener(cb: (packet: NandixPacket) => void) {
        this.packetListeners.add(cb);
        return () => this.packetListeners.delete(cb);
    }

    public setProgressListener(callback: (progress: number, fileName: string) => void) {
        this.onStreamProgress = callback;
    }

    public onConnectionChange(callback: (count: number) => void) {
        this.connectionChangeCallback = callback;
    }

    public getConnectedPeers(): number {
        return this.chatConnections.size;
    }

    public getConnectedPeerIds(): string[] {
        return Array.from(this.chatConnections.keys());
    }

    public onIncomingCall(callback: (call: MediaConnection) => void) {
        this.onIncomingCallCallback = callback;
    }

    public onRemoteStream(callback: (peerId: string, stream: MediaStream) => void) {
        this.onRemoteStreamCallback = callback;
    }

    public onCallClose(callback: (peerId: string) => void) {
        this.onCallCloseCallback = callback;
    }

    private notifyConnectionChange() {
        if (this.connectionChangeCallback) {
            this.connectionChangeCallback(this.chatConnections.size);
        }
    }

    /**
     * 🔬 DIAGNOSTIC: Get full connection state for debugging
     */
    public getDiagnostics(): {
        peerId: string | null;
        peerOpen: boolean;
        peerDestroyed: boolean;
        chatConns: string[];
        chatConnsOpen: boolean[];
        fileConns: string[];
    } {
        return {
            peerId: this.peer?.id || null,
            peerOpen: this.peer?.open || false,
            peerDestroyed: this.peer?.destroyed || false,
            chatConns: Array.from(this.chatConnections.keys()),
            chatConnsOpen: Array.from(this.chatConnections.values()).map(c => c.open),
            fileConns: Array.from(this.fileConnections.keys()),
        };
    }

    /**
     * Boot the PeerJS identity.
     * NUCLEAR: Let PeerJS auto-generate IDs. No custom IDs, no error recovery.
     * This is the simplest, most reliable path to a working connection.
     */
    public async initialize(id?: string): Promise<string> {
        return new Promise((resolve) => {
            if (this.peer && this.peer.open && this.myId) {
                console.log(`[TRIDENT] Already initialized: ${this.myId}`);
                return resolve(this.myId);
            }

            // Destroy any stale peer
            if (this.peer) {
                try { this.peer.destroy(); } catch (_) { }
                this.peer = null;
            }

            // ICE servers for NAT traversal (critical for cross-network connections)
            const config = {
                debug: 2, // Extra verbose for debugging
                config: {
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" },
                        { urls: "stun:stun1.l.google.com:19302" },
                        { urls: "stun:stun2.l.google.com:19302" },
                        // 🌐 TURN Relays (OpenRelayProject)
                        {
                            urls: "turn:openrelay.metered.ca:80",
                            username: "openrelayproject",
                            credential: "openrelayproject"
                        },
                        {
                            urls: "turn:openrelay.metered.ca:443",
                            username: "openrelayproject",
                            credential: "openrelayproject"
                        },
                        {
                            urls: "turn:openrelay.metered.ca:443?transport=tcp",
                            username: "openrelayproject",
                            credential: "openrelayproject"
                        }
                    ]
                }
            };

            // If a custom ID is provided, use it. Otherwise let PeerJS auto-generate.
            this.peer = id ? new Peer(id, config) : new Peer(config);

            // Timeout: 15 seconds
            const timeout = setTimeout(() => {
                const fallback = this.peer?.id || `nandix-${Date.now().toString(36)}`;
                this.myId = fallback;
                console.warn(`[TRIDENT] ⏰ Timeout. Fallback ID: ${fallback}`);
                resolve(fallback);
            }, 15000);

            this.peer.on("open", (peerId) => {
                clearTimeout(timeout);
                this.myId = peerId;
                console.log(`[TRIDENT] ✅ PEER OPEN: ${peerId}`);
                resolve(peerId);
            });

            this.peer.on("error", (err: any) => {
                console.error(`[TRIDENT] ❌ PeerJS Error:`, err.type, err.message || err);

                // If disconnected from server, try to reconnect
                if (err.type === "network" || err.type === "peer-unavailable" || err.type === "disconnected") {
                    console.log(`[TRIDENT] ⚠️ Network error. Attempting reconnect in 3s...`);
                    setTimeout(() => {
                        if (this.peer && !this.peer.destroyed) {
                            this.peer.reconnect();
                        }
                    }, 3000);
                }

                // If the ID is taken, retry without custom ID
                if (err.type === "unavailable-id" && id) {
                    console.log(`[TRIDENT] 🔄 ID taken, retrying with auto-ID...`);
                    clearTimeout(timeout);
                    try { this.peer?.destroy(); } catch (_) { }

                    this.peer = new Peer(config);
                    this.peer.on("open", (autoId) => {
                        this.myId = autoId;
                        console.log(`[TRIDENT] ✅ AUTO-ID OPEN: ${autoId}`);
                        // Re-register ALL listeners on the new peer
                        this.registerPeerListeners();
                        resolve(autoId);
                    });
                    this.peer.on("error", (e2: any) => {
                        console.error(`[TRIDENT] ❌ FATAL:`, e2);
                    });
                    this.registerPeerListeners();
                }
            });

            this.peer.on("disconnected", () => {
                console.warn("[TRIDENT] ⚠️ Peer disconnected from server. Auto-reconnecting...");
                if (this.peer && !this.peer.destroyed) {
                    this.peer.reconnect();
                }
            });

            this.registerPeerListeners();
        });
    }

    /**
     * Register connection and call listeners on the current peer.
     * Called during init and error recovery to ensure listeners are always attached.
     */
    private registerPeerListeners() {
        if (!this.peer) return;

        // Remove existing listeners to prevent duplicates
        this.peer.removeAllListeners("connection");
        this.peer.removeAllListeners("call");

        this.peer.on("connection", (conn) => {
            console.log(`[TRIDENT] 📡 INCOMING connection from ${conn.peer} (label: ${conn.label})`);
            this.handleIncomingConnection(conn);
        });

        this.peer.on("call", (call) => {
            console.log(`[TRIDENT] 📞 Incoming call from ${call.peer}`);
            this.voiceConnections.set(call.peer, call);
            if (this.onIncomingCallCallback) {
                this.onIncomingCallCallback(call);
            }

            call.on("stream", (remoteStream) => {
                console.log(`[TRIDENT] 🎙️ Remote stream received from ${call.peer}`);
                if (this.onRemoteStreamCallback) {
                    this.onRemoteStreamCallback(call.peer, remoteStream);
                }
            });

            call.on("close", () => {
                console.log(`[TRIDENT] 🔇 Call closed by ${call.peer}`);
                this.voiceConnections.delete(call.peer);
                if (this.onCallCloseCallback) this.onCallCloseCallback(call.peer);
            });

            call.on("error", (err) => {
                console.error(`[TRIDENT] ❌ MediaConnection error with ${call.peer}:`, err);
                this.voiceConnections.delete(call.peer);
                if (this.onCallCloseCallback) this.onCallCloseCallback(call.peer);
            });
        });
    }

    /**
     * Connect to a peer across both lanes.
     */
    public async connectToPeer(peerId: string): Promise<DataConnection | null> {
        if (!this.peer || !this.peer.open) {
            console.error(`[TRIDENT] ❌ Cannot connect: peer not open. State: open=${this.peer?.open}, destroyed=${this.peer?.destroyed}`);
            return null;
        }
        if (peerId === this.myId) {
            console.warn(`[TRIDENT] ⚠️ Cannot connect to yourself`);
            return null;
        }

        if (this.chatConnections.has(peerId)) {
            return this.chatConnections.get(peerId)!;
        }

        console.log(`[TRIDENT] 🔗 Connecting to ${peerId}...`);

        return new Promise((resolve) => {
            // 1. Establish RED WIRE (Chat/Control)
            const chatConn = this.peer!.connect(peerId, { label: "RED", reliable: true });

            const timeout = setTimeout(() => {
                console.warn(`[TRIDENT] ⚠️ Connection to ${peerId} timed out`);
                resolve(null);
            }, 10000);

            chatConn.on("open", () => {
                clearTimeout(timeout);
                this.setupConnection(chatConn, "RED");
                // 2. Establish BLUE WIRE (Files/Heavy) - Non-blocking
                const fileConn = this.peer!.connect(peerId, { label: "BLUE", reliable: true });
                this.setupConnection(fileConn, "BLUE");
                resolve(chatConn);
            });

            chatConn.on("error", (err) => {
                clearTimeout(timeout);
                console.error(`[TRIDENT] ❌ Connection error to ${peerId}:`, err);
                resolve(null);
            });
        });
    }

    /**
     * Initiate a Voice/Video call.
     */
    public callPeer(peerId: string, stream: MediaStream) {
        if (!this.peer || !this.peer.open) return;

        console.log(`[TRIDENT] 🚀 Initiating call to ${peerId}...`);
        const call = this.peer.call(peerId, stream);
        this.voiceConnections.set(peerId, call);

        call.on("stream", (remoteStream) => {
            console.log(`[TRIDENT] 🎙️ Remote stream received from ${peerId}`);
            if (this.onRemoteStreamCallback) {
                this.onRemoteStreamCallback(peerId, remoteStream);
            }
        });

        call.on("close", () => {
            console.log(`[TRIDENT] 🔇 Call closed by ${peerId}`);
            this.voiceConnections.delete(peerId);
            if (this.onCallCloseCallback) this.onCallCloseCallback(peerId);
        });

        return call;
    }

    public answerCall(peerId: string, stream: MediaStream) {
        const call = this.voiceConnections.get(peerId);
        if (call) {
            console.log(`[TRIDENT] ✅ Answering call from ${peerId}`);
            call.answer(stream);
        }
    }

    public rejectCall(peerId: string) {
        const call = this.voiceConnections.get(peerId);
        if (call) {
            console.log(`[TRIDENT] ❌ Rejecting call from ${peerId}`);
            call.close();
            this.voiceConnections.delete(peerId);
        }
    }

    public endCall(peerId: string) {
        const call = this.voiceConnections.get(peerId);
        if (call) {
            console.log(`[TRIDENT] 🛑 Ending call with ${peerId}`);
            call.close();
            this.voiceConnections.delete(peerId);
        }
    }

    private handleIncomingConnection(conn: DataConnection) {
        const wire = (conn.label as TridentWire) || "RED";
        console.log(`[TRIDENT] Setting up ${wire} wire for incoming connection from ${conn.peer}`);
        this.setupConnection(conn, wire);
    }

    private setupConnection(conn: DataConnection, wire: TridentWire) {
        conn.on("open", () => {
            console.log(`[TRIDENT] ✅ ${wire} WIRE OPEN with ${conn.peer}`);

            // 📊 Trace connection quality
            this.traceConnectionQuality(conn);

            // 📬 Process Outbox
            this.processOutbox(conn.peer);

            if (wire === "RED") {
                this.chatConnections.set(conn.peer, conn);
                this.notifyConnectionChange();
                // Auto-touch contact lastSeen
                touchContact(conn.peer).catch(() => { });
                // 🔐 Send our public key for E2E encryption
                const pubKey = sovereignCrypto.getPublicKey();
                if (pubKey) {
                    const packet: NandixPacket = { wire: "RED", type: "KEY_EXCHANGE", payload: { publicKey: pubKey } };
                    conn.send(BinaryProtocol.encode(packet));
                }
                // 📡 Targeted Presence Exchange
                this.sendPresenceTo(conn.peer);
                if (this.onConnectionCallback) this.onConnectionCallback(conn.peer);
            }
            if (wire === "BLUE") this.fileConnections.set(conn.peer, conn);
        });

        conn.on("data", async (data: any) => {
            let packet: NandixPacket;

            // 1. 🥋 DECIPHER BINARY PROTOCOL
            if (data instanceof ArrayBuffer) {
                try {
                    packet = BinaryProtocol.decode(data);
                } catch (e) {
                    console.error("[TRIDENT] ❌ Failed to decode binary packet:", e);
                    return;
                }
            } else {
                // Legacy JSON support (for backward compatibility)
                packet = data as NandixPacket;
            }

            // Internal Protocol Handling (Binary Streaming)
            if (packet.type === "BLUE_CHUNK") {
                await this.handleIncomingChunk(conn, packet);
                return;
            }

            // 💬 DIRECT CHAT RELAY
            if (packet.type === "CHAT_MSG") {
                const msg = packet.payload;

                // 🔐 Decrypt if encrypted
                let finalMsg = msg;
                if (msg.encrypted && msg.iv && msg.ciphertext) {
                    const decrypted = await sovereignCrypto.decrypt(conn.peer, msg.iv, msg.ciphertext);
                    if (decrypted) {
                        try {
                            finalMsg = JSON.parse(decrypted);
                            console.log(`[CHAT RX] 🔐💬 Decrypted mesh payload from ${conn.peer.substring(0, 12)}`);
                        } catch (e) {
                            console.error("[CHAT RX] ❌ Failed to parse decrypted JSON:", e);
                            finalMsg = { ...msg, text: decrypted }; // Fallback
                        }
                    } else {
                        finalMsg = { ...msg, text: "[encrypted message - decryption failed]" };
                    }
                }

                // Push to Yjs (triggers useSovereign observer)
                const ydoc = this.getDoc();
                const yarray = ydoc.getArray(`chat-${finalMsg.topic || "general"}`);

                // Only add if not already present (avoid duplicates)
                const exists = yarray.toArray().some((m: any) => m.id === finalMsg.id);
                if (!exists) {
                    yarray.push([{
                        id: finalMsg.id,
                        sender: finalMsg.sender,
                        text: finalMsg.text,
                        timestamp: finalMsg.timestamp,
                        mediaType: finalMsg.mediaType,
                        mediaData: finalMsg.mediaData,
                        mediaName: finalMsg.mediaName,
                        encrypted: !!msg.encrypted,
                    }]);
                    console.log(`[CHAT RX] ✅ Added to Yjs. Type: ${finalMsg.mediaType || "text"}`);

                    // 🤖 Bot Hook
                    if (this.onMessageCallback) {
                        this.onMessageCallback(conn.peer, finalMsg.text);
                    }

                    // 📑 Send ACK back to sender
                    const ackPacket: NandixPacket = { wire: "RED", type: "ACK", payload: { messageId: finalMsg.messageId } };
                    conn.send(BinaryProtocol.encode(ackPacket));
                }
                return;
            }

            // 📑 ACK handling
            if (packet.type === "ACK") {
                const { messageId } = packet.payload;
                console.log(`[CHAT] 📑 Received ACK for message: ${messageId}`);
                updateMessageStatus(messageId, "delivered").catch(() => { });
                if (this.onAckCallback) this.onAckCallback(conn.peer, messageId);
                return;
            }

            // 🔐 KEY EXCHANGE for E2E encryption
            if (packet.type === "KEY_EXCHANGE") {
                console.log(`[CRYPTO] 🔑 Received public key from ${conn.peer.substring(0, 12)}`);
                const peerPubKey = packet.payload.publicKey;

                sovereignCrypto.deriveSharedKey(conn.peer, peerPubKey).then(async () => {
                    // Update contact with fingerprint
                    const fingerprint = await SovereignCrypto.calculateFingerprint(peerPubKey);
                    const contact = await db.contacts.get(conn.peer);
                    if (contact) {
                        await db.contacts.update(conn.peer, { publicKeyFingerprint: fingerprint });
                        console.log(`[CRYPTO] 🛡️ Trust verified for ${conn.peer.substring(0, 12)}: ${fingerprint}`);
                    }
                }).catch(err => {
                    console.error(`[CRYPTO] ❌ Key derivation failed:`, err);
                });

                // Send our key back if we haven't already
                const pubKey = sovereignCrypto.getPublicKey();
                if (pubKey && !sovereignCrypto.hasKeyFor(conn.peer)) {
                    const packet: NandixPacket = { wire: "RED", type: "KEY_EXCHANGE", payload: { publicKey: pubKey } };
                    conn.send(BinaryProtocol.encode(packet));
                }
                return;
            }

            // 🏓 PING/PONG diagnostic
            if (packet.type === "PING") {
                console.log(`[DIAG] 🏓 PING received from ${conn.peer}, sending PONG`);
                const pongPacket: NandixPacket = { wire: "RED", type: "PONG", payload: { ts: Date.now() } };
                conn.send(BinaryProtocol.encode(pongPacket));
                return;
            }
            if (packet.type === "PONG") {
                console.log(`[DIAG] 🏓 PONG received from ${conn.peer}`);
                return;
            }

            // ✍️ TYPING indicator
            if (packet.type === "TYPING") {
                if (this.onTypingCallback) this.onTypingCallback(conn.peer, packet.payload.isTyping);
                return;
            }

            // 👁️ SEEN receipt
            if (packet.type === "SEEN") {
                if (this.onSeenCallback) this.onSeenCallback(conn.peer, packet.payload.messageId);
                return;
            }

            // 😀 REACTION
            if (packet.type === "REACTION") {
                if (this.onReactionCallback) this.onReactionCallback(conn.peer, packet.payload.messageId, packet.payload.emoji);
                return;
            }

            // 🏠 ROOM INVITE
            if (packet.type === "ROOM_INVITE") {
                console.log(`[ROOM] 📨 Invite from ${conn.peer.substring(0, 12)} to room: ${packet.payload.roomName}`);
                if (this.onRoomInviteCallback) {
                    this.onRoomInviteCallback(conn.peer, packet.payload.roomId, packet.payload.roomName, packet.payload.inviteCode);
                }
                return;
            }

            // 👤 PROFILE SYNC
            if (packet.type === "PROFILE_SYNC") {
                console.log(`[PROFILE] 👤 Sync from ${conn.peer.substring(0, 12)} | @${packet.payload.username}`);
                if (this.onProfileCallback) {
                    this.onProfileCallback(conn.peer, packet.payload);
                }
                return;
            }

            // 🔗 PAIRING: Device Linking
            if (packet.type === "PAIRING_REQ") {
                console.log(`[PAIRING] 🔗 Incoming link request from ${conn.peer.substring(0, 12)}`);
                if (this.onPairingRequestCallback) {
                    this.onPairingRequestCallback(conn.peer, packet.payload.secret);
                }
                return;
            }

            if (packet.type === "PAIRING_DATA") {
                console.log(`[PAIRING] 🔐 Received shared mnemonic from target device`);
                if (this.onPairingDataCallback) {
                    this.onPairingDataCallback(packet.payload.mnemonic);
                }
                return;
            }

            // 📣 DISCOVERY: Room Announcements
            if (packet.type === "ROOM_ANNOUNCE") {
                console.log(`[DISCOVERY] 📣 Received announcement for room: ${packet.payload.name} from ${conn.peer.substring(0, 12)}`);
                if (this.onRoomAnnounceCallback) {
                    this.onRoomAnnounceCallback(conn.peer, packet.payload);
                }
                return;
            }

            // 🛡️ TRUST: Trust Vouches
            if (packet.type === "TRUST_VOUCH") {
                console.log(`[TRUST] 🛡️ Received trust vouch for ${packet.payload.targetId} from ${conn.peer.substring(0, 12)}`);
                if (this.onTrustVouchCallback) this.onTrustVouchCallback(packet.payload);
                return;
            }

            // 📣 SOCIAL: Global Feed Posts
            if (packet.type === "SOCIAL_POST") {
                console.log(`[SOCIAL] 📣 Received post from ${conn.peer.substring(0, 12)}`);
                const exists = await db.posts.get(packet.payload.id);
                if (!exists) {
                    await db.posts.put(packet.payload);
                    if (this.onSocialPostCallback) this.onSocialPostCallback(packet.payload);
                }
                return;
            }

            // 💖 SOCIAL: Feed Vibes
            if (packet.type === "SOCIAL_VIBE") {
                console.log(`[SOCIAL] 💖 Received vibe from ${conn.peer.substring(0, 12)}`);
                const vibe = packet.payload;
                const exists = await db.vibes.get(vibe.id);
                if (!exists) {
                    await db.vibes.put(vibe);
                    // Update post count
                    const post = await db.posts.get(vibe.postId);
                    if (post) {
                        await db.posts.update(post.id, { vibeCount: (post.vibeCount || 0) + 1 });
                    }
                    if (this.onSocialVibeCallback) this.onSocialVibeCallback(vibe);
                }
                return;
            }

            // 🔄 SOCIAL: Post Sync Request (peer is asking for our posts)
            if (packet.type === "POST_SYNC_REQUEST") {
                console.log(`[SOCIAL] 🔄 Post sync requested by ${conn.peer.substring(0, 12)}`);
                // Send our latest 20 posts back to requesting peer
                const myPosts = await db.posts.orderBy("timestamp").reverse().limit(20).toArray();
                conn.send(JSON.stringify({
                    type: "POST_SYNC_RESPONSE",
                    payload: { posts: myPosts },
                }));
                return;
            }

            // 📥 SOCIAL: Post Sync Response (receiving posts from peer)
            if (packet.type === "POST_SYNC_RESPONSE") {
                console.log(`[SOCIAL] 📥 Received post sync from ${conn.peer.substring(0, 12)} (${packet.payload.posts?.length} posts)`);
                const posts: any[] = packet.payload.posts || [];
                for (const post of posts) {
                    const exists = await db.posts.get(post.id);
                    if (!exists) {
                        await db.posts.put(post);
                        if (this.onSocialPostCallback) this.onSocialPostCallback(post);
                    }
                }
                return;
            }

            // 🟢 PRESENCE: Real-time status heartbeat
            if (packet.type === "PRESENCE_UPDATE") {
                const { status, profile, roomId } = packet.payload;
                this.presence.set(conn.peer, { status, profile, lastSeen: Date.now() });
                if (this.onPresenceCallback) this.onPresenceCallback(conn.peer, status);

                // Update DB contacts
                touchContact(conn.peer).catch(() => { });
                if (profile) {
                    db.contacts.update(conn.peer, {
                        username: profile.username,
                        avatar: profile.avatar,
                        bio: profile.bio
                    }).catch(() => { });
                }

                // 🏰 ROOM SYNC: Auto-add to room members if roomId matches current or is provided
                if (roomId) {
                    db.rooms.get(roomId).then(room => {
                        if (room && !room.members.includes(conn.peer)) {
                            db.rooms.update(roomId, {
                                members: [...room.members, conn.peer],
                                lastActivity: Date.now()
                            });
                            console.log(`[ROOM] 🏰 Auto-synced ${conn.peer.substring(0, 8)} to room: ${room.name}`);
                        }
                    });
                }
                return;
            }
            await trustEngine.processIncomingVouch(packet.payload);
            if (this.onTrustVouchCallback) {
                this.onTrustVouchCallback(packet.payload);
            }

            // 🤖 AUTOMATION: Bot Announcements
            if (packet.type === "BOT_ANNOUNCE") {
                console.log(`[BOT] 🤖 Bot announcement from ${conn.peer.substring(0, 12)}`);
                if (this.onBotAnnounceCallback) {
                    this.onBotAnnounceCallback(conn.peer, packet.payload);
                }
                return;
            }

            this.packetListeners.forEach(listener => {
                try {
                    listener(packet);
                } catch (err) {
                    console.error("[TRIDENT] ❌ Packet listener error:", err);
                }
            });
        });

        conn.on("close", () => {
            console.log(`[TRIDENT] ❌ ${wire} WIRE CLOSED with ${conn.peer}`);
            if (wire === "RED") {
                this.chatConnections.delete(conn.peer);
                this.notifyConnectionChange();
            }
            if (wire === "BLUE") this.fileConnections.delete(conn.peer);
        });

        conn.on("error", (err) => {
            console.error(`[TRIDENT] ❌ ${wire} connection error with ${conn.peer}:`, err);
            // Don't delete immediately, let close event handle cleanup if needed, 
            // or maybe retry connection?
            if (this.onConnectionErrorCallback) {
                this.onConnectionErrorCallback(conn.peer, err);
            }
        });
    }

    private onConnectionErrorCallback?: (peerId: string, error: any) => void;
    public onConnectionError(cb: (peerId: string, error: any) => void) { this.onConnectionErrorCallback = cb; }

    /**
     * 💪 Force Retry Connection
     */
    public async retryConnection(peerId: string) {
        if (this.chatConnections.has(peerId)) {
            const conn = this.chatConnections.get(peerId);
            if (conn?.open) return; // Already open
            this.chatConnections.delete(peerId); // Remove stale
        }
        await this.connectToPeer(peerId);
    }

    /**
     * 💬 Send a chat message over RED WIRE (E2E encrypted when possible)
     */
    public async sendChatMessage(msg: { id: string; sender: string; text: string; timestamp: number; topic?: string }) {
        const targetId = msg.topic; // In NANDIX, topic IS the room ID or peer ID
        const openConns = Array.from(this.chatConnections.values()).filter(c => c.open);

        let deliveredAtLeastOnce = false;

        // 🔐 Encrypt per-peer if possible
        for (const conn of openConns) {
            // If it's a 1-1 chat, only send to that peer
            if (targetId && !targetId.startsWith("room-") && conn.peer !== targetId) continue;

            if (conn.open) {
                if (sovereignCrypto.hasKeyFor(conn.peer)) {
                    const payload = JSON.stringify(msg);
                    const encryptedMsg = await sovereignCrypto.encrypt(conn.peer, payload);
                    if (encryptedMsg) {
                        conn.send({ wire: "RED" as const, type: "CHAT_MSG", payload: encryptedMsg });
                        deliveredAtLeastOnce = true;
                        continue;
                    }
                }
                conn.send({ wire: "RED" as const, type: "CHAT_MSG", payload: msg });
                deliveredAtLeastOnce = true;
            }
        }

        // 📬 Outbox Logic
        if (!deliveredAtLeastOnce) {
            console.warn(`[CHAT TX] ⏳ No peers reachable for "${msg.text?.substring(0, 20)}". Saved to Outbox.`);
            updateMessageStatus(msg.id, "pending").catch(() => { });
        } else {
            updateMessageStatus(msg.id, "sent").catch(() => { });
        }

        // Bump message count for connected peers
        this.chatConnections.forEach((_, peerId) => bumpMessageCount(peerId).catch(() => { }));
    }

    /**
     * 📬 Process Outbox for a specific peer
     */
    private async processOutbox(peerId: string) {
        const pending = await getPendingMessages(peerId);
        if (pending.length > 0) {
            console.log(`[OUTBOX] 🚀 Retrying ${pending.length} messages for ${peerId.substring(0, 12)}`);
            for (const msg of pending) {
                // We re-use sendChatMessage but it's already in DB, so we must be careful not to create duplicates
                // Actually, sendChatMessage in page.tsx adds to DB first.
                // Here we just need to try Sending it again.
                this.sendChatMessage(msg as any);
            }
        }
    }

    private onAckCallback?: (peerId: string, messageId: string) => void;
    public onAck(cb: (peerId: string, messageId: string) => void) { this.onAckCallback = cb; }

    /**
     * 🏓 Send diagnostic ping
     */
    public sendPing() {
        console.log(`[DIAG] 🏓 Sending PING to ${this.chatConnections.size} peers`);
        this.send("RED", { ts: Date.now() }, "PING");
    }

    /**
     * ✍️ Send typing indicator
     */
    public sendTyping(isTyping: boolean) {
        this.send("RED", { isTyping }, "TYPING");
    }

    /**
     * 👁️ Send read receipt
     */
    public sendSeen(messageId: string) {
        this.send("RED", { messageId }, "SEEN");
    }

    /**
     * 😀 Send reaction
     */
    public sendReaction(messageId: string, emoji: string) {
        this.send("RED", { messageId, emoji }, "REACTION");
    }

    // ── Callbacks ─────────────────────────────────────────────────
    public onTyping(cb: (peerId: string, isTyping: boolean) => void) { this.onTypingCallback = cb; }
    public onSeen(cb: (peerId: string, messageId: string) => void) { this.onSeenCallback = cb; }
    public onReaction(cb: (peerId: string, messageId: string, emoji: string) => void) { this.onReactionCallback = cb; }
    public onRoomInvite(cb: (peerId: string, roomId: string, roomName: string, inviteCode: string) => void) { this.onRoomInviteCallback = cb; }
    public onProfile(cb: (peerId: string, profile: any) => void) { this.onProfileCallback = cb; }

    // Social Callbacks
    private onSocialPostCallback?: (post: any) => void;
    public onSocialPost(cb: (post: any) => void) { this.onSocialPostCallback = cb; }
    private onSocialVibeCallback?: (vibe: any) => void;
    public onSocialVibe(cb: (vibe: any) => void) { this.onSocialVibeCallback = cb; }

    /**
     * 📣 Broadcast a Social Post to ALL connected peers
     */
    public broadcastSocialPost(post: any) {
        console.log(`[SOCIAL] 📣 Broadcasting post to ${this.chatConnections.size} peers.`);
        this.send("RED", post, "SOCIAL_POST");
    }

    /**
     * 💖 Broadcast a Social Vibe to ALL connected peers
     */
    public broadcastSocialVibe(vibe: any) {
        console.log(`[SOCIAL] 💖 Broadcasting vibe to ${this.chatConnections.size} peers.`);
        this.send("RED", vibe, "SOCIAL_VIBE");
    }

    /**
     * 💬 Broadcast a Reply to ALL connected peers
     */
    public broadcastSocialReply(reply: any) {
        console.log(`[SOCIAL] 💬 Broadcasting reply to ${this.chatConnections.size} peers.`);
        this.send("RED", reply, "SOCIAL_REPLY");
    }

    /**
     * 🔄 Request post sync from a specific peer
     */
    public requestPostSync(peerId: string) {
        const conn = this.chatConnections.get(peerId);
        if (conn) {
            console.log(`[SOCIAL] 🔄 Requesting post sync from ${peerId.substring(0, 12)}`);
            conn.send(JSON.stringify({ type: "POST_SYNC_REQUEST", payload: {} }));
        }
    }

    /**
     * 🔄 Request post sync from ALL connected peers
     */
    public requestAllPeerSync() {
        const peerIds = Array.from(this.chatConnections.keys());
        console.log(`[SOCIAL] 🔄 Initiating full mesh post sync with ${peerIds.length} peers.`);
        for (const peerId of peerIds) {
            this.requestPostSync(peerId);
        }
    }

    /**
     * 👤 Send our profile to a peer or all peers
     */
    public sendProfile(profile: any, targetPeer?: string) {
        if (targetPeer) {
            const conn = this.chatConnections.get(targetPeer);
            if (conn?.open) conn.send({ wire: "RED", type: "PROFILE_SYNC", payload: profile });
        } else {
            this.send("RED", profile, "PROFILE_SYNC");
        }
    }

    /**
     * 🔗 Send pairing request to a device
     */
    public requestPairing(targetPeerId: string, secret: string) {
        const conn = this.chatConnections.get(targetPeerId);
        if (conn?.open) {
            conn.send({ wire: "RED", type: "PAIRING_REQ", payload: { secret } });
        } else {
            this.connectToPeer(targetPeerId).then(() => {
                const newConn = this.chatConnections.get(targetPeerId);
                newConn?.send({ wire: "RED", type: "PAIRING_REQ", payload: { secret } });
            });
        }
    }

    /**
     * 🔐 Send mnemonic to a pairing device
     */
    public sendPairingData(targetPeerId: string, mnemonic: string) {
        const conn = this.chatConnections.get(targetPeerId);
        if (conn?.open) {
            conn.send({ wire: "RED", type: "PAIRING_DATA", payload: { mnemonic } });
        }
    }

    private onPairingRequestCallback?: (peerId: string, secret: string) => void;
    private onPairingDataCallback?: (mnemonic: string) => void;
    private onRoomAnnounceCallback?: (peerId: string, room: any) => void;

    public onPairingRequest(cb: (peerId: string, secret: string) => void) { this.onPairingRequestCallback = cb; }
    public onPairingData(cb: (mnemonic: string) => void) { this.onPairingDataCallback = cb; }
    public onRoomAnnounce(cb: (peerId: string, room: any) => void) { this.onRoomAnnounceCallback = cb; }
    public onTrustVouch(cb: (vouch: TrustVouch) => void) { this.onTrustVouchCallback = cb; }
    public onBotAnnounce(cb: (peerId: string, botData: any) => void) { this.onBotAnnounceCallback = cb; }
    public onConnection(cb: (peerId: string) => void) { this.onConnectionCallback = cb; }
    public onMessage(cb: (peerId: string, text: string) => void) { this.onMessageCallback = cb; }

    /**
     * 🛡️ Vouch for a peer (broadcast to all connected peers)
     */
    public async vouchForPeer(targetId: string, level: number) {
        const vouch = await trustEngine.signVouch(targetId, level);
        if (vouch) {
            console.log(`[TRUST] 🛡️ Broadcasting vouch for ${targetId} (level ${level})`);
            this.send("RED", vouch, "TRUST_VOUCH");
        }
    }

    /**
     * 🤖 Announce a local bot service
     */
    public announceBot(botData: any) {
        this.send("RED", botData, "BOT_ANNOUNCE");
    }

    /**
     * 📣 Broadcast public rooms to peers
     */
    public announcePublicRooms(rooms: any[]) {
        rooms.forEach(room => {
            this.send("RED", room, "ROOM_ANNOUNCE");
        });
    }

    /**
     * 🏠 Send room invite to all connected peers
     */
    public sendRoomInvite(roomId: string, roomName: string, inviteCode: string) {
        this.send("RED", { roomId, roomName, inviteCode }, "ROOM_INVITE");
    }

    /**
     * High-Performance Binary Streamer (BLUE WIRE)
     * Optimized for 100MB+ transfers with robust flow control.
     */
    public async streamFile(file: File) {
        const chunkSize = 65536; // 64KB chunks for higher throughput
        const totalChunks = Math.ceil(file.size / chunkSize);
        const fileId = `${file.name}-${Date.now()}`;

        // 🔐 Check for encryption
        const connections = Array.from(this.fileConnections.values());
        const isEncrypted = connections.some(c => sovereignCrypto.hasKeyFor(c.peer));

        const dbId = await logFileTransfer({
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            direction: "sent",
            peerId: "broadcast",
            status: "transferring",
            progress: 0,
            timestamp: Date.now(),
        });

        this.send("BLUE", { name: file.name, size: file.size, totalChunks, fileId, encrypted: isEncrypted }, "BLUE_START");

        let offset = 0;
        for (let i = 0; i < totalChunks; i++) {
            const chunk = file.slice(offset, offset + chunkSize);
            let buffer = await chunk.arrayBuffer();

            // 🔐 Encrypt chunk if keys exist
            if (isEncrypted) {
                const peerId = connections.find(c => sovereignCrypto.hasKeyFor(c.peer))?.peer;
                if (peerId) {
                    const encrypted = await sovereignCrypto.encryptBuffer(peerId, buffer);
                    if (encrypted) buffer = encrypted;
                }
            }

            this.send("BLUE", buffer, "BLUE_CHUNK");
            offset += chunkSize;

            // 📊 Progress
            if (this.onStreamProgress) {
                this.onStreamProgress(((i + 1) / totalChunks) * 100, file.name);
            }

            // 🌊 FLOW CONTROL: Prevent DC Buffer Overflow
            // We wait if any connection has > 1MB buffered
            let backoff = false;
            for (const conn of connections) {
                // @ts-ignore - bufferedAmount exists on DataConnection's peerConnection
                if (conn.dataChannel?.bufferedAmount > 1024 * 1024) {
                    backoff = true;
                    break;
                }
            }

            if (backoff) {
                await new Promise(r => setTimeout(r, 50));
            } else {
                // Minimal yield to keep UI responsive
                if (i % 5 === 0) await new Promise(r => setTimeout(r, 0));
            }
        }

        if (dbId) await updateFileStatus(dbId, "completed");
        this.send("BLUE", { name: file.name, fileId }, "BLUE_END");
    }

    private async handleIncomingChunk(conn: DataConnection, packet: NandixPacket) {
        const streamEntries = Array.from(this.incomingStreams.values());
        if (streamEntries.length === 0) return;
        const stream = streamEntries[0];

        let payload = packet.payload;

        // 🔐 Decrypt if encrypted
        if (stream.encrypted) {
            const decrypted = await sovereignCrypto.decryptBuffer(conn.peer, payload);
            if (decrypted) {
                payload = decrypted;
            } else {
                console.error("[BLUE RX] ❌ Decryption failed for chunk");
            }
        }

        stream.chunks.push(payload);
        stream.received++;
        if (this.onStreamProgress) {
            this.onStreamProgress((stream.received / stream.total) * 100, stream.name);
        }
    }

    public async initIncomingStream(payload: any) {
        const dbId = await logFileTransfer({
            name: payload.name,
            size: payload.size || 0,
            type: "application/octet-stream",
            direction: "received",
            peerId: "remote",
            status: "transferring",
            progress: 0,
            timestamp: Date.now(),
        });
        this.incomingStreams.set(payload.name, {
            chunks: [], received: 0, total: payload.totalChunks, name: payload.name, dbId, encrypted: payload.encrypted
        });
    }

    public async finalizeStream(fileName: string) {
        const stream = this.incomingStreams.get(fileName);
        if (!stream) return;
        const blob = new Blob(stream.chunks);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        if (stream.dbId) await updateFileStatus(stream.dbId, "completed");
        this.incomingStreams.delete(fileName);
        URL.revokeObjectURL(url);
    }

    /**
     * Send packet through specific wire.
     */
    public send(wire: TridentWire, payload: any, type: string = "DATA") {
        const packet: NandixPacket = { wire, type, payload };

        // 🥋 ENCODE BINARY PROTOCOL
        let encoded: ArrayBuffer;
        try {
            encoded = BinaryProtocol.encode(packet);
        } catch (e) {
            console.error(`[TRIDENT] ❌ Failed to encode packet ${type}:`, e);
            return;
        }

        const connections = wire === "RED" ? this.chatConnections : this.fileConnections;
        connections.forEach(conn => {
            if (conn.open) {
                conn.send(encoded);
            }
        });
    }

    /**
     * Send packet to a SPECIFIC peer.
     */
    public sendTo(peerId: string, wire: TridentWire, payload: any, type: string = "DATA") {
        const connections = wire === "RED" ? this.chatConnections : this.fileConnections;
        const conn = connections.get(peerId);
        if (conn && conn.open) {
            const packet: NandixPacket = { wire, type, payload };
            try {
                conn.send(BinaryProtocol.encode(packet));
            } catch (e) {
                console.error(`[TRIDENT] ❌ Failed to sendTo ${peerId}:`, e);
            }
        }
    }
    /**
     * 🏎️ RAW SEND: Used by the TridentScheduler to push pre-encoded
     * packets directly through the mesh. If peerId is null, broadcast
     * to all peers on RED wire.
     *
     * 🎓 WHY "RAW"?
     * The Scheduler has already encoded and prioritized the packet.
     * We don't want to re-encode it. This is the fastest path from
     * the Scheduler's queue to the WebRTC data channel.
     */
    public sendRaw(peerId: string | null, data: ArrayBuffer | NandixPacket) {
        if (peerId) {
            // Targeted send to a specific peer
            const conn = this.chatConnections.get(peerId) || this.fileConnections.get(peerId);
            if (conn?.open) {
                conn.send(data);
            }
        } else {
            // Broadcast to all RED wire connections
            this.chatConnections.forEach(conn => {
                if (conn.open) conn.send(data);
            });
        }
    }

    /**
     * Join Swarm (GREEN WIRE - Discovery)
     * Guarded: won't re-create if already in the same swarm.
     */
    public joinSwarm(topic: string) {
        if (this.currentSwarm === topic) {
            console.log(`[TRIDENT] Already in swarm: ${topic}`);
            return;
        }
        if (this.provider) this.provider.destroy();
        this.currentSwarm = topic;
        this.provider = new WebrtcProvider(`nandix-v2-${topic}`, this.ydoc, {
            signaling: ["wss://signaling.yjs.dev"],
            password: `trident-${topic}`
        });
        console.log(`[TRIDENT] 🌐 Joined swarm: ${topic}`);
        // 🏁 Alert the swarm of our arrival
        this.broadcastPresence();
    }

    public getDoc(): Y.Doc { return this.ydoc; }
    public getMyId(): string | null { return this.myId; }


    /**
     * 📊 TRACE CONNECTION QUALITY
     * Inspects WebRTC stats to determine if connection is direct or relayed.
     */
    private async traceConnectionQuality(conn: any) {
        const pc = (conn as any).peerConnection as RTCPeerConnection;
        if (!pc) return;

        try {
            const stats = await pc.getStats();
            let type: "direct" | "relay" | "unknown" = "unknown";

            stats.forEach(report => {
                if (report.type === "remote-candidate") {
                    if (report.candidateType === "relay") {
                        type = "relay";
                    } else if (report.candidateType === "host" || report.candidateType === "srflx") {
                        type = "direct";
                    }
                }
            });

            this.connectionQuality.set(conn.peer, type);
            console.log(`[TRIDENT] 📡 Connection to ${conn.peer.substring(0, 12)} is ${type.toUpperCase()}`);
        } catch (err) {
            console.warn(`[TRIDENT] ⚠️ Could not trace connection quality:`, err);
        }
    }

    public getQuality(peerId: string): "direct" | "relay" | "unknown" {
        return this.connectionQuality.get(peerId) || "unknown";
    }

    /**
     * PRESENCE 2.0: The Heartbeat Engine
     */
    public startHeartbeat(interval: number = 30000) {
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => this.broadcastPresence(), interval);
        this.broadcastPresence(); // Initial pulse
    }

    public async broadcastPresence() {
        if (!this.myId) return;
        const profile = await db.settings.get("profile");
        const payload = {
            status: "online",
            profile: profile?.value,
            roomId: this.currentSwarm
        };
        this.send("RED", payload, "PRESENCE_UPDATE");
    }

    public async sendPresenceTo(peerId: string) {
        const profile = await db.settings.get("profile");
        const payload = {
            status: "online",
            profile: profile?.value,
            roomId: this.currentSwarm
        };
        this.sendTo(peerId, "RED", payload, "PRESENCE_UPDATE");
    }

    public onPresence(callback: (peerId: string, status: string) => void) {
        this.onPresenceCallback = callback;
    }
    public getPresence(peerId: string) {
        return this.presence.get(peerId);
    }
}

export const mesh = NandixMesh.getInstance();

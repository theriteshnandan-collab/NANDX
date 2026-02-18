"use client";

import Dexie, { type EntityTable } from "dexie";

/**
 * NANDIX DB: The Sovereign Memory Layer
 * 
 * All data stays on YOUR device. No server. No cloud. No tracking.
 * IndexedDB persistence via Dexie.js.
 */

// ── Schema Interfaces ──────────────────────────────────────────────

export interface DroppedFile {
    id?: number;
    name: string;
    size: number;
    type: string;
    direction: "sent" | "received";
    peerId: string;
    status: "queued" | "transferring" | "completed" | "failed";
    progress: number;
    timestamp: number;
}

export interface ChatMessage {
    id?: number;
    topic: string;
    messageId: string;
    sender: string;
    text: string;
    timestamp: number;
    mediaType?: "image" | "voice" | "file";
    mediaData?: string; // Data URL or Blob URL
    mediaName?: string;
    encrypted?: boolean;
    deliveryStatus?: "pending" | "sent" | "delivered" | "failed";
}

export interface SovereignContact {
    peerId: string;         // Primary key — the nandix-XXXX ID
    nickname: string;       // User-chosen display name
    addedAt: number;        // When the contact was saved
    lastSeen: number;       // Last time this peer was connected
    messageCount: number;   // Total messages exchanged
    username?: string;      // The peer's self-chosen username
    bio?: string;           // The peer's bio
    avatar?: string;        // Data URL or small identifier
    publicKeyFingerprint?: string; // E2EE trust verification
    trustScore?: number;    // 0-100 decentralized reputation
    vouchedBy?: string[];   // List of peer IDs who vouched
    isBot?: boolean;        // Flag for automated peers
}

export interface UserProfile {
    username: string;
    bio: string;
    avatar: string;
    peerId: string;
}

export interface ChatRoom {
    id: string;             // Primary key — unique room ID
    name: string;           // Display name for the room
    createdBy: string;      // Peer ID of creator
    createdAt: number;      // Timestamp
    members: string[];      // Array of peer IDs in the room
    inviteCode: string;     // Shareable invite code
    lastActivity: number;   // Last message timestamp
    isPublic?: boolean;     // Discoverable by peers
    description?: string;   // Room description
}

export interface AppSetting {
    key: string;
    value: any;
}

// ── Database Definition ────────────────────────────────────────────

class NandixDatabase extends Dexie {
    files!: EntityTable<DroppedFile, "id">;
    messages!: EntityTable<ChatMessage, "id">;
    contacts!: EntityTable<SovereignContact, "peerId">;
    rooms!: EntityTable<ChatRoom, "id">;
    settings!: EntityTable<AppSetting, "key">;

    constructor() {
        super("NandixDB");

        // Version 7: Added trust fields and isBot to contacts
        this.version(7).stores({
            files: "++id, name, direction, status, timestamp, peerId",
            messages: "++id, topic, messageId, sender, timestamp, deliveryStatus",
            contacts: "peerId, nickname, addedAt, lastSeen, publicKeyFingerprint, trustScore, isBot",
            rooms: "id, name, createdBy, createdAt, inviteCode, lastActivity, isPublic",
            settings: "key",
        });

        // Version 6: Added isPublic and description to rooms
        this.version(6).stores({
            files: "++id, name, direction, status, timestamp, peerId",
            messages: "++id, topic, messageId, sender, timestamp, deliveryStatus",
            contacts: "peerId, nickname, addedAt, lastSeen, publicKeyFingerprint",
            rooms: "id, name, createdBy, createdAt, inviteCode, lastActivity, isPublic",
            settings: "key",
        });

        // Version 5: Added deliveryStatus to messages

        // Version 4: Added publicKeyFingerprint to contacts

        // Version 3: Added rooms table
        this.version(3).stores({
            files: "++id, name, direction, status, timestamp, peerId",
            messages: "++id, topic, messageId, sender, timestamp",
            contacts: "peerId, nickname, addedAt, lastSeen",
            rooms: "id, name, createdBy, createdAt, inviteCode, lastActivity",
            settings: "key",
        });

        // Version 2: Added contacts table
        this.version(2).stores({
            files: "++id, name, direction, status, timestamp, peerId",
            messages: "++id, topic, messageId, sender, timestamp",
            contacts: "peerId, nickname, addedAt, lastSeen",
            settings: "key",
        });

        // Keep v1 for backwards compatibility
        this.version(1).stores({
            files: "++id, name, direction, status, timestamp, peerId",
            messages: "++id, topic, messageId, sender, timestamp",
            settings: "key",
        });
    }
}

// ── Singleton Export ────────────────────────────────────────────────

export const db = new NandixDatabase();

// ── Helper Functions ───────────────────────────────────────────────

/** Log a file transfer to the local database */
export async function logFileTransfer(file: Omit<DroppedFile, "id">) {
    return db.files.add(file);
}

/** Update a file transfer's status */
export async function updateFileStatus(
    id: number,
    status: DroppedFile["status"],
    progress: number = 100
) {
    return db.files.update(id, { status, progress });
}

/** Save a chat message to local history */
export async function persistMessage(msg: Omit<ChatMessage, "id">) {
    const exists = await db.messages
        .where("messageId")
        .equals(msg.messageId)
        .first();
    if (!exists) {
        return db.messages.add(msg);
    }
}

/** Update the delivery status of a message */
export async function updateMessageStatus(messageId: string, status: ChatMessage["deliveryStatus"]) {
    const msg = await db.messages.where("messageId").equals(messageId).first();
    if (msg && msg.id) {
        return db.messages.update(msg.id, { deliveryStatus: status });
    }
}

/** Get all pending messages for a specific peer */
export async function getPendingMessages(peerId: string) {
    return db.messages
        .where("deliveryStatus")
        .equals("pending")
        .filter(m => m.topic === peerId || m.sender === peerId) // Simplistic check for 1-1 chats
        .toArray();
}

// ── Contact Management ─────────────────────────────────────────────

/** Save or update a contact */
export async function saveContact(contact: SovereignContact) {
    return db.contacts.put(contact);
}

/** Remove a contact */
export async function removeContact(peerId: string) {
    return db.contacts.delete(peerId);
}

/** Get a single contact */
export async function getContact(peerId: string) {
    return db.contacts.get(peerId);
}

/** Update lastSeen for a contact */
export async function touchContact(peerId: string) {
    const contact = await db.contacts.get(peerId);
    if (contact) {
        return db.contacts.update(peerId, { lastSeen: Date.now() });
    }
}

/** Increment message count */
export async function bumpMessageCount(peerId: string) {
    const contact = await db.contacts.get(peerId);
    if (contact) {
        return db.contacts.update(peerId, { messageCount: (contact.messageCount || 0) + 1 });
    }
}

// ── Room Management ────────────────────────────────────────────────

/** Create a new chat room */
export async function createRoom(name: string, createdBy: string, initialMembers: string[] = []): Promise<string> {
    const id = `room-${Math.random().toString(36).substring(2, 10)}`;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room: ChatRoom = {
        id,
        name,
        createdBy,
        createdAt: Date.now(),
        members: [createdBy, ...initialMembers],
        inviteCode,
        lastActivity: Date.now(),
    };
    await db.rooms.put(room);
    return id;
}

/** Delete a room */
export async function deleteRoom(roomId: string) {
    return db.rooms.delete(roomId);
}

/** Get all rooms sorted by last activity */
export async function getRooms() {
    return db.rooms.orderBy("lastActivity").reverse().toArray();
}

/** Add a member to a room */
export async function addMemberToRoom(roomId: string, peerId: string) {
    const room = await db.rooms.get(roomId);
    if (room && !room.members.includes(peerId)) {
        return db.rooms.update(roomId, { members: [...room.members, peerId] });
    }
}

/** Remove a member from a room */
export async function removeMemberFromRoom(roomId: string, peerId: string) {
    const room = await db.rooms.get(roomId);
    if (room) {
        return db.rooms.update(roomId, { members: room.members.filter(m => m !== peerId) });
    }
}

/** Update last activity timestamp */
export async function touchRoomActivity(roomId: string) {
    return db.rooms.update(roomId, { lastActivity: Date.now() });
}

/** Update room privacy and description */
export async function updateRoomPrivacy(roomId: string, isPublic: boolean, description?: string) {
    return db.rooms.update(roomId, { isPublic, description });
}

/** Get all public rooms */
export async function getPublicRooms() {
    return db.rooms.where("isPublic").equals(1).toArray(); // Dexie boolean is often 1/0
}

/** Get/Set a persistent setting */
export async function getSetting<T = any>(key: string, fallback?: T): Promise<T | undefined> {
    const row = await db.settings.get(key);
    return row ? row.value : fallback;
}

export async function setSetting(key: string, value: any) {
    return db.settings.put({ key, value });
}

/** Get user's own profile */
export async function getMyProfile(peerId: string): Promise<UserProfile> {
    return getSetting<UserProfile>("profile", {
        username: `user-${peerId.substring(0, 4)}`,
        bio: "Sovereign NANDIX user.",
        avatar: "",
        peerId,
    }) as Promise<UserProfile>;
}

/** Update user's own profile */
export async function setMyProfile(profile: UserProfile) {
    return setSetting("profile", profile);
}

import { NandixPacket } from "./NandixMesh";

// 🥋 LEVEL 3: THE BYTE-LEVEL SORCERER (TURBO EDITION)
//
// 🎓 WHAT IS A BINARY PROTOCOL?
// When two computers talk, they send data as bytes (0s and 1s).
// JSON is human-readable: {"type":"DATA","payload":"hello"} (33 bytes)
// Binary is machine-optimized: [0x01][LEN][PAYLOAD] (~9 bytes)
//
// THE SCHEMA (Strict Byte Layout — TURBO v2):
// ┌────────────┬──────────────────────────┬──────────────────────┬──────────────────────┐
// │  OFFSET    │  FIELD                   │  TYPE                │  DESCRIPTION         │
// ├────────────┼──────────────────────────┼──────────────────────┼──────────────────────┤
// │  0         │  Packet Type             │  Uint8 (1 byte)      │  See TYPE_MAP below  │
// │  1         │  Payload Length          │  Uint32 (4 bytes)    │  Size of contents    │
// │  5         │  Wire Type               │  Uint8 (1 byte)      │  0=RED, 1=BLUE, 2=YLW│
// │  6         │  Priority                │  Uint8 (1 byte)      │  0=CRIT..3=BACKGROUND│
// │  7         │  Payload                 │  Buffer (N bytes)    │  UTF-8 or Binary     │
// └────────────┴──────────────────────────┴──────────────────────┴──────────────────────┘
//
// HEADER SIZE: 7 bytes (was 6 — we added 1 byte for Priority)

// 🎓 TYPE MAP: Every packet type gets a unique numeric ID.
// This avoids sending long strings like "PRESENCE_UPDATE" (15 bytes)
// and replaces them with a single byte (1 byte). That's 15x compression
// on the type field alone.
const TYPE_MAP: Record<string, number> = {
    // Core Data
    "DATA": 1,
    "HELLO": 2,
    "OFFER": 3,
    "ANSWER": 4,
    "CANDIDATE": 5,

    // Chat & Social (RED Wire)
    "TYPING": 6,
    "SEEN": 7,
    "CHAT_MSG": 10,
    "ACK": 11,
    "REACTION": 12,
    "PROFILE_SYNC": 13,
    "ROOM_INVITE": 14,
    "ROOM_ANNOUNCE": 15,
    "SOCIAL_POST": 16,
    "SOCIAL_VIBE": 17,
    "SOCIAL_REPLY": 18,
    "SOCIAL_DELETE": 19,

    // System Control (RED Wire — Critical)
    "PING": 20,
    "PONG": 21,
    "KEY_EXCHANGE": 22,
    "PRESENCE_UPDATE": 23,
    "PAIRING_REQ": 24,
    "PAIRING_DATA": 25,
    "HEARTBEAT": 26,

    // Trust & Bots (RED Wire)
    "TRUST_VOUCH": 30,
    "BOT_ANNOUNCE": 31,

    // File Transfer (BLUE Wire)
    "BLUE_START": 40,
    "BLUE_CHUNK": 41,
    "BLUE_END": 42,

    // Ghost Engine (GREEN Wire)
    "GHOST_CMD": 50,
    "GHOST_RESP": 51,

    // Agent Mesh (GREEN Wire)
    "AGENT_ANNOUNCE": 60,
    "AGENT_SEARCH": 61,
    "AGENT_TASK_REQ": 62,
    "AGENT_TASK_RESP": 63,
};

// Reverse map for decoding (number → string)
const TYPE_MAP_REV = Object.fromEntries(Object.entries(TYPE_MAP).map(([k, v]) => [v, k]));

// Wire string → byte mapping
const WIRE_MAP: Record<string, number> = { "RED": 0, "BLUE": 1, "GREEN": 2, "YELLOW": 3 };
const WIRE_MAP_REV: Record<number, string> = { 0: "RED", 1: "BLUE", 2: "GREEN", 3: "YELLOW" };

export class BinaryProtocol {

    /**
     * ENCODE: Convert a JS Object → ArrayBuffer
     *
     * 🎓 WHY ARRAYBUFFER?
     * An ArrayBuffer is raw binary memory — the fastest way to move data.
     * Unlike JSON.stringify(), there's no string allocation or parsing.
     * WebRTC DataChannels can send ArrayBuffers natively.
     */
    static encode(packet: NandixPacket): ArrayBuffer {
        // 1. Get Type ID
        const typeId = TYPE_MAP[packet.type];
        if (typeId === undefined) throw new Error(`Unknown packet type: ${packet.type}`);

        // 2. Encode Payload
        let payloadBytes: Uint8Array;
        if (typeof packet.payload === "string") {
            payloadBytes = new TextEncoder().encode(packet.payload);
        } else if (packet.payload instanceof Uint8Array) {
            payloadBytes = packet.payload; // Raw binary — zero copy
        } else {
            // Objects are JSON serialized into bytes
            const json = JSON.stringify(packet.payload);
            payloadBytes = new TextEncoder().encode(json);
        }

        // 3. Wire & Priority mapping
        const wireId = WIRE_MAP[packet.wire] ?? 0;
        const priority = (packet as any).priority ?? 2; // Default NORMAL

        // 4. Calculate Total Size
        // Header: [Type(1)] + [Length(4)] + [Wire(1)] + [Priority(1)] = 7 bytes
        const HEADER_SIZE = 7;
        const totalSize = HEADER_SIZE + payloadBytes.byteLength;

        // 5. Allocate & Write
        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);
        const uint8View = new Uint8Array(buffer);

        view.setUint8(0, typeId);                       // Byte 0: Type
        view.setUint32(1, payloadBytes.byteLength);     // Bytes 1-4: Payload length
        view.setUint8(5, wireId);                       // Byte 5: Wire
        view.setUint8(6, priority);                     // Byte 6: Priority (NEW!)

        // Copy payload into buffer at offset 7
        uint8View.set(payloadBytes, HEADER_SIZE);

        return buffer;
    }

    /**
     * DECODE: Convert ArrayBuffer → JS Object
     *
     * 🎓 WHAT IS A DATAVIEW?
     * DataView lets you read specific bytes from an ArrayBuffer
     * at specific offsets. Think of it like a "magnifying glass"
     * that reads individual fields from raw memory.
     */
    static decode(buffer: ArrayBuffer): NandixPacket {
        const view = new DataView(buffer);
        const uint8View = new Uint8Array(buffer);

        // 1. Read Header (7 bytes)
        const typeId = view.getUint8(0);
        const length = view.getUint32(1);
        const wireId = view.getUint8(5);
        const priority = view.getUint8(6);

        // 2. Validate type
        const type = TYPE_MAP_REV[typeId];
        if (!type) throw new Error(`Unknown packet type ID: ${typeId}`);

        // 3. Extract Payload (starts at byte 7 now)
        const HEADER_SIZE = 7;
        const payloadBytes = uint8View.subarray(HEADER_SIZE, HEADER_SIZE + length);

        // 4. Decode Payload
        let payload: any;

        // Known binary types — keep as raw bytes
        if (type === "BLUE_CHUNK") {
            payload = new Uint8Array(payloadBytes);
        } else {
            const text = new TextDecoder().decode(payloadBytes);
            try {
                payload = JSON.parse(text);
            } catch {
                payload = text;
            }
        }

        const result: NandixPacket = {
            type: type as any,
            wire: (WIRE_MAP_REV[wireId] ?? "RED") as any,
            payload,
        };

        // Attach priority for scheduler awareness
        (result as any).priority = priority;

        return result;
    }
}

import { NandixPacket } from "./NandixMesh";

// 🥋 LEVEL 3: THE BYTE-LEVEL SORCERER
// MISSION: Implement a zero-copy binary protocol to replace JSON.
//
// WHY?
// JSON:  {"type":"DATA","payload":"hello"} (33 bytes) + Parsing Overhead
// BINARY: [0x01][LEN][PAYLOAD] (~9 bytes) + Zero parsing overhead
//
// THE SCHEMA (Strict Byte Layout):
// ┌────────────┬──────────────────────────┬──────────────────────┬──────────────────────┐
// │  OFFSET    │  FIELD                   │  TYPE                │  DESCRIPTION         │
// ├────────────┼──────────────────────────┼──────────────────────┼──────────────────────┤
// │  0         │  Packet Type             │  Uint8 (1 byte)      │  1=DATA, 2=HELLO...  │
// │  1         │  Payload Length          │  Uint32 (4 bytes)    │  Size of contents    │
// │  5         │  Wire Type               │  Uint8 (1 byte)      │  0=RED, 1=BLUE       │
// │  6         │  Payload                 │  Buffer (N bytes)    │  UTF-8 or Binary     │
// └────────────┴──────────────────────────┴──────────────────────┴──────────────────────┘

// Map string types to bytes for efficiency
const TYPE_MAP: Record<string, number> = {
    "DATA": 1,
    "HELLO": 2,
    "OFFER": 3,
    "ANSWER": 4,
    "CANDIDATE": 5,
    "TYPING": 6,
    "SEEN": 7
};

// Reverse map for decoding
const TYPE_MAP_REV = Object.fromEntries(Object.entries(TYPE_MAP).map(([k, v]) => [v, k]));

export class BinaryProtocol {

    /**
     * ENCODE: Convert a JS Object -> ArrayBuffer
     * Zero-copy framing logic.
     */
    static encode(packet: NandixPacket): ArrayBuffer {
        // 1. Get Type ID
        const typeId = TYPE_MAP[packet.type];
        if (!typeId) throw new Error(`Unknown packet type: ${packet.type}`);

        // 2. Encode Payload
        let payloadBytes: Uint8Array;
        if (typeof packet.payload === "string") {
            payloadBytes = new TextEncoder().encode(packet.payload);
        } else if (packet.payload instanceof Uint8Array) {
            payloadBytes = packet.payload; // Raw binary
        } else {
            // Fallback: JSON serialize the object payload
            const json = JSON.stringify(packet.payload);
            payloadBytes = new TextEncoder().encode(json);
        }

        // 3. Wire mapping (0=RED, 1=BLUE) - Default to RED
        const wireId = packet.wire === "BLUE" ? 1 : 0;

        // 4. Calculate Size
        // Header: [Type(1)] + [Length(4)] + [Wire(1)] = 6 bytes
        const totalSize = 6 + payloadBytes.byteLength;

        // 5. Allocate & Write
        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);
        const uint8View = new Uint8Array(buffer);

        view.setUint8(0, typeId);
        view.setUint32(1, payloadBytes.byteLength); // Big Endian by default? standard is usually BE network order, but DataView defaults BE.
        view.setUint8(5, wireId);

        // Copy payload into the buffer at offset 6
        uint8View.set(payloadBytes, 6);

        return buffer;
    }

    /**
     * DECODE: Convert ArrayBuffer -> JS Object
     */
    static decode(buffer: ArrayBuffer): NandixPacket {
        const view = new DataView(buffer);
        const uint8View = new Uint8Array(buffer);

        // 1. Read Header
        const typeId = view.getUint8(0);
        const length = view.getUint32(1);
        const wireId = view.getUint8(5);

        // 2. Validate
        const type = TYPE_MAP_REV[typeId];
        if (!type) throw new Error(`Unknown packet type ID: ${typeId}`);

        // 3. Extract Payload
        // Slice is zero-copy in Node's Buffer, but ArrayBuffer.slice copies.
        // For max speeds we would use a subarray view, but for API compat we might need a copy or decoded string.
        const payloadBytes = uint8View.subarray(6, 6 + length);

        // 4. Decode Payload
        // Try to assume it's JSON/String unless we know it's raw binary (like BLUE_CHUNK)
        // ideally we'd have a flag for "IsBinary", but for now, let's try-catch Parse
        // or check the packet type.
        let payload: any;

        // Known binary types
        if (type === "BLUE_CHUNK" || type === "FILE_DATA") {
            // Return raw bytes for file chunks
            // We must copy it out of the shared buffer if we want to keep it around
            payload = new Uint8Array(payloadBytes);
        } else {
            const text = new TextDecoder().decode(payloadBytes);
            try {
                payload = JSON.parse(text);
            } catch {
                payload = text;
            }
        }

        return {
            type: type as any,
            wire: wireId === 1 ? "BLUE" : "RED",
            payload
        };
    }
}

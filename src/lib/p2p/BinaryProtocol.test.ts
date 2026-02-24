import { describe, it, expect } from 'vitest';
import { BinaryProtocol } from './BinaryProtocol';
import { NandixPacket } from './NandixMesh';

/**
 * 🥋 TURBO EDITION: Binary Protocol Tests
 * 
 * 🎓 WHAT ARE UNIT TESTS?
 * A unit test checks one small "unit" of code in isolation.
 * If the test passes (green ✅), we KNOW that specific piece works.
 * If it fails (red ❌), we know EXACTLY where the bug is.
 * 
 * This is how AAA games prevent regressions — every system
 * has automated tests that run before every release.
 */
describe('🥋 Level 3: Binary Protocol (TURBO v2)', () => {
    it('should encode and decode a simple DATA packet with priority byte', () => {
        const original: NandixPacket = {
            type: 'DATA',
            wire: 'RED',
            payload: 'Hello, Sovereign World!'
        };

        // 1. Encode
        const buffer = BinaryProtocol.encode(original);
        expect(buffer).toBeInstanceOf(ArrayBuffer);
        // Header is now 7 bytes (was 6)
        expect(buffer.byteLength).toBe(7 + new TextEncoder().encode(original.payload).byteLength);

        // 2. Decode
        const decoded = BinaryProtocol.decode(buffer);

        // 3. Verify
        expect(decoded.type).toBe(original.type);
        expect(decoded.wire).toBe(original.wire);
        expect(decoded.payload).toBe(original.payload);

        console.log("✅ Turbo v2: JSON=" + JSON.stringify(original).length + "B vs Binary=" + buffer.byteLength + "B");
    });

    it('should encode CHAT_MSG with correct type ID (10)', () => {
        const packet: NandixPacket = {
            type: 'CHAT_MSG',
            wire: 'RED',
            payload: { text: 'Hello!', sender: 'peer-abc' }
        };

        const buffer = BinaryProtocol.encode(packet);
        const view = new DataView(buffer);

        // Type ID for CHAT_MSG should be 10
        expect(view.getUint8(0)).toBe(10);
        // Wire should be RED (0)
        expect(view.getUint8(5)).toBe(0);

        // Decode and verify roundtrip
        const decoded = BinaryProtocol.decode(buffer);
        expect(decoded.type).toBe('CHAT_MSG');
        expect(decoded.payload.text).toBe('Hello!');
    });

    it('should support GREEN and YELLOW wire types', () => {
        const greenPacket: NandixPacket = {
            type: 'GHOST_CMD',
            wire: 'GREEN' as any,
            payload: { cmd: 'infer' }
        };

        const buffer = BinaryProtocol.encode(greenPacket);
        const view = new DataView(buffer);

        // Wire should be GREEN (2)
        expect(view.getUint8(5)).toBe(2);

        const decoded = BinaryProtocol.decode(buffer);
        expect(decoded.wire).toBe('GREEN');
    });

    it('should preserve priority byte through encode/decode', () => {
        const packet: any = {
            type: 'PING',
            wire: 'RED',
            payload: { ts: Date.now() },
            priority: 0, // CRITICAL
        };

        const buffer = BinaryProtocol.encode(packet);
        const view = new DataView(buffer);

        // Priority byte at offset 6 should be 0 (CRITICAL)
        expect(view.getUint8(6)).toBe(0);

        const decoded = BinaryProtocol.decode(buffer);
        expect((decoded as any).priority).toBe(0);
    });

    it('should encode all 25+ packet types without error', () => {
        const types = [
            'DATA', 'HELLO', 'OFFER', 'ANSWER', 'CANDIDATE',
            'TYPING', 'SEEN', 'CHAT_MSG', 'ACK', 'REACTION',
            'PROFILE_SYNC', 'ROOM_INVITE', 'ROOM_ANNOUNCE',
            'PING', 'PONG', 'KEY_EXCHANGE', 'PRESENCE_UPDATE',
            'PAIRING_REQ', 'PAIRING_DATA', 'HEARTBEAT',
            'TRUST_VOUCH', 'BOT_ANNOUNCE',
            'BLUE_START', 'BLUE_CHUNK', 'BLUE_END',
            'GHOST_CMD', 'GHOST_RESP',
            'AGENT_ANNOUNCE', 'AGENT_SEARCH', 'AGENT_TASK_REQ', 'AGENT_TASK_RESP',
        ];

        for (const type of types) {
            const packet: NandixPacket = { type, wire: 'RED', payload: 'test' };
            expect(() => BinaryProtocol.encode(packet)).not.toThrow();
        }

        console.log(`✅ All ${types.length} packet types encode successfully.`);
    });

    it('should throw error for unknown packet types', () => {
        const badPacket: any = { type: 'UNKNOWN_TYPE', wire: 'RED', payload: 'test' };
        expect(() => BinaryProtocol.encode(badPacket)).toThrow();
    });
});

import { describe, it, expect } from 'vitest';
import { BinaryProtocol } from './BinaryProtocol';
import { NandixPacket } from './NandixMesh';

describe('🥋 Level 3: Binary Protocol', () => {
    it('should encode and decode a simple DATA packet', () => {
        const original: NandixPacket = {
            type: 'DATA',
            wire: 'RED',
            payload: 'Hello, Sovereign World!'
        };

        // 1. Encode
        console.log("Attempting to encode...");
        const buffer = BinaryProtocol.encode(original);

        expect(buffer).toBeInstanceOf(ArrayBuffer);
        expect(buffer.byteLength).toBeGreaterThan(0);

        // 2. Decode
        console.log("Attempting to decode...");
        const decoded = BinaryProtocol.decode(buffer);

        // 3. Verify
        expect(decoded.type).toBe(original.type);
        expect(decoded.wire).toBe(original.wire);
        expect(decoded.payload).toBe(original.payload);

        console.log("✅ Success! JSON size: " + JSON.stringify(original).length + " bytes vs Binary: " + buffer.byteLength + " bytes");
    });

    it('should throw error for unknown packet types', () => {
        const badPacket: any = { type: 'UNKNOWN_TYPE', wire: 'RED', payload: 'test' };
        expect(() => BinaryProtocol.encode(badPacket)).toThrow();
    });
});

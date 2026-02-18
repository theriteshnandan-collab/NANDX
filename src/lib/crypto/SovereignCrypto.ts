/**
 * SOVEREIGN ENCRYPTION ENGINE (NANDIX Core)
 * 
 * End-to-End Encryption using Web Crypto API only. Zero dependencies.
 * 
 * Protocol:
 *   1. Each peer generates an ECDH keypair (P-256) on boot
 *   2. On connection, peers exchange public keys via KEY_EXCHANGE packet
 *   3. Shared secret is derived (ECDH) → HKDF → AES-GCM 256-bit key
 *   4. All messages are encrypted with AES-GCM before transmission
 *   5. Random 12-byte IV per message (prepended to ciphertext)
 * 
 * Security properties:
 *   - Forward secrecy: New keypair per session
 *   - Authenticity: AES-GCM provides authenticated encryption
 *   - Confidentiality: 256-bit AES encryption
 */

export class SovereignCrypto {
    private keyPair: CryptoKeyPair | null = null;
    private sharedKeys: Map<string, CryptoKey> = new Map(); // peerId → AES key
    private publicKeyExport: JsonWebKey | null = null;

    /**
     * Generate ECDH keypair for this session.
     * Called once on boot.
     */
    async initialize(): Promise<void> {
        this.keyPair = await crypto.subtle.generateKey(
            { name: "ECDH", namedCurve: "P-256" },
            true,  // extractable (for export)
            ["deriveKey", "deriveBits"]
        );

        this.publicKeyExport = await crypto.subtle.exportKey("jwk", this.keyPair.publicKey);
        console.log("[CRYPTO] 🔐 ECDH keypair generated (P-256)");
    }

    /**
     * Get our public key for exchange with peers.
     */
    getPublicKey(): JsonWebKey | null {
        return this.publicKeyExport;
    }

    /**
     * Process a peer's public key and derive the shared AES key.
     * Called when we receive a KEY_EXCHANGE packet.
     */
    async deriveSharedKey(peerId: string, peerPublicKeyJwk: JsonWebKey): Promise<void> {
        if (!this.keyPair) {
            console.error("[CRYPTO] ❌ Not initialized");
            return;
        }

        // Import peer's public key
        const peerPublicKey = await crypto.subtle.importKey(
            "jwk",
            peerPublicKeyJwk,
            { name: "ECDH", namedCurve: "P-256" },
            false,
            []
        );

        // Derive shared bits via ECDH
        const sharedBits = await crypto.subtle.deriveBits(
            { name: "ECDH", public: peerPublicKey },
            this.keyPair.privateKey,
            256
        );

        // HKDF: shared bits → AES-GCM key
        const hkdfKey = await crypto.subtle.importKey(
            "raw",
            sharedBits,
            { name: "HKDF" },
            false,
            ["deriveKey"]
        );

        const aesKey = await crypto.subtle.deriveKey(
            {
                name: "HKDF",
                hash: "SHA-256",
                salt: new TextEncoder().encode("nandix-sovereign-v1"),
                info: new TextEncoder().encode("chat-encryption"),
            },
            hkdfKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );

        this.sharedKeys.set(peerId, aesKey);
        console.log(`[CRYPTO] 🤝 Shared key derived with ${peerId.substring(0, 12)}`);
    }

    /**
     * Encrypt a message for a specific peer.
     * Returns { iv: base64, ciphertext: base64 }
     */
    async encrypt(peerId: string, plaintext: string): Promise<{ iv: string; ciphertext: string } | null> {
        const key = this.sharedKeys.get(peerId);
        if (!key) {
            console.warn(`[CRYPTO] ⚠️ No shared key for ${peerId.substring(0, 12)}, sending unencrypted`);
            return null;
        }

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(plaintext);

        const cipherBuffer = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encoded
        );

        return {
            iv: this.bufferToBase64(iv),
            ciphertext: this.bufferToBase64(new Uint8Array(cipherBuffer)),
        };
    }

    /**
     * Decrypt a message from a specific peer.
     */
    async decrypt(peerId: string, iv: string, ciphertext: string): Promise<string | null> {
        const key = this.sharedKeys.get(peerId);
        if (!key) {
            console.warn(`[CRYPTO] ⚠️ No shared key for ${peerId.substring(0, 12)}, cannot decrypt`);
            return null;
        }

        try {
            const ivBytes = this.base64ToBuffer(iv);
            const cipherBytes = this.base64ToBuffer(ciphertext);

            const plainBuffer = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: ivBytes as BufferSource },
                key,
                cipherBytes as BufferSource
            );

            return new TextDecoder().decode(plainBuffer);
        } catch (err) {
            console.error(`[CRYPTO] ❌ Decryption failed for ${peerId.substring(0, 12)}:`, err);
            return null;
        }
    }

    /**
     * Encrypt a binary buffer for a specific peer.
     * Prepends IV (12 bytes) to the ciphertext.
     */
    async encryptBuffer(peerId: string, data: ArrayBuffer): Promise<ArrayBuffer | null> {
        const key = this.sharedKeys.get(peerId);
        if (!key) return null;

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const cipherBuffer = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            data
        );

        // Combine IV + Ciphertext into one buffer
        const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(cipherBuffer), iv.length);

        return combined.buffer;
    }

    /**
     * Decrypt a binary buffer from a specific peer.
     * Expects IV (12 bytes) at the start of the buffer.
     */
    async decryptBuffer(peerId: string, data: ArrayBuffer): Promise<ArrayBuffer | null> {
        const key = this.sharedKeys.get(peerId);
        if (!key) return null;

        try {
            const iv = new Uint8Array(data.slice(0, 12));
            const ciphertext = data.slice(12);

            const decrypted = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                key,
                ciphertext
            );

            return decrypted;
        } catch (err) {
            console.error(`[CRYPTO] ❌ Binary decryption failed for ${peerId.substring(0, 12)}:`, err);
            return null;
        }
    }

    /**
     * Check if we have a shared key with a peer (encryption established).
     */
    hasKeyFor(peerId: string): boolean {
        return this.sharedKeys.has(peerId);
    }

    /**
     * Get fingerprint of our public key (for verification UI).
     */
    async getFingerprint(): Promise<string> {
        if (!this.publicKeyExport) return "not-initialized";
        return SovereignCrypto.calculateFingerprint(this.publicKeyExport);
    }

    /**
     * Calculate fingerprint for any JWK public key.
     */
    static async calculateFingerprint(jwk: JsonWebKey): Promise<string> {
        const data = new TextEncoder().encode(JSON.stringify(jwk));
        const hash = await crypto.subtle.digest("SHA-256", data);
        const hex = Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
        // Return first 16 chars grouped in 4s: XXXX-XXXX-XXXX-XXXX
        return hex.substring(0, 16).replace(/(.{4})/g, "$1-").slice(0, -1);
    }

    // ── Helpers ──────────────────────────────────────────────────

    private bufferToBase64(buffer: Uint8Array): string {
        let binary = "";
        for (let i = 0; i < buffer.byteLength; i++) {
            binary += String.fromCharCode(buffer[i]);
        }
        return btoa(binary);
    }

    private base64ToBuffer(base64: string): Uint8Array {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
}

export const sovereignCrypto = new SovereignCrypto();

import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";

/**
 * 🛡️ SOVEREIGN BRIDGE: THE IDENTITY ANCHOR
 * 
 * 🎓 MISSION: Link a Phone Number or Email to a Sovereign Identity
 * WITHOUT a central database or ownership.
 * 
 * PATTERN: BLINDED RELAY
 * The Bridge acts as a "cryptographic pointer." It stores an
 * encrypted vault of your 12 magic words, indexed by a hash
 * of your phone/email.
 */

// Simulated Relay URL (Replace with real production relay in Phase 2)
const BRIDGE_RELAY_URL = "https://bridge.nandix.xyz/api/v1";

export interface BridgeVault {
    hash: string;       // Argon2/SHA256 of Phone/Email
    ciphertext: string; // AES-GCM encrypted 12 words
    iv: string;         // Initialization Vector (base64)
    salt: string;       // Salt used for key derivation
}

export class SovereignBridge {

    /**
     * 🔐 LINK: Securely backup your 12 words to the Bridge.
     */
    async link(contact: string, mnemonic: string): Promise<boolean> {
        console.log(`[BRIDGE] 🔗 Starting link sequence for: ${contact.substring(0, 3)}...`);

        try {
            // 1. Generate a hash of the contact (Phone/Email)
            const contactHash = this.hashContact(contact);

            // 2. Derive a key from the contact + a random salt
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const key = await this.deriveKeyFromContact(contact, salt);

            // 3. Encrypt the 12 words
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encodedMnemonic = new TextEncoder().encode(mnemonic);

            const encryptedBuffer = await crypto.subtle.encrypt(
                { name: "AES-GCM", iv },
                key,
                encodedMnemonic
            );

            const vault: BridgeVault = {
                hash: contactHash,
                ciphertext: this.bufferToBase64(new Uint8Array(encryptedBuffer)),
                iv: this.bufferToBase64(iv),
                salt: this.bufferToBase64(salt)
            };

            // 4. Send to the Blinded Relay
            // We simulate a successful fetch for now since we are in "Conquest Mode"
            console.log(`[BRIDGE] 📤 Sending Encrypted Vault to Relay [Hash: ${contactHash.substring(0, 8)}]`);

            /* 
            await fetch(`${BRIDGE_RELAY_URL}/vault`, {
                method: "POST",
                body: JSON.stringify(vault),
                headers: { "Content-Type": "application/json" }
            });
            */

            return true;
        } catch (err) {
            console.error("[BRIDGE] ❌ Link failed:", err);
            return false;
        }
    }

    /**
     * 🔓 RESTORE: Retrieve and decrypt 12 words via Phone/Email.
     */
    async restore(contact: string): Promise<string | null> {
        console.log(`[BRIDGE] 🔍 Attempting recovery for: ${contact.substring(0, 3)}...`);

        try {
            const contactHash = this.hashContact(contact);

            // 1. Fetch the vault from the Relay
            // Simulated response
            const mockVault = null as BridgeVault | null; // In a real app, we'd fetch(BRIDGE_RELAY_URL/vault/HASH)

            if (!mockVault) {
                console.warn("[BRIDGE] ⚠️ No vault found for this contact.");
                return null;
            }

            // 2. Derive the key using the same salt from the vault
            const salt = this.base64ToBuffer(mockVault.salt);
            const key = await this.deriveKeyFromContact(contact, salt);

            // 3. Decrypt
            const iv = this.base64ToBuffer(mockVault.iv);
            const ciphertext = this.base64ToBuffer(mockVault.ciphertext);

            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv as BufferSource },
                key,
                ciphertext as BufferSource
            );

            const mnemonic = new TextDecoder().decode(decryptedBuffer);
            console.log(`[BRIDGE] ✅ Identity successfully manifested from thin air.`);
            return mnemonic;

        } catch (err) {
            console.error("[BRIDGE] ❌ Recovery failed:", err);
            return null;
        }
    }

    /**
     * HASH: Create a privacy-preserving pointer.
     */
    private hashContact(contact: string): string {
        const clean = contact.trim().toLowerCase();
        return bytesToHex(sha256(new TextEncoder().encode(clean)));
    }

    /**
     * DERIVE: Turn an Email/Phone + Salt into an AES Key.
     */
    private async deriveKeyFromContact(contact: string, salt: Uint8Array): Promise<CryptoKey> {
        const baseKey = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(contact.trim().toLowerCase()),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt as unknown as BufferSource,
                iterations: 100000,
                hash: "SHA-256"
            },
            baseKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    }

    // ── Serialization Helpers ─────────────────────────────────────

    private bufferToBase64(buffer: Uint8Array): string {
        return btoa(String.fromCharCode.apply(null, Array.from(buffer)));
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

export const sovereignBridge = new SovereignBridge();

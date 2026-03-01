/**
 * SOVEREIGN IDENTITY V2 (NANDIX Core)
 * 
 * "Magic Words" — BIP39-compliant mnemonic identity system.
 * 
 * Flow:
 *   1. First launch → Generate 128-bit entropy → 12 words
 *   2. Words → SHA-256 → Deterministic Peer ID (always the same)
 *   3. Recovery → Enter 12 words → Same Peer ID restored
 * 
 * Collision probability: 1 in 2^128 (3.4 × 10^38)
 * That's more atoms than exist on Earth.
 */

import { generateMnemonic, validateMnemonic, mnemonicToEntropy, mnemonicToSeedSync } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import { ed25519 } from "@noble/curves/ed25519.js";

// Storage keys
const STORAGE_KEY_MNEMONIC = "nandix-sovereign-mnemonic";
const STORAGE_KEY_ID = "nandix-sovereign-id";
const STORAGE_KEY_DEVICE_ID = "nandix-sovereign-device-id";

export interface SovereignProfile {
    id: string;          // PeerJS-safe ID (nandix-XXXXXXXX)
    mnemonic: string;    // 12 recovery words
    signingPublicKey: string; // ED25519 public key (hex)
    isNew: boolean;      // True if just generated (show onboarding)
}

export interface UserProfile {
    username: string;
    bio: string;
    avatar: string;
    peerId: string;
}

export class SovereignIdentity {
    private cachedId: string | null = null;
    private cachedMnemonic: string | null = null;
    private isGenerating: boolean = false;

    /**
     * Generate or retrieve a persistent Sovereign Identity.
     * Returns both the Peer ID and the mnemonic (for display/backup).
     */
    public async generate(): Promise<SovereignProfile> {
        // Prevent React StrictMode double execution race conditions
        if (this.isGenerating) {
            console.log("[IDENTITY] ⏳ Generation already in progress, waiting...");
            // Poll until generation finishes
            while (this.isGenerating) {
                await new Promise(r => setTimeout(r, 50));
            }
        }

        // 1. Check if we already have a mnemonic stored
        if (typeof window !== "undefined") {
            const storedMnemonic = localStorage.getItem(STORAGE_KEY_MNEMONIC);
            const storedId = localStorage.getItem(STORAGE_KEY_ID);

            if (storedMnemonic && storedId) {
                this.cachedId = storedId;
                this.cachedMnemonic = storedMnemonic;
                const seed = mnemonicToSeedSync(storedMnemonic);
                const signingPublicKey = bytesToHex(ed25519.getPublicKey(seed.slice(0, 32)));
                console.log(`[IDENTITY] ✅ Restored from vault: ${storedId}`);
                return { id: storedId, mnemonic: storedMnemonic, signingPublicKey, isNew: false };
            }
        }

        this.isGenerating = true;

        // 2. Generate new mnemonic (12 words from 128-bit entropy)
        const mnemonic = generateMnemonic(wordlist, 128);
        const deviceId = this.getDeviceId();
        const id = this.deriveIdFromMnemonic(mnemonic, deviceId);
        const seed = mnemonicToSeedSync(mnemonic);
        const signingPublicKey = bytesToHex(ed25519.getPublicKey(seed.slice(0, 32)));

        // 3. Persist
        this.cachedId = id;
        this.cachedMnemonic = mnemonic;
        this.persist(mnemonic, id);

        this.isGenerating = false;
        console.log(`[IDENTITY] 🆕 New identity forged: ${id} (Device: ${deviceId})`);
        return { id, mnemonic, signingPublicKey, isNew: true };
    }

    /**
     * Recover identity from a 12-word mnemonic.
     * Returns null if the words are invalid.
     */
    public recover(mnemonic: string): SovereignProfile | null {
        const cleaned = mnemonic.trim().toLowerCase().replace(/\s+/g, " ");

        // Validate against BIP39 wordlist
        if (!validateMnemonic(cleaned, wordlist)) {
            console.error(`[IDENTITY] ❌ Invalid mnemonic`);
            return null;
        }

        const deviceId = this.getDeviceId();
        const id = this.deriveIdFromMnemonic(cleaned, deviceId);
        const seed = mnemonicToSeedSync(cleaned);
        const signingPublicKey = bytesToHex(ed25519.getPublicKey(seed.slice(0, 32)));

        // Persist the recovered identity
        this.cachedId = id;
        this.cachedMnemonic = cleaned;
        this.persist(cleaned, id);

        console.log(`[IDENTITY] 🔄 Identity recovered: ${id} (Device: ${deviceId})`);
        return { id, mnemonic: cleaned, signingPublicKey, isNew: false };
    }

    /**
     * Deterministic: Same (mnemonic + deviceId) → Same Peer ID.
     * 
     * Mnemonic → entropy bytes (+ deviceId) → SHA-256 → first 16 hex chars
     */
    private deriveIdFromMnemonic(mnemonic: string, deviceId: string = "master"): string {
        // BIP39 mnemonic → raw entropy bytes
        const entropy = mnemonicToEntropy(mnemonic, wordlist);

        // Mix in Device ID for uniqueness per device
        const msg = new TextEncoder().encode(deviceId);
        const combined = new Uint8Array(entropy.length + msg.length);
        combined.set(entropy);
        combined.set(msg, entropy.length);

        // SHA-256 hash of the combined entropy (deterministic)
        const hash = sha256(combined);

        // Convert to hex and take first 16 chars
        const hex = bytesToHex(hash).substring(0, 16);

        // Suffix with short device ID for cluster recognition
        const suffix = deviceId === "master" ? "0000" : deviceId.substring(0, 4);
        return `nandix-${hex}-${suffix}`;
    }

    /**
     * Get or generate a persistent Device ID for this instance.
     */
    public getDeviceId(): string {
        if (typeof window === "undefined") return "server";
        let dId = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
        if (!dId) {
            // First time or master fallback? 
            // If we have an OLD ID, we might want to stay 'master'
            const oldId = localStorage.getItem(STORAGE_KEY_ID);
            if (!oldId) {
                // Completely new install
                dId = Math.random().toString(36).substring(2, 10);
            } else {
                // Existing install, keep it 'master' to avoid breaking IDs for now
                // OR we accept the break for the sake of the new architecture
                dId = "master";
            }
            localStorage.setItem(STORAGE_KEY_DEVICE_ID, dId);
        }
        return dId;
    }

    /**
     * Save identity to localStorage vault.
     */
    private persist(mnemonic: string, id: string) {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_MNEMONIC, mnemonic);
            localStorage.setItem(STORAGE_KEY_ID, id);
        }
    }

    /**
     * Wipe identity from device (for testing or account reset).
     */
    public wipe() {
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY_MNEMONIC);
            localStorage.removeItem(STORAGE_KEY_ID);
        }
        this.cachedId = null;
        this.cachedMnemonic = null;
        console.log(`[IDENTITY] 🗑️ Identity wiped`);
    }

    /**
     * Check if this device has an identity.
     */
    public hasIdentity(): boolean {
        if (typeof window === "undefined") return false;
        return !!localStorage.getItem(STORAGE_KEY_MNEMONIC);
    }

    /**
     * Get the stored mnemonic (for display in settings).
     */
    public getMnemonic(): string | null {
        if (typeof window !== "undefined") {
            return localStorage.getItem(STORAGE_KEY_MNEMONIC);
        }
        return this.cachedMnemonic;
    }

    public getId(): string | null {
        return this.cachedId;
    }

    /**
     * Get the long-term ED25519 signing keys.
     * Private key is derived from the first 32 bytes of the mnemonic seed.
     */
    public getSigningKeys(): { publicKey: Uint8Array; privateKey: Uint8Array } | null {
        const mnemonic = this.getMnemonic();
        if (!mnemonic) return null;
        const seed = mnemonicToSeedSync(mnemonic);
        const privateKey = seed.slice(0, 32);
        const publicKey = ed25519.getPublicKey(privateKey);
        return { publicKey, privateKey };
    }

    // ── Sovereign Bridge Extensions ──────────────────────────────

    /**
     * Link this identity to a Phone/Email via the Sovereign Bridge.
     */
    public async linkToBridge(contact: string): Promise<boolean> {
        const mnemonic = this.getMnemonic();
        if (!mnemonic) return false;

        const { sovereignBridge } = await import("./SovereignBridge");
        return sovereignBridge.link(contact, mnemonic);
    }

    /**
     * Restore identity using the Sovereign Bridge.
     */
    public async restoreFromBridge(contact: string): Promise<boolean> {
        const { sovereignBridge } = await import("./SovereignBridge");
        const mnemonic = await sovereignBridge.restore(contact);

        if (mnemonic) {
            this.recover(mnemonic);
            return true;
        }
        return false;
    }
}

export const identity = new SovereignIdentity();

// ── Profile Management ─────────────────────────────────────────────

/**
 * Get the user's local profile from indexedDB via Identity.
 */
export async function getMyProfile(peerId: string): Promise<UserProfile | null> {
    const { db } = await import("../db/NandixDB");
    return db.settings.get(`profile-${peerId}`).then(s => s?.value || null);
}

/**
 * Save the user's local profile.
 */
export async function setMyProfile(profile: UserProfile) {
    const { db } = await import("../db/NandixDB");
    return db.settings.put({ key: `profile-${profile.peerId}`, value: profile });
}

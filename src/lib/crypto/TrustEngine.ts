import { ed25519 } from "@noble/curves/ed25519.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { identity } from "./Identity";
import { db, saveContact, getContact } from "../db/NandixDB";

/**
 * SOVEREIGN TRUST ENGINE
 * 
 * Logic for decentralized reputation (Vouching).
 * A "Vouch" is a signed claim: "I trust peer X with level Y".
 */

export interface TrustVouch {
    senderId: string;
    targetId: string;
    level: number;       // 1-10
    timestamp: number;
    publicKey: string;   // Sender's ED25519 public key (hex)
    signature: string;   // hex signature of (targetId + level + timestamp)
}

export class TrustEngine {
    /**
     * Create a signed vouch for a peer.
     */
    async signVouch(targetId: string, level: number): Promise<TrustVouch | null> {
        const keys = identity.getSigningKeys();
        const myId = identity.getId();
        if (!keys || !myId) return null;

        const timestamp = Date.now();
        const msg = new TextEncoder().encode(`${targetId}:${level}:${timestamp}`);
        const signature = ed25519.sign(msg, keys.privateKey);

        return {
            senderId: myId,
            targetId,
            level,
            timestamp,
            publicKey: bytesToHex(keys.publicKey),
            signature: bytesToHex(signature),
        };
    }

    /**
     * Verify a vouch received from the mesh.
     */
    async verifyVouch(vouch: TrustVouch): Promise<boolean> {
        try {
            const msg = new TextEncoder().encode(`${vouch.targetId}:${vouch.level}:${vouch.timestamp}`);
            const isValid = ed25519.verify(
                hexToBytes(vouch.signature),
                msg,
                hexToBytes(vouch.publicKey)
            );

            // Additional sanity check: vouch shouldn't be too old (e.g. > 30 days)
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;
            if (Date.now() - vouch.timestamp > thirtyDays) return false;

            return isValid;
        } catch (err) {
            console.error("[TRUST] ❌ Verification error:", err);
            return false;
        }
    }

    /**
     * Process an incoming vouch and update local trust metrics.
     */
    async processIncomingVouch(vouch: TrustVouch) {
        if (!(await this.verifyVouch(vouch))) {
            console.warn(`[TRUST] ⚠️ Received invalid vouch from ${vouch.senderId}`);
            return;
        }

        const contact = await getContact(vouch.targetId);
        if (contact) {
            const vouchedBy = contact.vouchedBy || [];
            if (!vouchedBy.includes(vouch.senderId)) {
                const newVouchedBy = [...vouchedBy, vouch.senderId];

                // Calculate new trust score
                // Logic: Base trust is 10. Each vouch adds level * multiplier.
                // Simple version: Score = weighted average of all vouches.
                const currentScore = contact.trustScore || 10;
                const newScore = Math.min(100, currentScore + (vouch.level * 2));

                await db.contacts.update(vouch.targetId, {
                    trustScore: newScore,
                    vouchedBy: newVouchedBy
                });

                console.log(`[TRUST] ✅ Trust increased for ${vouch.targetId} to ${newScore}`);
            }
        } else {
            // If contact doesn't exist, we might ignore or save as "stranger"
            console.log(`[TRUST] 👤 Known vouch for stranger ${vouch.targetId}`);
        }
    }
}

export const trustEngine = new TrustEngine();

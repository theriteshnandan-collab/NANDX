import { sovereignCrypto } from "../crypto/SovereignCrypto";

/**
 * 🤖 SOVEREIGN AGENT IDENTITY
 * 
 * Defines the identity and cryptographic soul of a Nandix Agent.
 * Agents use the same ED25519 keys as humans but are identified by specific metadata.
 */

export interface AgentManifest {
    id: string;             // Peer ID or Public Key Hash
    name: string;           // Agent Persona Name
    capabilities: string[]; // List of tools (summarize, search, index, etc.)
    trustLevel: number;     // 0-100 Reputation
    ownerId: string;        // The peer who spawned this agent
    version: string;
}

export class SovereignAgent {
    private manifest: AgentManifest;

    constructor(manifest: AgentManifest) {
        this.manifest = manifest;
    }

    public getManifest(): AgentManifest {
        return this.manifest;
    }

    /**
     * Signs a packet or command to prove it came from an authorized agent.
     */
    public async signTask(payload: any): Promise<string | null> {
        const data = JSON.stringify(payload);
        return await sovereignCrypto.sign(data);
    }

    /**
     * Verifies if a task was signed by a specific agent.
     */
    public static async verifyTask(payload: any, signature: string, publicKey: string): Promise<boolean> {
        const data = JSON.stringify(payload);
        // Using common crypto utility
        return await sovereignCrypto.verify(data, signature, publicKey);
    }
}

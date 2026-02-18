import { NandixMesh } from "../p2p/NandixMesh";
import { persistMessage, ChatMessage } from "../db/NandixDB";

/**
 * BOT SHARDS (NANDIX Automation Framework)
 * 
 * Shards are small, local automation modules that respond to mesh events.
 * They run exclusively on the user's device.
 */

export interface BotShard {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    onMessage?: (peerId: string, text: string) => Promise<void>;
    onConnection?: (peerId: string) => Promise<void>;
}

export class BotManager {
    private shards: Map<string, BotShard> = new Map();
    private mesh: NandixMesh;

    constructor(mesh: NandixMesh) {
        this.mesh = mesh;
        this.initDefaultShards();
    }

    private initDefaultShards() {
        // 1. 👋 THE GREETER: Auto-responds to new connections
        this.registerShard({
            id: "greeter",
            name: "Greeter Shard",
            description: "Automatically greets new peers when they connect.",
            enabled: false,
            onConnection: async (peerId) => {
                const greeting = "Hello from my Sovereign NANDIX node! 👋 I'm currently away, but your signal has been received.";
                await this.sendAutoResponse(peerId, greeting);
            }
        });

        // 2. 📡 EBCHO: Echo bot for testing
        this.registerShard({
            id: "echo",
            name: "Echo Shard",
            description: "Repeats everything you say (useful for testing latency).",
            enabled: false,
            onMessage: async (peerId, text) => {
                if (text.startsWith("/echo ")) {
                    const reply = `Echo: ${text.replace("/echo ", "")}`;
                    await this.sendAutoResponse(peerId, reply);
                }
            }
        });
    }

    public registerShard(shard: BotShard) {
        this.shards.set(shard.id, shard);
        console.log(`[BOT] 🤖 Registered shard: ${shard.name}`);
    }

    public toggleShard(id: string, enabled: boolean) {
        const shard = this.shards.get(id);
        if (shard) {
            shard.enabled = enabled;
            console.log(`[BOT] 🤖 ${shard.name} ${enabled ? 'ENABLED' : 'DISABLED'}`);
        }
    }

    public getShards(): BotShard[] {
        return Array.from(this.shards.values());
    }

    /**
     * Handle an incoming message from the mesh.
     */
    public async handleMessage(peerId: string, text: string) {
        for (const shard of Array.from(this.shards.values())) {
            if (shard.enabled && shard.onMessage) {
                await shard.onMessage(peerId, text);
            }
        }
    }

    /**
     * Handle a new peer connection.
     */
    public async handleConnection(peerId: string) {
        for (const shard of Array.from(this.shards.values())) {
            if (shard.enabled && shard.onConnection) {
                await shard.onConnection(peerId);
            }
        }
    }

    private async sendAutoResponse(peerId: string, text: string) {
        const messageId = `bot-${Math.random().toString(36).substring(2, 9)}`;
        const msg: Omit<ChatMessage, "id"> = {
            topic: peerId,
            messageId,
            sender: "BOT",
            text,
            timestamp: Date.now(),
            deliveryStatus: "sent"
        };

        // 1. Persist to local DB so it shows in UI
        await persistMessage(msg);

        // 2. Send over the mesh
        await this.mesh.sendChatMessage({
            id: messageId,
            sender: "BOT",
            text,
            timestamp: msg.timestamp,
            topic: peerId
        });

        console.log(`[BOT] 🤖 Auto-responded to ${peerId}: ${text}`);
    }
}

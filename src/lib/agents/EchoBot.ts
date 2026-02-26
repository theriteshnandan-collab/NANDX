/**
 * EchoBot — A simple auto-poster Bot Shard.
 * Posts a system heartbeat to the local DB + broadcasts to the mesh.
 */

import { db, SocialPost } from "@/lib/db/NandixDB";
import { mesh } from "@/lib/p2p/NandixMesh";

export class EchoBot {
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private myId: string;
    private authorName: string;
    public isRunning = false;

    constructor(myId: string, authorName: string = "echo-bot") {
        this.myId = myId;
        this.authorName = authorName;
    }

    start(intervalMs: number = 30000) {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log("[ECHO BOT] 🤖 Started. Posting every", intervalMs / 1000, "seconds.");

        // Post immediately, then on interval
        this.post();
        this.intervalId = setInterval(() => this.post(), intervalMs);
    }

    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log("[ECHO BOT] 🔴 Stopped.");
    }

    private async post() {
        const now = new Date();
        const text = `[ECHO BOT] 🤖 Mesh heartbeat @ ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}. Sovereign node operational.`;

        const newPost: SocialPost = {
            id: `echobot-${Date.now()}`,
            authorId: this.myId,
            authorName: this.authorName,
            text,
            timestamp: Date.now(),
            vibeCount: 0,
        };

        await db.posts.put(newPost);
        mesh.broadcastSocialPost(newPost);
        console.log("[ECHO BOT] 📡 Post broadcasted:", text);
    }
}

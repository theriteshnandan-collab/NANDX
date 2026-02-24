import { NandixPacket } from "./NandixMesh";
import { BinaryProtocol } from "./BinaryProtocol";

/**
 * 🏎️ TRIDENT SCHEDULER — THE AAA PACKET ENGINE
 *
 * 🎓 DESIGN PATTERN: PRIORITY QUEUE (a.k.a. "Heap" in Computer Science)
 *
 * WHY THIS EXISTS:
 * In a normal chat app, packets are sent FIFO (First In, First Out).
 * But in a gaming-grade system, a massive file transfer (BLUE wire)
 * can "clog the pipe" and delay critical control packets like PINGs,
 * ACKs, and Heartbeats. This is called "Head-of-Line Blocking."
 *
 * THE FIX:
 * We assign every packet a PRIORITY LEVEL. Critical packets always
 * jump ahead of background data. This is how competitive FPS games
 * ensure your gunshot registers before a texture loads.
 *
 * PRIORITY LEVELS:
 *   0 = CRITICAL  → Heartbeats, PINGs, ACKs (must never be delayed)
 *   1 = HIGH      → Chat messages, Typing indicators (user-facing)
 *   2 = NORMAL    → Profile syncs, Room announces (can wait a bit)
 *   3 = BACKGROUND → File chunks, Agent data (bulk transfer)
 */

export enum PacketPriority {
    CRITICAL = 0,
    HIGH = 1,
    NORMAL = 2,
    BACKGROUND = 3,
}

/**
 * Maps packet types to their priority level.
 * This is the "Rulebook" that determines who goes first.
 */
const PRIORITY_MAP: Record<string, PacketPriority> = {
    // CRITICAL: System heartbeat — the "pulse" of the mesh
    "PING": PacketPriority.CRITICAL,
    "PONG": PacketPriority.CRITICAL,
    "ACK": PacketPriority.CRITICAL,
    "KEY_EXCHANGE": PacketPriority.CRITICAL,
    "HEARTBEAT": PacketPriority.CRITICAL,

    // HIGH: User-facing actions — what the human sees immediately
    "CHAT_MSG": PacketPriority.HIGH,
    "TYPING": PacketPriority.HIGH,
    "SEEN": PacketPriority.HIGH,
    "REACTION": PacketPriority.HIGH,

    // NORMAL: Social features — important but not time-critical
    "PROFILE_SYNC": PacketPriority.NORMAL,
    "ROOM_INVITE": PacketPriority.NORMAL,
    "ROOM_ANNOUNCE": PacketPriority.NORMAL,
    "PRESENCE_UPDATE": PacketPriority.NORMAL,
    "TRUST_VOUCH": PacketPriority.NORMAL,
    "BOT_ANNOUNCE": PacketPriority.NORMAL,

    // BACKGROUND: Bulk data — can be delayed without user noticing
    "BLUE_START": PacketPriority.BACKGROUND,
    "BLUE_CHUNK": PacketPriority.BACKGROUND,
    "BLUE_END": PacketPriority.BACKGROUND,
    "AGENT_ANNOUNCE": PacketPriority.BACKGROUND,
    "AGENT_SEARCH": PacketPriority.BACKGROUND,
    "AGENT_TASK_REQ": PacketPriority.BACKGROUND,
};

interface QueuedPacket {
    packet: NandixPacket;
    priority: PacketPriority;
    timestamp: number;  // For FIFO ordering within the same priority
    targetPeerId?: string; // Optional: send to specific peer only
}

/**
 * 🏎️ THE SCHEDULER
 *
 * 🎓 PATTERN: Producer-Consumer with Priority Queue
 *
 * Producers (chat, file transfer, agents) push packets into the queue.
 * The Scheduler drains the queue at a fixed interval (the "tick rate"),
 * always sending the highest-priority packet first.
 *
 * TICK RATE: 16ms (~60fps) — matches the browser's requestAnimationFrame
 * for buttery smooth coordination.
 */
export class TridentScheduler {
    private queue: QueuedPacket[] = [];
    private tickTimer: ReturnType<typeof setInterval> | null = null;
    private sendFn: ((peerId: string | null, encoded: ArrayBuffer | NandixPacket) => void) | null = null;

    // 📊 TELEMETRY: Track scheduler performance
    private stats = {
        totalEnqueued: 0,
        totalDrained: 0,
        droppedStale: 0,   // Packets that sat too long
        peakQueueSize: 0,
    };

    /**
     * Register the send function from NandixMesh.
     * This is "Dependency Injection" — the Scheduler doesn't know HOW
     * to send; it only knows WHEN and WHAT to send.
     */
    public registerSender(fn: (peerId: string | null, data: ArrayBuffer | NandixPacket) => void) {
        this.sendFn = fn;
    }

    /**
     * ENQUEUE: Add a packet to the priority queue.
     */
    public enqueue(packet: NandixPacket, targetPeerId?: string) {
        const priority = PRIORITY_MAP[packet.type] ?? PacketPriority.NORMAL;

        this.queue.push({
            packet,
            priority,
            timestamp: Date.now(),
            targetPeerId,
        });

        this.stats.totalEnqueued++;
        if (this.queue.length > this.stats.peakQueueSize) {
            this.stats.peakQueueSize = this.queue.length;
        }

        // Sort: lowest priority number = highest importance
        // Within same priority, earlier timestamp goes first (FIFO)
        this.queue.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return a.timestamp - b.timestamp;
        });
    }

    /**
     * START: Begin the scheduler tick loop.
     * 
     * 🎓 THE TICK RATE
     * Games run at 60fps (16.67ms per frame). We match this rate
     * so that the mesh feels as responsive as a game engine.
     * Every 16ms, we drain up to `batchSize` packets from the queue.
     */
    public start(tickRateMs: number = 16, batchSize: number = 8) {
        if (this.tickTimer) return; // Already running

        console.log(`[SCHEDULER] 🏎️ Trident Scheduler ONLINE. Tick: ${tickRateMs}ms, Batch: ${batchSize}`);

        this.tickTimer = setInterval(() => {
            this.drain(batchSize);
        }, tickRateMs);
    }

    /**
     * DRAIN: Send the top N packets from the queue.
     */
    private drain(batchSize: number) {
        if (!this.sendFn || this.queue.length === 0) return;

        const now = Date.now();
        const batch = this.queue.splice(0, batchSize);

        for (const item of batch) {
            // Drop stale packets (older than 10 seconds for BACKGROUND, 5s for others)
            const maxAge = item.priority === PacketPriority.BACKGROUND ? 10000 : 5000;
            if (now - item.timestamp > maxAge) {
                this.stats.droppedStale++;
                console.warn(`[SCHEDULER] ⚠️ Dropped stale ${item.packet.type} (age: ${now - item.timestamp}ms)`);
                continue;
            }

            try {
                // Try binary encoding for known types, fallback to raw packet
                let encoded: ArrayBuffer | NandixPacket;
                try {
                    encoded = BinaryProtocol.encode(item.packet);
                } catch {
                    encoded = item.packet; // Fallback for types not in BinaryProtocol TYPE_MAP
                }

                this.sendFn(item.targetPeerId ?? null, encoded);
                this.stats.totalDrained++;
            } catch (err) {
                console.error(`[SCHEDULER] ❌ Failed to send ${item.packet.type}:`, err);
            }
        }
    }

    /**
     * STOP: Halt the scheduler (cleanup).
     */
    public stop() {
        if (this.tickTimer) {
            clearInterval(this.tickTimer);
            this.tickTimer = null;
            console.log(`[SCHEDULER] 🛑 Trident Scheduler OFFLINE.`);
        }
    }

    /**
     * 📊 GET STATS: Expose telemetry for the Kernel HUD.
     */
    public getStats() {
        return {
            ...this.stats,
            currentQueueSize: this.queue.length,
        };
    }

    /**
     * Get the priority of a packet type (useful for testing/debugging).
     */
    public static getPriority(type: string): PacketPriority {
        return PRIORITY_MAP[type] ?? PacketPriority.NORMAL;
    }
}

// Singleton export
export const tridentScheduler = new TridentScheduler();

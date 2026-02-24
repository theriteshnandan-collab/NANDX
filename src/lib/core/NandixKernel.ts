import { EventEmitter } from "events";
import { mesh } from "../p2p/NandixMesh";
import { db } from "../db/NandixDB";
import { tridentScheduler, PacketPriority } from "../p2p/TridentScheduler";

/**
 * 🔱 NANDIX MASTER KERNEL (TURBO EDITION)
 * 
 * 🎓 PATTERN: SINGLETON + MEDIATOR
 *
 * SINGLETON: Exactly ONE kernel instance exists. This prevents
 * multiple "brains" from fighting over resources.
 *
 * MEDIATOR: The Kernel sits between all modules (Mesh, DB, AI)
 * and coordinates their communication. No module talks directly
 * to another — they all go through the Kernel. This is how
 * game engines like Unreal and Unity work internally.
 *
 * BOOT SEQUENCE (Strict Order):
 *   1. Database (Memory) — must be ready before anything reads/writes
 *   2. Scheduler (Priority Engine) — must be ready before packets flow
 *   3. Mesh (Nervous System) — connects to the P2P network
 *   4. Subscribers (Event Wiring) — bridges all modules together
 */

export enum KernelState {
    IDLE = "IDLE",
    BOOTING = "BOOTING",
    READY = "READY",
    CRITICAL = "CRITICAL"
}

export type KernelEvent =
    | "MESH_STABLE"
    | "DB_CONNECTED"
    | "SCHEDULER_ONLINE"
    | "AI_DISCOVERED"
    | "HEARTBEAT";

class NandixKernel extends EventEmitter {
    private static instance: NandixKernel;
    private state: KernelState = KernelState.IDLE;
    private startTime: number = 0;

    private constructor() {
        super();
        this.startTime = Date.now();
        console.log(`[KERNEL] 🔱 System Initialized at T+0ms`);
    }

    public static getInstance() {
        if (!NandixKernel.instance) {
            NandixKernel.instance = new NandixKernel();
        }
        return NandixKernel.instance;
    }

    /**
     * 🚀 THE BOOT SEQUENCE
     *
     * 🎓 WHY STRICT ORDER?
     * If the Mesh starts before the Database, incoming messages
     * have nowhere to be stored → data loss. If the Scheduler
     * starts after the Mesh, early packets skip priority → jitter.
     * 
     * This is called "Dependency Ordering" — a core concept in
     * operating system design (Linux kernel does the same thing).
     */
    public async boot() {
        if (this.state !== KernelState.IDLE) return;

        console.log(`[KERNEL] 🏎️  Booting Nandix Master Engine...`);
        this.state = KernelState.BOOTING;

        try {
            // ── PHASE 1: MEMORY ──────────────────────────────────
            await db.open();
            this.emitEvent("DB_CONNECTED");
            console.log(`[KERNEL] 🧱 Database Open [T+${this.getUptime()}ms]`);

            // ── PHASE 2: SCHEDULER ───────────────────────────────
            // Register the send function so the scheduler can push
            // packets through the mesh's actual connections.
            tridentScheduler.registerSender((peerId, data) => {
                mesh.sendRaw(peerId, data);
            });
            tridentScheduler.start(16, 8); // 60fps, 8 packets per tick
            this.emitEvent("SCHEDULER_ONLINE");
            console.log(`[KERNEL] 🏎️ Scheduler Online [T+${this.getUptime()}ms] — 60fps, Batch: 8`);

            // ── PHASE 3: MESH ────────────────────────────────────
            this.setupSubscribers();
            this.emitEvent("MESH_STABLE");
            console.log(`[KERNEL] 📡 Mesh Frequency Locked [T+${this.getUptime()}ms]`);

            this.state = KernelState.READY;
            console.log(`[KERNEL] ✅ SIOS KERNEL STABLE. Ready for autonomous load.`);
        } catch (error) {
            this.state = KernelState.CRITICAL;
            console.error(`[KERNEL] 🚨 CRITICAL FAILURE DURING BOOT:`, error);
        }
    }

    /**
     * 📡 EVENT-DRIVEN ARCHITECTURE
     *
     * 🎓 PATTERN: OBSERVER (a.k.a. Pub/Sub)
     *
     * Instead of modules constantly "asking" each other for updates
     * (polling = wasteful CPU), they "subscribe" to events.
     * When something happens, the Kernel "publishes" the event
     * and ALL subscribers react simultaneously. This is why
     * multiplayer games feel instant — events propagate in <1ms.
     */
    private emitEvent(event: KernelEvent, data?: any) {
        this.emit(event, { timestamp: Date.now(), data });
    }

    private setupSubscribers() {
        // Bridge Mesh events → Kernel events
        mesh.onConnection((peerId) => {
            this.emitEvent("HEARTBEAT", { peerId, type: "PEER_JOIN" });
        });
    }

    /**
     * 📊 KERNEL TELEMETRY
     * Exposes real-time performance data for the HUD.
     */
    public getState() { return this.state; }
    public getUptime() { return Date.now() - this.startTime; }

    public getTelemetry() {
        return {
            state: this.state,
            uptimeMs: this.getUptime(),
            scheduler: tridentScheduler.getStats(),
        };
    }

    /**
     * 🛑 SHUTDOWN: Graceful teardown (reverse order of boot).
     */
    public shutdown() {
        tridentScheduler.stop();
        this.state = KernelState.IDLE;
        console.log(`[KERNEL] 🛑 Kernel Shutdown. Uptime: ${this.getUptime()}ms`);
    }
}

export const kernel = NandixKernel.getInstance();

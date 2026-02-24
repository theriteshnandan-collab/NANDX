/**
 * 🏎️ TRANSFER CONTROLLER: PAUSE/RESUME Logic
 * 
 * 🎓 MISSION: Allow file transfers over BLUE wire to be paused,
 * resumed, and cancelled without data corruption.
 * 
 * PATTERN: State Machine (IDLE → SENDING → PAUSED → SENDING → COMPLETE)
 */

export type TransferState = "IDLE" | "SENDING" | "PAUSED" | "COMPLETE" | "ERROR" | "CANCELLED";

export interface TransferJob {
    id: string;
    fileName: string;
    totalChunks: number;
    sentChunks: number;
    state: TransferState;
    targetPeerId: string;
    startedAt: number;
    pausedAt?: number;
    bytesPerSecond: number;
}

export class TransferController {
    private jobs: Map<string, TransferJob> = new Map();
    private pauseSignals: Map<string, boolean> = new Map(); // jobId → isPaused

    /**
     * Register a new file transfer.
     */
    public create(jobId: string, fileName: string, totalChunks: number, targetPeerId: string): TransferJob {
        const job: TransferJob = {
            id: jobId,
            fileName,
            totalChunks,
            sentChunks: 0,
            state: "IDLE",
            targetPeerId,
            startedAt: Date.now(),
            bytesPerSecond: 0,
        };

        this.jobs.set(jobId, job);
        this.pauseSignals.set(jobId, false);
        console.log(`[TRANSFER] 📦 Job created: ${fileName} (${totalChunks} chunks)`);
        return job;
    }

    /**
     * Call before sending each chunk. Returns false if paused/cancelled.
     */
    public canSendNext(jobId: string): boolean {
        const job = this.jobs.get(jobId);
        if (!job) return false;
        if (job.state === "CANCELLED" || job.state === "ERROR") return false;

        // Check pause signal
        if (this.pauseSignals.get(jobId)) {
            if (job.state !== "PAUSED") {
                job.state = "PAUSED";
                job.pausedAt = Date.now();
                console.log(`[TRANSFER] ⏸️ Paused: ${job.fileName} at chunk ${job.sentChunks}/${job.totalChunks}`);
            }
            return false;
        }

        // Resume from pause
        if (job.state === "PAUSED") {
            job.state = "SENDING";
            console.log(`[TRANSFER] ▶️ Resumed: ${job.fileName} from chunk ${job.sentChunks}/${job.totalChunks}`);
        }

        if (job.state === "IDLE") {
            job.state = "SENDING";
        }

        return true;
    }

    /**
     * Record that a chunk was successfully sent.
     */
    public recordChunk(jobId: string, chunkSize: number): void {
        const job = this.jobs.get(jobId);
        if (!job) return;

        job.sentChunks++;
        const elapsed = (Date.now() - job.startedAt) / 1000;
        job.bytesPerSecond = elapsed > 0 ? (job.sentChunks * chunkSize) / elapsed : 0;

        if (job.sentChunks >= job.totalChunks) {
            job.state = "COMPLETE";
            console.log(`[TRANSFER] ✅ Complete: ${job.fileName} in ${elapsed.toFixed(1)}s`);
        }
    }

    /**
     * ⏸️ PAUSE a transfer.
     */
    public pause(jobId: string): void {
        this.pauseSignals.set(jobId, true);
    }

    /**
     * ▶️ RESUME a paused transfer.
     */
    public resume(jobId: string): void {
        this.pauseSignals.set(jobId, false);
    }

    /**
     * ❌ CANCEL a transfer.
     */
    public cancel(jobId: string): void {
        const job = this.jobs.get(jobId);
        if (job) {
            job.state = "CANCELLED";
            this.pauseSignals.delete(jobId);
            console.log(`[TRANSFER] ❌ Cancelled: ${job.fileName}`);
        }
    }

    /**
     * Get all active jobs.
     */
    public getJobs(): TransferJob[] {
        return Array.from(this.jobs.values());
    }

    /**
     * Get a single job by ID.
     */
    public getJob(jobId: string): TransferJob | undefined {
        return this.jobs.get(jobId);
    }

    /**
     * Calculate progress as a percentage.
     */
    public getProgress(jobId: string): number {
        const job = this.jobs.get(jobId);
        if (!job || job.totalChunks === 0) return 0;
        return Math.round((job.sentChunks / job.totalChunks) * 100);
    }
}

export const transferController = new TransferController();

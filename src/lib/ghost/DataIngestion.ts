/**
 * 📥 DATA INGESTION ENGINE: Auto-Embed Pipeline
 * 
 * 🎓 MISSION: Automatically ingest and embed new data (chat messages,
 * dropped files, contacts) into the VectorGrid for semantic search.
 * 
 * PATTERN: Observer (watches for new data events and auto-indexes)
 */

import { VectorGrid, vectorGrid } from "./VectorGrid";

export interface IngestionSource {
    type: "CHAT_MESSAGE" | "DROPPED_FILE" | "CONTACT" | "ROOM" | "NOTE";
    id: string;
    text: string;
    metadata?: Record<string, unknown>;
}

export class DataIngestionEngine {
    private vectorStore: VectorGrid;
    private ingestionCount: number = 0;
    private isRunning: boolean = false;
    private queue: IngestionSource[] = [];

    constructor(vectorStore: VectorGrid) {
        this.vectorStore = vectorStore;
    }

    /**
     * Start the ingestion engine.
     */
    start(): void {
        this.isRunning = true;
        console.log("[INGEST] 📥 Data Ingestion Engine ONLINE.");
        this.processQueue();
    }

    /**
     * Stop the ingestion engine.
     */
    stop(): void {
        this.isRunning = false;
        console.log("[INGEST] 🛑 Data Ingestion Engine OFFLINE.");
    }

    /**
     * Ingest a single piece of data.
     */
    ingest(source: IngestionSource): void {
        this.queue.push(source);

        if (this.isRunning) {
            this.processQueue();
        }
    }

    /**
     * Batch ingest multiple items.
     */
    ingestBatch(sources: IngestionSource[]): void {
        this.queue.push(...sources);

        if (this.isRunning) {
            this.processQueue();
        }
    }

    /**
     * Process the ingestion queue.
     */
    private processQueue(): void {
        while (this.queue.length > 0) {
            const source = this.queue.shift()!;

            try {
                const vector = VectorGrid.simpleEmbed(source.text);
                this.vectorStore.add(
                    source.id,
                    source.text,
                    vector,
                    {
                        ...source.metadata,
                        sourceType: source.type,
                        ingestedAt: Date.now(),
                    }
                );
                this.ingestionCount++;
            } catch (err) {
                console.error(`[INGEST] ❌ Failed to ingest ${source.id}:`, err);
            }
        }
    }

    /**
     * Auto-ingest a chat message.
     */
    ingestChatMessage(messageId: string, text: string, senderId: string, roomId?: string): void {
        this.ingest({
            type: "CHAT_MESSAGE",
            id: `msg-${messageId}`,
            text,
            metadata: { senderId, roomId },
        });
    }

    /**
     * Auto-ingest a dropped file (by name/metadata).
     */
    ingestFile(fileId: string, fileName: string, fileType: string, size: number): void {
        this.ingest({
            type: "DROPPED_FILE",
            id: `file-${fileId}`,
            text: `${fileName} ${fileType}`,
            metadata: { fileName, fileType, size },
        });
    }

    /**
     * Get ingestion stats.
     */
    getStats() {
        return {
            totalIngested: this.ingestionCount,
            queueLength: this.queue.length,
            vectorStoreSize: this.vectorStore.size(),
            isRunning: this.isRunning,
        };
    }
}

export const dataIngestion = new DataIngestionEngine(vectorGrid);

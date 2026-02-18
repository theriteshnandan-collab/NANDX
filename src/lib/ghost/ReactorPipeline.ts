import { liveQuery } from "dexie";
import { db } from "@/lib/db/NandixDB";
import { vectorEngine } from "./VectorEngine";

/**
 * 🛰️ REACTOR PIPELINE
 * Watches the local database and ingests new data into the Vector Grid.
 */
export class ReactorPipeline {
    private static instance: ReactorPipeline;
    private processedMessageIds: Set<number> = new Set();
    private processedFileIds: Set<number> = new Set();
    private isRunning = false;

    private constructor() { }

    public static getInstance() {
        if (!ReactorPipeline.instance) {
            ReactorPipeline.instance = new ReactorPipeline();
        }
        return ReactorPipeline.instance;
    }

    /**
     * Start the background ingestion pipeline
     */
    public start() {
        if (this.isRunning) return;
        this.isRunning = true;

        console.log("[REACTOR] 🛰️ Pipeline Online. Monitoring local data...");

        // 1. Monitor Chat Messages
        liveQuery(() => db.messages.toArray()).subscribe((messages) => {
            this.pulseMessages(messages);
        });

        // 2. Monitor Dropped Files (Metadata only for now)
        liveQuery(() => db.files.toArray()).subscribe((files) => {
            this.pulseFiles(files);
        });
    }

    /**
     * Process new messages
     */
    private async pulseMessages(messages: any[]) {
        const newMessages = messages.filter(m => !this.processedMessageIds.has(m.id));
        if (newMessages.length === 0) return;

        console.log(`[REACTOR] 📥 Atomizing ${newMessages.length} new messages...`);

        for (const msg of newMessages) {
            if (msg.text && msg.text.length > 10) {
                await vectorEngine.addDocument(msg.text, {
                    type: "chat",
                    sender: msg.sender,
                    timestamp: msg.timestamp
                });
            }
            this.processedMessageIds.add(msg.id);
        }
    }

    /**
     * Process new files
     */
    private async pulseFiles(files: any[]) {
        const newFiles = files.filter(f => !this.processedFileIds.has(f.id));
        if (newFiles.length === 0) return;

        console.log(`[REACTOR] 📥 Ingesting ${newFiles.length} new file metadata entries...`);

        for (const file of newFiles) {
            const context = `File: ${file.name} (Type: ${file.type}, Size: ${file.size} bytes). Sent by ${file.sender}.`;
            await vectorEngine.addDocument(context, {
                type: "file",
                fileId: file.id,
                timestamp: file.timestamp
            });
            this.processedFileIds.add(file.id);
        }
    }
}

export const reactorPipeline = ReactorPipeline.getInstance();

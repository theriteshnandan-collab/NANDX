import { pipeline, env } from "@huggingface/transformers";
import { db } from "@/lib/db/NandixDB";

// Configure transformers for browser environment
env.allowLocalModels = false;
env.useBrowserCache = true;

/**
 * ☢️ THE REACTOR: Vector Engine
 * Handles embedding generation and similarity search.
 */
export class VectorEngine {
    private static instance: VectorEngine;
    private embedder: any = null;
    private index: any = null;
    private isInitializing = false;
    private documents: Map<number, { text: string, metadata: any }> = new Map();

    private constructor() { }

    public static getInstance() {
        if (!VectorEngine.instance) {
            VectorEngine.instance = new VectorEngine();
        }
        return VectorEngine.instance;
    }

    /**
     * Initialize the embedding model and the vector index
     */
    public async initialize() {
        if (this.isInitializing || this.embedder) return;
        this.isInitializing = true;

        try {
            console.log("[REACTOR] ⚡ Initializing Vector Engine...");

            // 1. Initialize Embedder
            this.embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
            console.log("[REACTOR] ✅ Embedder Ready.");

            // 2. Initialize HNSW Index (WASM)
            // Note: In a real browser environment, we'd load the WASM properly.
            // For now, we'll use a dynamic import for hnswlib-wasm.
            const hnswlib = await import("hnswlib-wasm");
            // @ts-ignore
            this.index = new (hnswlib.HierarchicalNSW || hnswlib.default.HierarchicalNSW)("cosine", 384); // all-MiniLM-L6-v2 is 384-dim
            this.index.initIndex(2000); // Initial capacity

            // 3. Load existing index from DB if available
            await this.loadState();

            console.log("[REACTOR] ✅ Vector Grid Online.");
        } catch (error) {
            console.error("[REACTOR] ❌ Initialization Failed:", error);
        } finally {
            this.isInitializing = false;
        }
    }

    /**
     * Generate an embedding for a piece of text
     */
    public async generateEmbedding(text: string): Promise<number[]> {
        if (!this.embedder) await this.initialize();
        const output = await this.embedder(text, { pooling: "mean", normalize: true });
        return Array.from(output.data);
    }

    /**
     * Add a document to the reactor
     */
    public async addDocument(text: string, metadata: any = {}) {
        if (!this.index) await this.initialize();

        const embedding = await this.generateEmbedding(text);
        const id = Date.now() + Math.floor(Math.random() * 1000);

        this.index.addPoint(embedding, id);
        this.documents.set(id, { text, metadata });

        // Save state periodically
        await this.saveState();
    }

    /**
     * Query the reactor for relevant context
     */
    public async query(text: string, topK: number = 5): Promise<Array<{ text: string, metadata: any, score: number }>> {
        if (!this.index) await this.initialize();

        const embedding = await this.generateEmbedding(text);
        const results = this.index.searchKnn(embedding, topK);

        return results.neighbors.map((id: number, index: number) => ({
            ...this.documents.get(id),
            score: results.distances[index]
        })).filter((res: any) => res.text);
    }

    /**
     * Clear the reactor
     */
    public async clear() {
        this.documents.clear();
        if (this.index) {
            // Re-initialize a fresh index
            const hnswlib = await import("hnswlib-wasm");
            // @ts-ignore
            this.index = new (hnswlib.HierarchicalNSW || hnswlib.default.HierarchicalNSW)("cosine", 384);
            this.index.initIndex(2000);
        }
        await this.saveState();
    }

    /**
     * Persistence: Save index and documents to Dexie
     */
    private async saveState() {
        try {
            const state = {
                docs: Array.from(this.documents.entries()),
                // Note: HNSWlib-WASM index serialization depends on the specific build.
                // If it supports it, we'd save the buffer.
            };
            await db.settings.put({ key: "reactor_state", value: JSON.stringify(state) });
        } catch (err) {
            console.warn("[REACTOR] ⚠️ Persistence Failed:", err);
        }
    }

    /**
     * Persistence: Load state from Dexie
     */
    private async loadState() {
        const saved = await db.settings.get("reactor_state");
        if (saved) {
            const state = JSON.parse(saved.value);
            this.documents = new Map(state.docs);
            // In a production app, we would re-insert points into the index here.
        }
    }
}

export const vectorEngine = VectorEngine.getInstance();

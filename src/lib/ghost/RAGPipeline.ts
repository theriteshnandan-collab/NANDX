/**
 * 🔮 RAG PIPELINE: Retrieval-Augmented Generation
 * 
 * 🎓 MISSION: Inject relevant local context from the VectorGrid
 * into GHOST_TASK prompts. This makes the Ghost AI "aware" of your 
 * chat history, files, and contacts without sending anything to the cloud.
 * 
 * PATTERN: Pipeline (Query → Retrieve → Augment → Generate)
 */

import { vectorGrid, VectorGrid } from "./VectorGrid";

export interface RAGContext {
    query: string;
    retrievedChunks: Array<{
        text: string;
        score: number;
        sourceType: string;
    }>;
    augmentedPrompt: string;
}

export class RAGPipeline {
    private vectorStore: VectorGrid;
    private maxContextChunks: number = 5;
    private maxContextLength: number = 2000; // chars

    constructor(vectorStore: VectorGrid) {
        this.vectorStore = vectorStore;
    }

    /**
     * Execute the full RAG pipeline.
     */
    async augment(userQuery: string, systemPrompt: string = ""): Promise<RAGContext> {
        // 1. EMBED the query
        const queryVector = VectorGrid.simpleEmbed(userQuery);

        // 2. RETRIEVE relevant context
        const results = this.vectorStore.search(queryVector, this.maxContextChunks);

        const retrievedChunks = results.map(entry => ({
            text: entry.text,
            score: 0, // Score computed internally
            sourceType: (entry.metadata?.sourceType as string) || "UNKNOWN",
        }));

        // 3. AUGMENT the prompt with context
        let contextBlock = "";
        let charCount = 0;

        for (const chunk of retrievedChunks) {
            if (charCount + chunk.text.length > this.maxContextLength) break;
            contextBlock += `[${chunk.sourceType}]: ${chunk.text}\n`;
            charCount += chunk.text.length;
        }

        const augmentedPrompt = this.buildPrompt(systemPrompt, contextBlock, userQuery);

        return {
            query: userQuery,
            retrievedChunks,
            augmentedPrompt,
        };
    }

    /**
     * Build the final prompt with RAG context injected.
     */
    private buildPrompt(systemPrompt: string, context: string, query: string): string {
        return `${systemPrompt ? systemPrompt + "\n\n" : ""}` +
            `## Relevant Context (from local memory)\n${context || "(No relevant context found)"}\n\n` +
            `## User Query\n${query}`;
    }

    /**
     * Simple "search" without full augmentation (for UI autocomplete).
     */
    quickSearch(query: string, topK: number = 3): string[] {
        const queryVector = VectorGrid.simpleEmbed(query);
        return this.vectorStore.search(queryVector, topK)
            .map(entry => entry.text);
    }

    /**
     * Get pipeline status for telemetry.
     */
    getStats() {
        return {
            vectorStoreSize: this.vectorStore.size(),
            maxContextChunks: this.maxContextChunks,
            maxContextLength: this.maxContextLength,
        };
    }
}

export const ragPipeline = new RAGPipeline(vectorGrid);

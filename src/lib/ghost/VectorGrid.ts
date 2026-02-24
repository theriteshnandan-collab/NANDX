/**
 * 🗺️ VECTOR GRID: Local Semantic Search Engine
 * 
 * 🎓 MISSION: A lightweight, in-browser vector database for 
 * semantic search. Uses cosine similarity on pre-computed embeddings
 * to enable "search by meaning" across chat history, files, and shards.
 * 
 * PATTERN: Repository (stores and retrieves vectors by similarity)
 */

export interface VectorEntry {
    id: string;
    text: string;
    vector: Float32Array;
    metadata: Record<string, unknown>;
    timestamp: number;
}

export class VectorGrid {
    private entries: VectorEntry[] = [];
    private dimensions: number = 384; // MiniLM default

    constructor(dimensions: number = 384) {
        this.dimensions = dimensions;
    }

    /**
     * Add a vector entry to the grid.
     */
    add(id: string, text: string, vector: Float32Array, metadata: Record<string, unknown> = {}): void {
        this.entries.push({
            id,
            text,
            vector,
            metadata,
            timestamp: Date.now(),
        });
    }

    /**
     * Search for the most similar entries to a query vector.
     */
    search(queryVector: Float32Array, topK: number = 5, threshold: number = 0.3): VectorEntry[] {
        const scored = this.entries.map(entry => ({
            entry,
            score: this.cosineSimilarity(queryVector, entry.vector),
        }));

        return scored
            .filter(s => s.score >= threshold)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK)
            .map(s => s.entry);
    }

    /**
     * Cosine similarity between two vectors.
     */
    private cosineSimilarity(a: Float32Array, b: Float32Array): number {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
        return magnitude === 0 ? 0 : dotProduct / magnitude;
    }

    /**
     * Delete an entry by ID.
     */
    delete(id: string): boolean {
        const idx = this.entries.findIndex(e => e.id === id);
        if (idx >= 0) {
            this.entries.splice(idx, 1);
            return true;
        }
        return false;
    }

    /**
     * Get total entries.
     */
    size(): number {
        return this.entries.length;
    }

    /**
     * Get all entries (for export/backup).
     */
    getAll(): VectorEntry[] {
        return [...this.entries];
    }

    /**
     * Clear the entire grid.
     */
    clear(): void {
        this.entries = [];
    }

    /**
     * Generate a simple bag-of-words embedding (fallback when no ML model is available).
     * This is a deterministic hash-based embedding for ultra-fast local indexing.
     */
    static simpleEmbed(text: string, dimensions: number = 384): Float32Array {
        const vector = new Float32Array(dimensions);
        const words = text.toLowerCase().split(/\s+/);

        for (const word of words) {
            for (let i = 0; i < word.length; i++) {
                const idx = (word.charCodeAt(i) * (i + 1) * 31) % dimensions;
                vector[idx] += 1;
            }
        }

        // Normalize
        let norm = 0;
        for (let i = 0; i < dimensions; i++) {
            norm += vector[i] * vector[i];
        }
        norm = Math.sqrt(norm);
        if (norm > 0) {
            for (let i = 0; i < dimensions; i++) {
                vector[i] /= norm;
            }
        }

        return vector;
    }
}

export const vectorGrid = new VectorGrid();

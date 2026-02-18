import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VectorEngine } from './VectorEngine';

// Mock DB and HNSWlib if necessary, but we'll try to run a real test 
// if the environment allows. Since we are in an agentic mode, 
// we'll assume vitest can handle the imports.

describe('VectorEngine Test Suite', () => {
    let engine: VectorEngine;

    beforeEach(() => {
        engine = VectorEngine.getInstance();
    });

    it('should initialize and generate embeddings', async () => {
        // This might take time as it downloads the model
        const text = "Hello NANDIX";
        const embedding = await engine.generateEmbedding(text);

        expect(embedding).toBeDefined();
        expect(embedding.length).toBe(384);
        expect(typeof embedding[0]).toBe('number');
    });

    it('should perform similarity search', async () => {
        await engine.addDocument("The password to the reactor is 42", { secret: true });
        await engine.addDocument("Today the weather is sunny", { weather: true });

        const results = await engine.query("What is the reactor password?");

        expect(results.length).toBeGreaterThan(0);
        expect(results[0].text).toContain("42");
        expect(results[0].metadata.secret).toBe(true);
    });

    it('should clear data', async () => {
        await engine.addDocument("Temp data");
        await engine.clear();
        const results = await engine.query("Temp data");
        expect(results.length).toBe(0);
    });
});

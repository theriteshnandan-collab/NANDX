/**
 * 🧠 DISTRIBUTED INFERENCE ENGINE: Split-Model Execution
 * 
 * 🎓 MISSION: Distribute large AI model inference across multiple 
 * Nandix nodes in the mesh, Petals-style. Each node runs a subset 
 * of the model's layers, passing intermediate activations via 
 * the GREEN wire.
 * 
 * PATTERN: Pipeline (each node is a stage in the inference pipeline)
 */

export type InferenceStage = "TOKENIZE" | "EMBED" | "TRANSFORM" | "DECODE" | "COMPLETE";

export interface InferenceChunk {
    taskId: string;
    stage: InferenceStage;
    layerRange: [number, number]; // e.g. [0, 11] for layers 0-11
    activations: Float32Array | null;
    prompt?: string;
    result?: string;
}

export interface InferenceNode {
    peerId: string;
    assignedLayers: [number, number];
    status: "IDLE" | "COMPUTING" | "DONE" | "ERROR";
    computeTimeMs: number;
}

export class DistributedInference {
    private nodes: Map<string, InferenceNode> = new Map();
    private totalLayers: number = 32; // Default for a 7B model

    /**
     * Register a node as part of the inference pipeline.
     */
    registerNode(peerId: string, layerRange: [number, number]): void {
        this.nodes.set(peerId, {
            peerId,
            assignedLayers: layerRange,
            status: "IDLE",
            computeTimeMs: 0,
        });
        console.log(`[INFERENCE] 🧠 Node registered: ${peerId.substring(0, 8)} → Layers ${layerRange[0]}-${layerRange[1]}`);
    }

    /**
     * Plan the distribution of layers across available nodes.
     */
    planDistribution(peerIds: string[]): void {
        const layersPerNode = Math.ceil(this.totalLayers / peerIds.length);

        peerIds.forEach((peerId, i) => {
            const start = i * layersPerNode;
            const end = Math.min(start + layersPerNode - 1, this.totalLayers - 1);
            this.registerNode(peerId, [start, end]);
        });

        console.log(`[INFERENCE] 📊 Distributed ${this.totalLayers} layers across ${peerIds.length} nodes.`);
    }

    /**
     * Create an initial inference task.
     */
    createTask(prompt: string): InferenceChunk {
        return {
            taskId: `inf-${Date.now()}`,
            stage: "TOKENIZE",
            layerRange: [0, 0],
            activations: null,
            prompt,
        };
    }

    /**
     * Get the next node in the pipeline.
     */
    getNextNode(currentLayerEnd: number): InferenceNode | null {
        for (const node of this.nodes.values()) {
            if (node.assignedLayers[0] === currentLayerEnd + 1 && node.status === "IDLE") {
                return node;
            }
        }
        return null;
    }

    /**
     * Mark a node's computation as complete.
     */
    completeNode(peerId: string, computeTimeMs: number): void {
        const node = this.nodes.get(peerId);
        if (node) {
            node.status = "DONE";
            node.computeTimeMs = computeTimeMs;
        }
    }

    /**
     * Get pipeline status for telemetry.
     */
    getStatus(): { nodes: InferenceNode[]; totalLayers: number } {
        return {
            nodes: Array.from(this.nodes.values()),
            totalLayers: this.totalLayers,
        };
    }

    /**
     * Reset all nodes to IDLE for next inference.
     */
    reset(): void {
        this.nodes.forEach((node) => {
            node.status = "IDLE";
            node.computeTimeMs = 0;
        });
    }
}

export const distributedInference = new DistributedInference();

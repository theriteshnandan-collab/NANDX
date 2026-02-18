import { Wllama, WllamaConfig } from '@wllama/wllama';
import { mesh, NandixPacket } from '../p2p/NandixMesh';
import { BinaryProtocol } from '../p2p/BinaryProtocol';

/**
 * 👻 GHOST ENGINE (CPU EDITION)
 * 
 * The Sovereign Intelligence running purely on CPU via WebAssembly.
 * Powered by @wllama/wllama and Phi-3-Mini.
 */

// Configuration for the model
const MODEL_CONFIG = {
    // Phi-3-Mini-4k-Instruct (Quantized for CPU efficiency)
    url: "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf",
    // We need to split the model if it's too large for github pages, but here we likely pull from HF directly.
    // However, wllama usually expects a list of paths if split. This url is a single file.
};

export interface GhostStatus {
    state: "OFFLINE" | "DOWNLOADING" | "BOOTING" | "IDLE" | "THINKING" | "ERROR";
    progress?: number; // 0-100
    currentTask?: string;
    tps?: number; // Tokens per second
}

type GhostObserver = (status: GhostStatus) => void;

class GhostEngine {
    private static instance: GhostEngine;
    private wllama: Wllama | null = null;
    private status: GhostStatus = { state: "OFFLINE" };
    private observers: Set<GhostObserver> = new Set();

    // Limits
    private readonly MAX_TOKENS = 512;

    private constructor() { }

    public static getInstance(): GhostEngine {
        if (!GhostEngine.instance) {
            GhostEngine.instance = new GhostEngine();
        }
        return GhostEngine.instance;
    }

    public subscribe(observer: GhostObserver) {
        this.observers.add(observer);
        observer(this.status); // Initial state
        return () => this.observers.delete(observer);
    }

    private updateStatus(newStatus: Partial<GhostStatus>) {
        this.status = { ...this.status, ...newStatus };
        this.observers.forEach(obs => obs(this.status));
    }

    /**
     * Ignite the Ghost Core
     */
    public async initialize() {
        if (this.status.state !== "OFFLINE" && this.status.state !== "ERROR") return;

        try {
            console.log("[GHOST] 🕯️ Igniting Core...");
            this.updateStatus({ state: "BOOTING", progress: 0 });

            // Initialize Wllama
            // We need to provide the path to the wllama.wasm files
            // Usually these are copied to public/ directory during build.
            // For dev, we might need a workaround or ensure they are served.
            // Assuming standard setup:
            // Wllama assets configuration
            const assets: any = {
                "single-thread/wllama.wasm": "/wllama/single-thread/wllama.wasm",
                "multi-thread/wllama.wasm": "/wllama/multi-thread/wllama.wasm",
                "multi-thread/wllama.worker.mjs": "/wllama/multi-thread/wllama.worker.mjs",
            };

            this.wllama = new Wllama(assets);

            console.log("[GHOST] 📥 Downloading Model (Phi-3-Mini)...");
            this.updateStatus({ state: "DOWNLOADING", progress: 0 });

            const modelUrl = MODEL_CONFIG.url;

            await this.wllama.loadModelFromUrl(modelUrl, {
                n_threads: navigator.hardwareConcurrency || 4, // Use all cores
                progressCallback: ({ loaded, total }) => {
                    const progress = Math.round((loaded / total) * 100);
                    this.updateStatus({ state: "DOWNLOADING", progress });
                }
            });

            console.log("[GHOST] 🧠 Model Loaded into Memory");
            this.updateStatus({ state: "IDLE", progress: 100 });

        } catch (error: any) {
            console.error("[GHOST] 💀 Ignition Failed:", error);
            this.updateStatus({ state: "ERROR", currentTask: error.message });
        }
    }

    /**
     * Generate thoughts (Inference)
     */
    public async generate(prompt: string, onToken?: (token: string) => void): Promise<string> {
        if (!this.wllama || this.status.state !== "IDLE") {
            throw new Error("Ghost is not ready.");
        }

        this.updateStatus({ state: "THINKING", currentTask: "Processing..." });
        let fullResponse = "";
        let startTime = performance.now();
        let tokenCount = 0;

        try {
            // ☢️ REACTOR: Retrieve context for the prompt
            console.log(`[GHOST] ☢️ Querying Reactor for: "${prompt.substring(0, 30)}..."`);
            const contextResults = await import("./VectorEngine").then(m => m.vectorEngine.query(prompt));

            let contextBlock = "";
            if (contextResults.length > 0) {
                contextBlock = "\n[SOVEREIGN CONTEXT]\n" +
                    contextResults.map(r => `- ${r.text}`).join("\n") +
                    "\n[/SOVEREIGN CONTEXT]\n";
                console.log(`[GHOST] 📖 Injected ${contextResults.length} context shards.`);
            }

            // Phi-3 Prompt Format with injected context
            const systemPrompt = `You are GHOST, the Sovereign Intelligence of NANDIX OS. Use the provided context if relevant.${contextBlock}`;
            const formattedPrompt = `<|system|>\n${systemPrompt}<|end|>\n<|user|>\n${prompt}<|end|>\n<|assistant|>\n`;

            await this.wllama.createCompletion(formattedPrompt, {
                nPredict: this.MAX_TOKENS,
                sampling: {
                    temp: 0.7,
                    top_k: 40,
                    top_p: 0.9,
                },
                onNewToken: (token, piece, currentText) => {
                    tokenCount++;
                    // Decode piece if it's bytes
                    const tokenStr = typeof piece === "string" ? piece : new TextDecoder().decode(piece);
                    fullResponse += tokenStr;
                    if (onToken) onToken(tokenStr);

                    // Update TPS stats every 10 tokens
                    if (tokenCount % 10 === 0) {
                        const elapsedSec = (performance.now() - startTime) / 1000;
                        const tps = Math.round(tokenCount / elapsedSec);
                        this.updateStatus({ tps });
                    }
                }
            });

            const elapsedSec = (performance.now() - startTime) / 1000;
            const finalTps = Math.round(tokenCount / elapsedSec);
            console.log(`[GHOST] ✨ Thought Complete. ${tokenCount} tokens in ${elapsedSec.toFixed(1)}s (${finalTps} T/s)`);

            this.updateStatus({ state: "IDLE", tps: finalTps });
            return fullResponse;

        } catch (error: any) {
            console.error("[GHOST] 💥 Inference Error:", error);
            this.updateStatus({ state: "ERROR", currentTask: error.message });
            return "Error: " + error.message;
        }
    }

    /**
     * 🛰️ Enable Remote Control via Mesh
     */
    public enableMeshControl() {
        console.log("[GHOST] 📡 Mesh Control Activated. Listening for commands...");
        return mesh.setPacketListener(async (packet: NandixPacket) => {
            if (packet.type === "GHOST_CMD") {
                const { prompt, id: cmdId } = packet.payload;
                console.log(`[GHOST] 📥 Remote Command Received: ${cmdId}`);

                try {
                    await this.generate(prompt, (token) => {
                        // Stream Token back to mesh
                        mesh.send("RED", {
                            cmdId,
                            token,
                            tps: this.status.tps,
                            done: false
                        }, "GHOST_RESP");
                    });

                    // Finalize
                    mesh.send("RED", {
                        cmdId,
                        token: "",
                        tps: this.status.tps,
                        done: true
                    }, "GHOST_RESP");

                } catch (err: any) {
                    mesh.send("RED", {
                        cmdId,
                        error: err.message,
                        done: true
                    }, "GHOST_RESP");
                }
            }
        });
    }

    /**
     * Shut down the core to free memory
     */
    public async terminate() {
        if (this.wllama) {
            await this.wllama.exit();
            this.wllama = null;
            this.updateStatus({ state: "OFFLINE" });
        }
    }
}

export const ghostEngine = GhostEngine.getInstance();

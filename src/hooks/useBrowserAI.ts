"use client";

import { useState, useRef, useCallback } from "react";

type AIStatus = "idle" | "loading-model" | "running" | "ready" | "error";

interface BrowserAIResult {
    summarize: (text: string) => Promise<string>;
    status: AIStatus;
    progress: number; // 0-100 model download progress
}

/**
 * useBrowserAI — Runs Transformers.js models completely IN-BROWSER.
 *
 * Zero server. Zero API key. Zero charges. Fully sovereign.
 * Model downloads once (~90MB), cached in browser storage forever.
 *
 * Uses: Xenova/distilbart-cnn-6-6 (summarization)
 */
export function useBrowserAI(): BrowserAIResult {
    const [status, setStatus] = useState<AIStatus>("idle");
    const [progress, setProgress] = useState(0);
    const pipelineRef = useRef<any>(null);
    const loadingRef = useRef(false);

    const loadPipeline = useCallback(async () => {
        if (pipelineRef.current || loadingRef.current) return pipelineRef.current;

        loadingRef.current = true;
        setStatus("loading-model");
        setProgress(0);

        try {
            // Dynamic import — only loads when first used, not on app boot
            const { pipeline, env } = await import("@huggingface/transformers");

            // Use browser cache (OPFS) — model persists between sessions
            env.useBrowserCache = true;
            env.allowLocalModels = false;

            // Small, fast summarization model — DistilBART CNN (~90MB)
            pipelineRef.current = await pipeline(
                "summarization",
                "Xenova/distilbart-cnn-6-6",
                {
                    progress_callback: (p: any) => {
                        if (p.status === "downloading") {
                            const pct = Math.round((p.loaded / p.total) * 100);
                            setProgress(pct);
                        }
                    },
                }
            );

            setStatus("ready");
            setProgress(100);
            return pipelineRef.current;
        } catch (err) {
            console.error("[BrowserAI] Failed to load pipeline:", err);
            setStatus("error");
            loadingRef.current = false;
            return null;
        }
    }, []);

    const summarize = useCallback(async (text: string): Promise<string> => {
        if (!text.trim()) return text;

        try {
            setStatus("running");

            // Ensure pipeline is loaded
            const pipe = pipelineRef.current || await loadPipeline();

            if (!pipe) {
                // Fallback: word excerpt
                return text.trim().split(/\s+/).slice(0, 20).join(" ") + "…";
            }

            const result = await pipe(text.slice(0, 1024), {
                max_new_tokens: 60,
                min_new_tokens: 10,
            });

            setStatus("ready");

            const summary = Array.isArray(result)
                ? result[0]?.summary_text
                : (result as any)?.summary_text;

            return summary?.trim() || text.slice(0, 100) + "…";

        } catch (err) {
            console.error("[BrowserAI] Summarization failed:", err);
            setStatus("error");
            return text.trim().split(/\s+/).slice(0, 20).join(" ") + "…";
        }
    }, [loadPipeline]);

    return { summarize, status, progress };
}

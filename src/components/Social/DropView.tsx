"use client";

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Zap, Share2, Upload } from "lucide-react";
import { mesh } from "@/lib/p2p/NandixMesh";

/* ══════════════════════════════════════════════════════════════
   DROP VIEW (Wormhole) — Billion Dollar Design
   Void + Teal. Card classes. Typography tokens.
══════════════════════════════════════════════════════════════ */

interface DropViewProps {
    streamProgress: { percent: number; file: string };
}

export function DropView({ streamProgress }: DropViewProps) {
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            mesh.streamFile(file);
        }
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            mesh.streamFile(file);
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-6 h-full w-full max-w-3xl mx-auto"
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none rounded-full"
                style={{ background: "radial-gradient(circle, rgba(0,217,165,0.03) 0%, transparent 70%)" }} />

            <div className="text-center mb-12 relative z-10">
                <div className="eyebrow flex items-center justify-center gap-2 mb-4">
                    <Database className="w-4 h-4" style={{ color: "var(--teal)" }} /> Local Storage Only
                </div>
                <h2 className="display-md mb-3 text-white">Direct Transfer</h2>
                <p className="text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed text-[15px]">
                    Drop any file up to infinite size. Sent securely via WebRTC data streams directly to active peers in your mesh. No servers.
                </p>
            </div>

            <div className="relative z-10 w-full max-w-xl">
                <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="relative flex flex-col items-center justify-center w-full h-80 rounded-[2rem] cursor-pointer transition-all overflow-hidden group border border-[var(--bg-border)] bg-[var(--bg-surface)] hover:border-[var(--teal-border)]"
                >
                    <input type="file" className="hidden" onChange={handleChange} />

                    <div className="absolute inset-0 bg-[var(--teal-glow)] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

                    <div className="relative flex flex-col items-center justify-center z-10">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,217,165,0.2)]"
                            style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}>
                            <Upload className="w-8 h-8 text-[var(--teal)]" />
                        </div>

                        <p className="text-white font-medium text-[16px] mb-2">Click or drag file to transmit</p>
                        <p className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-widest">
                            {streamProgress.percent > 0 ? "Transmission in progress..." : "No limits • P2P Encrypted"}
                        </p>
                    </div>

                    {/* Animated grid lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>

                    <AnimatePresence>
                        {streamProgress.percent > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="absolute bottom-6 left-6 right-6"
                            >
                                <div className="card-elevated p-4 w-full">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-teal animate-pulse" />
                                            <span className="text-[13px] font-medium text-white truncate max-w-[200px]">
                                                {streamProgress.file}
                                            </span>
                                        </div>
                                        <span className="font-mono font-bold text-[12px] text-teal">
                                            {streamProgress.percent}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-[var(--bg-border)] overflow-hidden">
                                        <motion.div
                                            animate={{ width: `${streamProgress.percent}%` }}
                                            className="h-full bg-teal"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </label>
            </div>
            <div className="mt-8 flex items-center gap-6 label-data text-center relative z-10 w-full justify-center opacity-60">
                <span className="flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> P2P Transmision</span>
                <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> Zero Server Storage</span>
            </div>
        </motion.div>
    );
}

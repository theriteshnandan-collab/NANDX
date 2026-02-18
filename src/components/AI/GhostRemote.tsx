"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Zap, Send, Smartphone, Laptop, Loader2, Sparkles, X } from "lucide-react";
import { mesh, NandixPacket } from "@/lib/p2p/NandixMesh";

interface GhostRemoteProps {
    onClose: () => void;
}

export const GhostRemote: React.FC<GhostRemoteProps> = ({ onClose }) => {
    const [input, setInput] = useState("");
    const [stream, setStream] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [workerId, setWorkerId] = useState<string | null>(null);
    const [tps, setTps] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Track original command ID to filter responses
    const currentCmdId = useRef<string | null>(null);

    useEffect(() => {
        // 1. Listen for Worker responses
        const listener = (packet: NandixPacket) => {
            if (packet.type === "GHOST_RESP") {
                const { cmdId, token, tps: workerTps, done, error: workerErr } = packet.payload;

                if (cmdId !== currentCmdId.current) return;

                if (workerErr) {
                    setError(workerErr);
                    setIsThinking(false);
                    return;
                }

                if (token) {
                    setStream(prev => prev + token);
                }

                if (workerTps) setTps(workerTps);

                if (done) {
                    setIsThinking(false);
                    currentCmdId.current = null;
                }
            }
        };

        mesh.setPacketListener(listener);

        // 2. Discover Workers (Peers)
        // For now, we assume the first connected peer with "laptop" in ID or just any peer is a potential worker.
        // In a real Hive Mind, we'd have a GHOST_HEARTBEAT.
        const peers = Array.from(mesh.getConnectedPeers());
        if (peers.length > 0) {
            setWorkerId(peers[0]);
        }

        return () => {
            // Restore default listener if needed, but mesh might already handle multiple?
            // Actually NandixMesh.setPacketListener overwrites. We should fix that later.
        };
    }, []);

    const handleSend = () => {
        if (!input.trim() || !workerId || isThinking) return;

        const cmdId = Math.random().toString(36).substring(7);
        currentCmdId.current = cmdId;
        setStream("");
        setError(null);
        setIsThinking(true);

        mesh.send("RED", {
            id: cmdId,
            prompt: input.trim()
        }, "GHOST_CMD");

        setInput("");
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col h-[80vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/[0.03] flex items-center justify-between bg-zinc-900/40">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                                The Sceptre <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                            </h2>
                            <p className="text-[10px] text-zinc-500 font-mono">
                                Remote Command Node · {workerId ? `Linked to ${workerId.substring(0, 8)}` : "Searching for Worker..."}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Worker Status Shard */}
                <div className="px-8 py-4 bg-zinc-900/20 border-b border-white/[0.03] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Laptop className="w-3 h-3 text-emerald-500" />
                            <span className="text-[9px] font-black tracking-widest text-emerald-500 uppercase">Worker Online</span>
                        </div>
                        {tps > 0 && (
                            <div className="flex items-center gap-2">
                                <Cpu className="w-3 h-3 text-cyan-400" />
                                <span className="text-[9px] font-mono text-cyan-400">{tps} T/s</span>
                            </div>
                        )}
                    </div>
                    {isThinking && (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
                            <span className="text-[9px] font-black tracking-widest text-amber-400 uppercase">Thinking...</span>
                        </div>
                    )}
                </div>

                {/* Thought Stream */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-[12px] font-mono">
                            ⚠️ GHOST_ERROR: {error}
                        </div>
                    )}

                    {!stream && !isThinking && !error && (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4">
                            <Sparkles className="w-12 h-12 text-zinc-500" />
                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-center">
                                Awaiting Pulse<br />
                                <span className="text-[8px] font-mono tracking-widest mt-2 block">Command your remote CPU</span>
                            </p>
                        </div>
                    )}

                    {stream && (
                        <div className="text-[15px] leading-relaxed text-zinc-300 font-medium tracking-tight whitespace-pre-wrap selection:bg-violet-500/30">
                            {stream}
                            {isThinking && <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="inline-block w-2 h-4 bg-violet-500 ml-1"
                            />}
                        </div>
                    )}
                </div>

                {/* Pulse Input */}
                <div className="p-6 md:p-8 bg-zinc-900/40 border-t border-white/[0.03]">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                        <div className="relative flex items-center gap-4 bg-zinc-950 border border-white/10 rounded-2xl p-4 group-focus-within:border-violet-500/40 transition-all">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Manifest a remote thought..."
                                className="flex-1 bg-transparent border-none outline-none text-[14px] text-zinc-200 placeholder-zinc-700"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isThinking || !workerId || !input.trim()}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isThinking || !workerId || !input.trim()
                                        ? 'bg-zinc-900 text-zinc-700'
                                        : 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-90'
                                    }`}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

import React, { useEffect, useState, useRef } from "react";
import { GhostStatus, ghostEngine } from "@/lib/ghost/GhostEngineCPU";
import { X, Cpu, Terminal, Zap, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   GHOST TERMINAL — Billion Dollar Design
   Void + Teal. Card classes. Typography tokens. Local AI interface.
══════════════════════════════════════════════════════════════ */

export function GhostTerminal({ onClose }: { onClose: () => void }) {
    const [status, setStatus] = useState<GhostStatus>({ state: "OFFLINE" });
    const [logs, setLogs] = useState<string[]>(["[SYSTEM] Ghost protocol initialized..."]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = ghostEngine.subscribe((newStatus) => {
            setStatus(newStatus);
        });
        return () => { unsubscribe(); };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const handleInitialize = async () => {
        addLog("[CMD] Ignite Sovereign Core...");
        await ghostEngine.initialize();
    };

    const handleSend = async () => {
        if (!input.trim() || status.state !== "IDLE") return;

        const prompt = input;
        setInput("");
        addLog(`[USER] ${prompt}`);

        try {
            let buffer = "";
            await ghostEngine.generate(prompt, (token) => {
                buffer += token;
                setLogs(prev => {
                    const newLogs = [...prev];
                    if (newLogs[newLogs.length - 1].startsWith("[GHOST]")) {
                        newLogs[newLogs.length - 1] = `[GHOST] ${buffer}`;
                        return newLogs;
                    } else {
                        return [...newLogs, `[GHOST] ${buffer}`];
                    }
                });
            });
            addLog(`[SYSTEM] Generation Complete. (${status.tps || 0} T/s)`);
        } catch (e: any) {
            addLog(`[ERROR] ${e.message}`);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0F]/90 backdrop-blur-md p-4 animate-in fade-in duration-300 font-inter">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-3xl h-[650px] card-elevated flex flex-col overflow-hidden relative"
                style={{ border: "1px solid var(--teal-border)", boxShadow: "0 0 40px rgba(0,217,165,0.05)" }}
            >
                {/* ── HEADER ── */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--teal-border)] bg-[rgba(0,217,165,0.02)]">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-4 h-4 text-teal" />
                        <span className="font-display font-bold text-teal tracking-[0.1em] uppercase text-sm">Ghost Core // Local Node</span>
                        <div className="flex items-center gap-1.5 ml-4">
                            <div className={`w-1.5 h-1.5 rounded-full ${status.state === "IDLE" ? "bg-teal shadow-[0_0_8px_rgba(0,217,165,1)]" :
                                status.state === "THINKING" ? "bg-teal animate-pulse shadow-[0_0_8px_rgba(0,217,165,1)]" :
                                    status.state === "DOWNLOADING" ? "bg-[var(--text-secondary)] animate-pulse" :
                                        status.state === "ERROR" ? "bg-red-500" : "bg-[var(--text-muted)]"
                                }`} />
                            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-secondary)]">
                                {status.state}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-ghost !p-1.5 opacity-50 hover:opacity-100 hover:text-teal">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ── TERMINAL VIEW ── */}
                <div className="flex-1 p-5 overflow-y-auto space-y-3 font-mono text-[13px] leading-relaxed no-scrollbar bg-[#050508]">

                    {status.state === "OFFLINE" && (
                        <div className="flex flex-col items-center justify-center h-full gap-5 opacity-80">
                            <Cpu className="w-12 h-12 text-[var(--text-muted)]" />
                            <div className="text-center">
                                <p className="font-display font-medium text-white text-lg mb-1">Local Intelligence Offline</p>
                                <p className="label-data !m-0">The Sovereign CPU requires ignition.</p>
                            </div>
                            <button onClick={handleInitialize} className="btn-outline mt-2 border-[var(--teal-border)] text-teal hover:bg-[rgba(0,217,165,0.1)]">
                                <Zap className="w-4 h-4" />
                                <span className="label-data !m-0 !text-teal">Ignite Ghost Core</span>
                            </button>
                        </div>
                    )}

                    {status.state === "DOWNLOADING" && (
                        <div className="flex flex-col items-center justify-center h-full gap-5">
                            <Loader2 className="w-8 h-8 text-teal animate-spin" />
                            <div className="text-center">
                                <p className="font-medium text-white text-[14px]">Syncing Neural Weights</p>
                                <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-1 uppercase tracking-widest">{status.progress}% Complete</p>
                            </div>
                            <div className="w-64 h-1.5 bg-[var(--bg-border)] rounded-full overflow-hidden">
                                <div className="h-full bg-teal transition-all duration-300" style={{ width: `${status.progress || 0}%` }} />
                            </div>
                        </div>
                    )}

                    {(status.state === "IDLE" || status.state === "THINKING" || status.state === "BOOTING") && logs.map((log, i) => (
                        <div key={i} className={`break-words transition-colors ${log.startsWith("[USER]") ? "text-white font-medium" :
                            log.startsWith("[GHOST]") ? "text-teal" :
                                log.startsWith("[ERROR]") ? "text-red-400" :
                                    "text-[var(--text-secondary)]"
                            }`}>
                            {log}
                        </div>
                    ))}

                    {status.state === "THINKING" && (
                        <div className="flex items-center gap-2 text-teal opacity-50 mt-2">
                            <span className="w-1.5 h-1.5 bg-teal animate-bounce rounded-full" />
                            <span className="w-1.5 h-1.5 bg-teal animate-bounce rounded-full" style={{ animationDelay: "150px" }} />
                            <span className="w-1.5 h-1.5 bg-teal animate-bounce rounded-full" style={{ animationDelay: "300px" }} />
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* ── INPUT ── */}
                <div className="p-4 border-t border-[var(--bg-border)] bg-[var(--bg-elevated)] flex gap-3 items-center relative z-10">
                    <span className="text-teal font-mono font-bold">{">"}</span>
                    <input
                        className="flex-1 bg-transparent border-none outline-none text-white font-mono text-[14px] placeholder-[var(--text-muted)] h-full"
                        placeholder={status.state === "IDLE" ? "Command the ghost..." : "System processing..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={status.state !== "IDLE"}
                        autoFocus
                    />
                    <div className="font-mono text-[10px] text-teal font-bold tracking-widest opacity-50">
                        {status.tps ? `${status.tps} T/s` : status.state === "IDLE" ? "SYS_READY" : "LOCKED"}
                    </div>
                </div>
            </motion.div >
        </div >
    );
}

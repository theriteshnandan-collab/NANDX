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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-3xl p-4 animate-in fade-in duration-500 font-inter">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-3xl h-[650px] bg-white/80 backdrop-blur-2xl flex flex-col overflow-hidden relative rounded-[2rem] shadow-2xl border border-black/5"
            >
                <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: "linear-gradient(90deg, transparent, var(--violet-glow), transparent)" }} />
                {/* ── HEADER ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.03] bg-slate-50">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-4 h-4 text-blue-600" />
                        <span className="font-display font-black text-slate-900 tracking-[0.15em] uppercase text-xs">Ghost Core // Sovereign Local Node</span>
                        <div className="flex items-center gap-2 ml-6">
                            <div className={`w-2 h-2 rounded-full ${status.state === "IDLE" ? "bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,1)]" :
                                status.state === "THINKING" ? "bg-blue-600 animate-pulse shadow-[0_0_12px_rgba(37,99,235,1)]" :
                                    status.state === "DOWNLOADING" ? "bg-slate-300 animate-pulse" :
                                        status.state === "ERROR" ? "bg-rose-500" : "bg-slate-200"
                                }`} />
                            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                {status.state}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-ghost !p-1.5 opacity-50 hover:opacity-100 hover:text-teal">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ── TERMINAL VIEW ── */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 font-mono text-[13px] leading-relaxed no-scrollbar bg-slate-50/50">

                    {status.state === "OFFLINE" && (
                        <div className="flex flex-col items-center justify-center h-full gap-5 opacity-80">
                            <Cpu className="w-12 h-12 text-slate-300" />
                            <div className="text-center">
                                <p className="font-display font-black text-slate-900 text-lg mb-1">Local Intelligence Offline</p>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">The Sovereign CPU requires ignition.</p>
                            </div>
                            <button onClick={handleInitialize} className="btn-outline mt-2 border-[var(--teal-border)] text-teal hover:bg-[rgba(0,217,165,0.1)]">
                                <Zap className="w-4 h-4" />
                                <span className="label-data !m-0 !text-teal">Ignite Ghost Core</span>
                            </button>
                        </div>
                    )}

                    {status.state === "DOWNLOADING" && (
                        <div className="flex flex-col items-center justify-center h-full gap-5">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <div className="text-center">
                                <p className="font-black text-slate-900 text-[14px] uppercase tracking-tight">Syncing Neural Weights</p>
                                <p className="font-mono text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">{status.progress}% Complete</p>
                            </div>
                            <div className="w-64 h-1.5 bg-[var(--bg-border)] rounded-full overflow-hidden">
                                <div className="h-full bg-teal transition-all duration-300" style={{ width: `${status.progress || 0}%` }} />
                            </div>
                        </div>
                    )}

                    {(status.state === "IDLE" || status.state === "THINKING" || status.state === "BOOTING") && logs.map((log, i) => (
                        <div key={i} className={`break-words transition-colors ${log.startsWith("[USER]") ? "text-slate-900 font-bold" :
                            log.startsWith("[GHOST]") ? "text-blue-600 font-medium" :
                                log.startsWith("[ERROR]") ? "text-rose-500" :
                                    "text-slate-400"
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
                <div className="p-4 border-t border-black/[0.03] bg-slate-50 flex gap-4 items-center relative z-10">
                    <span className="text-blue-600 font-mono font-bold ml-2">λ</span>
                    <input
                        className="flex-1 bg-transparent border-none outline-none text-slate-900 font-mono text-[14px] placeholder-slate-300 h-full"
                        placeholder={status.state === "IDLE" ? "Command the ghost..." : "System processing..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={status.state !== "IDLE"}
                        autoFocus
                    />
                    <div className="font-mono text-[10px] text-blue-600 font-bold tracking-widest opacity-50">
                        {status.tps ? `${status.tps} T/s` : status.state === "IDLE" ? "SYS_READY" : "LOCKED"}
                    </div>
                </div>
            </motion.div >
        </div >
    );
}

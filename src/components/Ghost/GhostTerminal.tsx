import React, { useEffect, useState, useRef } from "react";
import { GhostStatus, ghostEngine } from "@/lib/ghost/GhostEngineCPU";

/**
 * 👻 GHOST TERMINAL
 * 
 * Matrix-style interface to interact with the Sovereign CPU Core.
 */
export function GhostTerminal({ onClose }: { onClose: () => void }) {
    const [status, setStatus] = useState<GhostStatus>({ state: "OFFLINE" });
    const [logs, setLogs] = useState<string[]>(["[SYSTEM] Ghost Terminal v1.0 initialized..."]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = ghostEngine.subscribe((newStatus) => {
            setStatus(newStatus);
            if (newStatus.currentTask) {
                // Optional: add to logs if it's a new task
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const handleInitialize = async () => {
        addLog("[CMD] Ignite Core...");
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
                // Just update the last log entry with the growing buffer
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
            // Finalize
            addLog(`[SYSTEM] Generation Complete. (${status.tps || 0} T/s)`);
        } catch (e: any) {
            addLog(`[ERROR] ${e.message}`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl h-[600px] bg-black border border-emerald-500/30 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.1)] flex flex-col font-mono text-sm overflow-hidden relative">

                {/* HEADER */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/20 bg-emerald-900/10">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status.state === "IDLE" ? "bg-emerald-500 animate-pulse" :
                                status.state === "THINKING" ? "bg-cyan-500 animate-ping" :
                                    status.state === "ERROR" ? "bg-red-500" : "bg-zinc-500"
                            }`} />
                        <span className="text-emerald-500 font-bold tracking-widest">GHOST CORE // CPU</span>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
                </div>

                {/* MATRIX VIEW */}
                <div className="flex-1 p-4 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
                    {/* Welcome Message */}
                    {status.state === "OFFLINE" && (
                        <div className="flex flex-col items-center justify-center h-full text-emerald-500/50 gap-4">
                            <div className="text-4xl">👻</div>
                            <p>Sovereign Intelligence Offline</p>
                            <button
                                onClick={handleInitialize}
                                className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-400 rounded transition-all"
                            >
                                IGNITE GHOST
                            </button>
                        </div>
                    )}

                    {/* Downloading Progress */}
                    {status.state === "DOWNLOADING" && (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="text-cyan-500 animate-spin text-2xl">⟳</div>
                            <div className="text-cyan-500">Downloading Neural Weights...</div>
                            <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 transition-all duration-300"
                                    style={{ width: `${status.progress || 0}%` }}
                                />
                            </div>
                            <div className="text-xs text-zinc-500">{status.progress}%</div>
                        </div>
                    )}

                    {/* Logs */}
                    {(status.state === "IDLE" || status.state === "THINKING" || status.state === "BOOTING") && logs.map((log, i) => (
                        <div key={i} className={`break-words ${log.startsWith("[USER]") ? "text-white" :
                                log.startsWith("[GHOST]") ? "text-cyan-400" :
                                    log.startsWith("[ERROR]") ? "text-red-500" :
                                        "text-emerald-500/60"
                            }`}>
                            {log}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* FOOTER / INPUT */}
                {status.state === "IDLE" && (
                    <div className="p-3 bg-zinc-900/50 border-t border-emerald-500/20 flex gap-2">
                        <span className="text-emerald-500">{">"}</span>
                        <input
                            className="flex-1 bg-transparent border-none outline-none text-emerald-100 placeholder-emerald-500/20"
                            placeholder="Ask the Ghost..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            autoFocus
                        />
                        <div className="text-xs text-emerald-500/30 self-center">
                            {status.tps ? `${status.tps} T/s` : "READY"}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

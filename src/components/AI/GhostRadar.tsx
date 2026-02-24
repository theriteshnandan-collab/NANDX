"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Zap, Activity } from "lucide-react";
import { agentMesh } from "@/lib/agents/AgentMesh";
import { AgentManifest } from "@/lib/agents/SovereignAgent";

export const GhostRadar: React.FC = () => {
    const [agents, setAgents] = useState<AgentManifest[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setAgents(agentMesh.getRemoteAgents());
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6 glass-neural rounded-[32px] overflow-hidden relative min-h-[400px]">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-tactile-sage/20 flex items-center justify-center shadow-convex">
                        <Activity className="w-6 h-6 text-tactile-text animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-tactile-text">Ghost Radar</h2>
                        <p className="text-[10px] font-bold text-tactile-leaf uppercase">Pulse: 100ms</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/50 border border-white text-[9px] font-black uppercase tracking-tighter text-tactile-leaf">
                    {agents.length} AGENTS ACTIVE
                </div>
            </div>

            {/* 🛸 Radar Visualization */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full border border-tactile-sage/20 border-dashed rounded-full scale-150"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full border border-tactile-sage/10 border-dashed rounded-full scale-125"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
                <AnimatePresence>
                    {agents.length === 0 ? (
                        <div className="col-span-2 py-20 text-center opacity-40">
                            <Cpu className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Shards Detected</p>
                        </div>
                    ) : (
                        agents.map((agent) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="p-4 bg-white/40 border border-white rounded-2xl shadow-levitate group hover:scale-[1.02] transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-tactile-sage flex items-center justify-center shadow-sm">
                                        <Zap className="w-4 h-4 text-tactile-text" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="text-[10px] font-black uppercase truncate">{agent.name}</h3>
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[8px] font-bold text-tactile-leaf uppercase">Level {agent.trustLevel}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {agent.capabilities.slice(0, 2).map((cap) => (
                                        <span key={cap} className="text-[7px] font-black bg-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter text-tactile-leaf">
                                            {cap}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={() => {
                        agentMesh.announceAgent({
                            id: `shard-${Math.random().toString(36).substr(2, 9)}`,
                            name: "TEST_SHARD_" + Math.floor(Math.random() * 999),
                            capabilities: ["summarize", "search", "indexing"],
                            trustLevel: 100,
                            ownerId: "local-user",
                            version: "1.0.0"
                        });
                    }}
                    className="px-4 py-2 bg-white shadow-convex rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-tactile-sage/20 transition-all active:scale-[0.95]"
                >
                    + Spawn Local Shard
                </button>
            </div>
        </div>
    );
};

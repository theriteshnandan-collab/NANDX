"use client";

import React from "react";
import {
    Layout, MessageSquare, Users, Settings,
    Shield, Radio, Hash, Ghost, Zap
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * NANDIX CORE: THE SHELL
 * A Three-Column Sovereign Interface.
 */
export const AppLayout: React.FC<{
    children: React.ReactNode;
    sidebar: React.ReactNode;
    peerList: React.ReactNode;
}> = ({ children, sidebar, peerList }) => {
    return (
        <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden">

            {/* COLUMN 1: SOVEREIGNS (Servers) */}
            <aside className="w-20 bg-black/40 border-r border-white/5 flex flex-col items-center py-4 space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-2">
                    <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="h-0.5 w-8 bg-white/5 rounded-full" />
                {sidebar}

                <div className="mt-auto pb-4 space-y-4">
                    <button className="w-12 h-12 flex items-center justify-center text-zinc-600 hover:text-emerald-400 transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* COLUMN 2: CHANNEL LIST & CHAT (The Core) */}
            <main className="flex-1 flex overflow-hidden">
                <div className="w-64 bg-zinc-900/20 border-r border-white/5 hidden md:flex flex-col">
                    <div className="h-14 px-4 flex items-center border-b border-white/5">
                        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Channels</h2>
                    </div>
                    <div className="flex-1 p-2 space-y-1">
                        <ChannelItem icon={<Hash className="w-4 h-4" />} label="general" active />
                        <ChannelItem icon={<Hash className="w-4 h-4" />} label="development" />
                        <ChannelItem icon={<Ghost className="w-4 h-4" />} label="ghost-lounge" />
                        <ChannelItem icon={<Radio className="w-4 h-4" />} label="aether-voice" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-zinc-950/20">
                    <div className="h-14 px-6 flex items-center justify-between border-b border-white/5 backdrop-blur-xl bg-black/20 z-10">
                        <div className="flex items-center gap-2">
                            <Hash className="text-zinc-500 w-5 h-5" />
                            <span className="font-bold text-sm tracking-tight">general</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Zap className="w-4 h-4 text-emerald-500 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </main>

            {/* COLUMN 3: PEER LIST (Presence) */}
            <aside className="w-64 bg-black/40 border-l border-white/5 hidden lg:flex flex-col p-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">Discovery</h2>
                {peerList}
            </aside>

        </div>
    );
};

const ChannelItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active }) => (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
        {icon}
        <span>{label}</span>
    </button>
);

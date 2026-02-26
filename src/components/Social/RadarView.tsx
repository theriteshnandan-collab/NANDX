"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Wifi, WifiOff, Shield, User, Zap, Hash, ArrowRight } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/NandixDB";
import { mesh } from "@/lib/p2p/NandixMesh";

interface RadarViewProps {
    myId: string | null;
    connectedPeers: number;
    onAddContact: (peerId: string) => void;
    onJoinRoom: (roomId: string, inviteCode: string) => void;
}

// ── Animated Radar Ring ─────────────────────────────────────
function RadarRing({ delay = 0, size = 1 }: { delay?: number; size?: number }) {
    return (
        <motion.div
            className="absolute rounded-full border border-rose-500/10"
            style={{ width: `${size * 100}%`, height: `${size * 100}%` }}
            initial={{ opacity: 0.4, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 3, repeat: Infinity, delay, ease: "easeOut" }}
        />
    );
}

// ── Peer Blip on Radar ──────────────────────────────────────
function PeerBlip({ index, total, peer, onAdd }: { index: number; total: number; peer: any; onAdd: () => void }) {
    const angle = (index / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
    const radius = 35 + (index % 3) * 10; // stagger rings
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: index * 0.08 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={onAdd}
            title={`@${peer.nickname || peer.peerId.substring(0, 8)}`}
        >
            {/* Blip Dot */}
            <div className="relative">
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse" />
                {/* Hover Label */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <div className="px-2 py-1 rounded-lg bg-zinc-900 border border-white/10 text-[9px] font-mono text-white">
                        @{peer.nickname || peer.peerId.substring(0, 8)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function RadarView({ myId, connectedPeers, onAddContact, onJoinRoom }: RadarViewProps) {
    const contacts = useLiveQuery(() => db.contacts.toArray(), []) || [];
    const rooms = useLiveQuery(() => db.rooms.toArray(), []) || [];
    const [scanActive, setScanActive] = useState(true);

    // Re-scan every 15 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setScanActive(false);
            setTimeout(() => setScanActive(true), 200);
        }, 15000);
        return () => clearInterval(timer);
    }, []);

    // Mesh heartbeat is handled automatically by NandixMesh

    const onlineContacts = contacts.filter(c => c.lastSeen && c.lastSeen > Date.now() - 120000);

    return (
        <div className="w-full h-full flex flex-col items-center max-w-2xl mx-auto px-4 md:px-0 overflow-y-auto no-scrollbar pb-36">

            {/* ── Header ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-4 flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.03]"
            >
                <div className="flex items-center gap-2.5">
                    <Radio className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-400">Mesh Radar</span>
                </div>
                <div className="flex items-center gap-2">
                    {connectedPeers > 0
                        ? <><Wifi className="w-3.5 h-3.5 text-emerald-400" /><span className="text-[10px] font-mono text-emerald-400 font-black">{connectedPeers} peers</span></>
                        : <><WifiOff className="w-3.5 h-3.5 text-zinc-600" /><span className="text-[10px] font-mono text-zinc-600">no peers</span></>
                    }
                </div>
            </motion.div>

            {/* ── Radar Scope ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                className="relative w-72 h-72 mt-6 mb-6 flex items-center justify-center"
            >
                {/* Background circle */}
                <div className="absolute inset-0 rounded-full bg-zinc-950 border border-rose-500/10 shadow-[inset_0_0_60px_rgba(244,63,94,0.03)]" />

                {/* Crosshair lines */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-rose-500/5" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-px bg-rose-500/5" />
                </div>

                {/* Animated rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <RadarRing delay={0} size={0.4} />
                    <RadarRing delay={1} size={0.7} />
                    <RadarRing delay={2} size={1.0} />
                </div>

                {/* Rotating sweep line */}
                {scanActive && (
                    <motion.div
                        className="absolute inset-0 rounded-full overflow-hidden"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                        <div
                            className="absolute top-0 left-1/2 w-px h-1/2 origin-bottom"
                            style={{
                                background: "linear-gradient(to top, rgba(244,63,94,0.5), transparent)",
                            }}
                        />
                    </motion.div>
                )}

                {/* Center dot (you) */}
                <div className="relative z-20 w-5 h-5 rounded-full bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                </div>

                {/* Peer Blips */}
                {onlineContacts.map((peer, i) => (
                    <PeerBlip
                        key={peer.peerId}
                        index={i}
                        total={onlineContacts.length}
                        peer={peer}
                        onAdd={() => onAddContact(peer.peerId)}
                    />
                ))}

                {/* No peers message */}
                {onlineContacts.length === 0 && connectedPeers === 0 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                        <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Scanning mesh…</p>
                    </div>
                )}
            </motion.div>

            {/* ── Live Contacts List ──────────────────────────────────── */}
            <div className="w-full space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Zap className="w-3 h-3 text-rose-400" />
                    <span className="text-[9px] font-mono font-black text-rose-400/60 uppercase tracking-[0.3em]">Active Nodes</span>
                </div>

                {onlineContacts.length === 0 && (
                    <div className="py-8 flex flex-col items-center opacity-25">
                        <Radio className="w-8 h-8 text-zinc-700 mb-3" />
                        <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">No active nodes detected.</p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {onlineContacts.map((contact, i) => (
                        <motion.div
                            key={contact.peerId}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                            transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
                            className="flex items-center justify-between p-4 rounded-2xl bg-[#0A0A0A]/90 border border-white/[0.03] hover:border-rose-500/20 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                                        <span className="font-mono text-sm font-black text-rose-400">
                                            {(contact.nickname || contact.peerId).charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-white">@{contact.nickname || `nandix-${contact.peerId.substring(0, 6)}`}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Shield className="w-2.5 h-2.5 text-emerald-400" />
                                        <span className="text-[9px] font-mono text-zinc-600">{contact.trustScore || 0} trust</span>
                                        <span className="text-[9px] font-mono text-zinc-700">·</span>
                                        <span className="text-[9px] font-mono text-zinc-600">{contact.peerId.substring(0, 12)}…</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onAddContact(contact.peerId)}
                                className="p-2 rounded-xl bg-white/[0.02] hover:bg-rose-500/10 border border-white/[0.04] hover:border-rose-500/30 text-zinc-600 hover:text-rose-400 transition-all"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Rooms Section */}
                {rooms.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 px-1 mt-6">
                            <Hash className="w-3 h-3 text-cyan-400" />
                            <span className="text-[9px] font-mono font-black text-cyan-400/60 uppercase tracking-[0.3em]">Detected Swarms</span>
                        </div>
                        {rooms.map((room, i) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => onJoinRoom(room.id, room.inviteCode)}
                                className="flex items-center justify-between p-4 rounded-2xl bg-[#0A0A0A]/90 border border-white/[0.03] hover:border-cyan-500/20 cursor-pointer group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                        <Hash className="w-4 h-4 text-cyan-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">{room.name}</div>
                                        <span className="text-[9px] font-mono text-zinc-600">{room.members?.length || 0} members</span>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-cyan-400 transition-colors" />
                            </motion.div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

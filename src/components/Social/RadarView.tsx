"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Wifi, WifiOff, Shield, Zap, Hash, ArrowRight, User } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/NandixDB";

/* ══════════════════════════════════════════════════════════════
   RADAR VIEW — Billion Dollar Design
   Void + Teal. Card classes. Typography tokens.
══════════════════════════════════════════════════════════════ */

interface RadarViewProps {
    myId: string | null;
    connectedPeers: number;
    onAddContact: (peerId: string) => void;
    onJoinRoom: (roomId: string, inviteCode: string) => void;
}

function RadarRing({ delay = 0, size = 1 }: { delay?: number; size?: number }) {
    return (
        <motion.div
            className="absolute rounded-full border border-cyan-500/20"
            style={{ width: `${size * 100}%`, height: `${size * 100}%` }}
            initial={{ opacity: 0.6, scale: 0.6 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 4, repeat: Infinity, delay, ease: "easeOut" }}
        />
    );
}

function PeerBlip({ index, total, peer, onAdd }: { index: number; total: number; peer: any; onAdd: () => void }) {
    const angle = (index / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
    const radius = 35 + (index % 3) * 10;
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
            <div className="relative">
                <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse" />
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <div className="px-3 py-1.5 rounded-xl glass-panel label-data text-white text-[10px] tracking-widest border-cyan-500/30">
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

    useEffect(() => {
        const timer = setInterval(() => {
            setScanActive(false);
            setTimeout(() => setScanActive(true), 200);
        }, 15000);
        return () => clearInterval(timer);
    }, []);

    const onlineContacts = contacts.filter(c => c.lastSeen && c.lastSeen > Date.now() - 120000);

    return (
        <div className="w-full h-full flex flex-col items-center max-w-2xl mx-auto px-4 md:px-0 overflow-y-auto no-scrollbar pb-36 font-inter">

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-4 flex items-center justify-between p-4 glass-panel !rounded-2xl border-white/10"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <Radio className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="label-data text-white font-bold">Mesh Radar</span>
                </div>
                <div className="flex items-center gap-2 label-data font-bold">
                    {connectedPeers > 0
                        ? <><Wifi className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">{connectedPeers} peers active</span></>
                        : <><WifiOff className="w-4 h-4 text-zinc-600" /><span className="text-zinc-600">Zero connection</span></>
                    }
                </div>
            </motion.div>

            {/* ── Radar Scope ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                className="relative w-72 h-72 mb-12 mt-8 flex items-center justify-center glass-panel !rounded-full overflow-visible border-white/5 shadow-[0_0_80px_rgba(6,182,212,0.1)]"
            >
                {/* Crosshairs */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-[1px] bg-[var(--teal-border)] opacity-30" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-full w-[1px] bg-[var(--teal-border)] opacity-30" />
                </div>

                {/* Animated Rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <RadarRing delay={0} size={0.3} />
                    <RadarRing delay={1.3} size={0.6} />
                    <RadarRing delay={2.6} size={0.9} />
                </div>

                {/* Sweep */}
                {scanActive && (
                    <motion.div
                        className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                        <div
                            className="absolute top-0 left-1/2 w-[1px] h-1/2 origin-bottom"
                            style={{ background: "linear-gradient(to top, rgba(0,217,165,0.6), transparent)" }}
                        />
                        <div
                            className="absolute top-0 left-1/2 w-32 h-1/2 origin-bottom bg-gradient-to-r from-[rgba(0,217,165,0.1)] to-transparent"
                            style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                        />
                    </motion.div>
                )}

                {/* Center Core */}
                <div className="relative z-20 w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,1)] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </div>

                {/* Blips */}
                {onlineContacts.map((peer, i) => (
                    <PeerBlip key={peer.peerId} index={i} total={onlineContacts.length} peer={peer} onAdd={() => onAddContact(peer.peerId)} />
                ))}

                {onlineContacts.length === 0 && connectedPeers === 0 && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none">
                        <p className="label-data text-teal animate-pulse">Scanning the void...</p>
                    </div>
                )}
            </motion.div>

            {/* ── Active Nodes List ── */}
            <div className="w-full flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3.5 h-3.5 text-teal" />
                    <span className="eyebrow text-teal">Active Signatures</span>
                </div>

                {onlineContacts.length === 0 && (
                    <div className="py-12 flex flex-col items-center opacity-30 card border-dashed">
                        <Radio className="w-8 h-8 text-[var(--text-muted)] mb-3" />
                        <p className="label-data">No active nodes detected nearby.</p>
                    </div>
                )}

                <AnimatePresence initial={false} mode="popLayout">
                    {onlineContacts.map((contact, i) => (
                        <motion.div
                            key={contact.peerId} layout
                            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
                            className="card p-4 flex items-center justify-between group cursor-pointer hover:border-[var(--teal-border)]"
                            onClick={() => onAddContact(contact.peerId)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full card-elevated flex items-center justify-center">
                                        <span className="font-display font-medium text-teal">
                                            {(contact.nickname || contact.peerId).charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal shadow-[0_0_8px_rgba(0,217,165,0.8)] border-[2px] border-[#0A0A0F]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-white text-[14px]">@{contact.nickname || `node-${contact.peerId.substring(0, 6)}`}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Shield className="w-3 h-3 text-[var(--teal-border)]" />
                                        <span className="label-data !m-0">{contact.trustScore || 0} trust</span>
                                        <span className="label-data !m-0 border-l border-[var(--bg-border)] pl-2">{contact.peerId.substring(0, 12)}...</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-ghost !p-2 opacity-50 group-hover:opacity-100 group-hover:text-teal">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* ── Detected Swarms ── */}
                {rooms.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 mt-8 mb-2">
                            <Hash className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                            <span className="eyebrow">Local Swarms</span>
                        </div>
                        {rooms.map((room, i) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                onClick={() => onJoinRoom(room.id, room.inviteCode)}
                                className="card p-4 flex items-center justify-between cursor-pointer hover:border-[var(--bg-border)] group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg card-elevated flex items-center justify-center">
                                        <Hash className="w-4 h-4 text-teal" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-[14px] text-white group-hover:text-teal transition-colors">{room.name}</span>
                                        <span className="label-data !m-0">{room.members?.length || 0} nodes</span>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-teal" />
                            </motion.div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

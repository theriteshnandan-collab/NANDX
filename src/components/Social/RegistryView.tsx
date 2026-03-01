"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Users, Shield, Plus, Search, Globe, Zap, ArrowRight, User } from "lucide-react";
import { useMesh } from "../../context/MeshProvider";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db/NandixDB";

interface RegistryViewProps {
    onJoinRoom: (roomId: string, inviteCode: string) => void;
    onAddContact: (peerId: string) => void;
}

export const RegistryView: React.FC<RegistryViewProps> = ({ onJoinRoom, onAddContact }) => {
    const { connectedPeers } = useMesh();
    const [filter, setFilter] = useState("");
    const [tab, setTab] = useState<"ROOMS" | "PEERS">("ROOMS");

    // Live Data
    const localRooms = useLiveQuery(() => db.rooms.toArray(), []) || [];
    const localContacts = useLiveQuery(() => db.contacts.toArray(), []) || [];

    // Filter logic
    const filteredRooms = localRooms.filter(r => r.name.toLowerCase().includes(filter.toLowerCase()));
    const filteredPeers = localContacts.filter(p => (p.nickname || p.peerId).toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="w-full h-full flex flex-col bg-white border border-black/5 !rounded-[2.5rem] overflow-hidden shadow-2xl">
            {/* Header: Search & Navigation */}
            <div className="p-6 space-y-4 border-b border-black/[0.03] bg-slate-50/50">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                        <Globe className="w-3 h-3 text-blue-600" />
                        The Registry
                    </h2>
                    <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl">
                        <button
                            onClick={() => setTab("ROOMS")}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${tab === "ROOMS" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            Swarms
                        </button>
                        <button
                            onClick={() => setTab("PEERS")}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${tab === "PEERS" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            Mesh
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder={tab === "ROOMS" ? "Search public swarms..." : "Search mesh contacts..."}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-white border border-black/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-300 outline-none focus:border-blue-500/30 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Content: Scrollable Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {tab === "ROOMS" ? (
                        <motion.div
                            key="rooms"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-3"
                        >
                            {filteredRooms.map((room) => (
                                <RoomCard key={room.id} room={room} onJoin={() => onJoinRoom(room.id, room.inviteCode)} />
                            ))}
                            {filteredRooms.length === 0 && <EmptyState icon={Hash} message="No swarms detected in the mesh." />}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="peers"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            {/* Manual Connect Fallback */}
                            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-black/5 rounded-2xl mb-4 group focus-within:border-blue-500/30 transition-colors">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                </div>
                                <input
                                    id="registryForceDial"
                                    type="text"
                                    placeholder="Direct connect ID..."
                                    className="flex-1 bg-transparent px-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none font-mono"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.currentTarget.value) {
                                            onAddContact(e.currentTarget.value.trim());
                                            e.currentTarget.value = "";
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('registryForceDial') as HTMLInputElement;
                                        if (input && input.value) {
                                            onAddContact(input.value.trim());
                                            input.value = "";
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                                >
                                    Dial
                                </button>
                            </div>

                            {filteredPeers.map((peer) => (
                                <PeerRow key={peer.peerId} peer={peer} onAdd={() => onAddContact(peer.peerId)} />
                            ))}
                            {filteredPeers.length === 0 && <EmptyState icon={Users} message="Mesh history is empty." />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

function RoomCard({ room, onJoin }: { room: any, onJoin: () => void }) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="group p-6 bg-white border border-black/5 hover:border-blue-500/30 rounded-3xl transition-all cursor-pointer relative overflow-hidden shadow-sm hover:shadow-xl"
            onClick={onJoin}
        >
            <div className="absolute top-0 left-0 w-1.5 h-0 bg-blue-600 group-hover:h-full transition-all duration-300" />

            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-300">MEMBERS</span>
                    <span className="text-xs font-bold text-slate-500">{room.members?.length || 0}</span>
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{room.name}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {room.description || "A sovereign group in the NANDIX mesh."}
                </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full bg-slate-100 border border-white" />
                    ))}
                </div>
                <Zap className="w-4 h-4 text-slate-200 group-hover:text-blue-500 transition-colors" />
            </div>
        </motion.div>
    );
}

function PeerRow({ peer, onAdd }: { peer: any, onAdd: () => void }) {
    return (
        <motion.div
            whileHover={{ x: 6, backgroundColor: "rgba(0,0,0,0.02)" }}
            className="flex items-center justify-between p-4 bg-white border border-black/5 group rounded-[1.5rem] transition-all"
        >
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-blue-500/5 border border-blue-500/10 flex items-center justify-center shadow-inner">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    {peer.lastSeen > Date.now() - 60000 && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{peer.nickname || `nandix-${peer.peerId.substring(0, 6)}`}</h4>
                    <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{peer.peerId}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {peer.trustScore && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <Shield className="w-2.5 h-2.5 text-emerald-600" />
                        <span className="text-[9px] font-black text-emerald-600">{peer.trustScore}</span>
                    </div>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onAdd(); }}
                    className="p-2 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl border border-black/5 hover:border-blue-600 transition-all text-slate-400"
                >
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}

function EmptyState({ icon: Icon, message }: { icon: any, message: string }) {
    return (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-black/5 flex items-center justify-center">
                <Icon className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">
                {message}
            </p>
        </div>
    );
}

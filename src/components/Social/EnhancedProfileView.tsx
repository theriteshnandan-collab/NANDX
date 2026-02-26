"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Hash, User, Star, Award, ArrowRight, ScrollText, Power, Activity } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, SocialPost } from "@/lib/db/NandixDB";
import { mesh } from "@/lib/p2p/NandixMesh";
import { EchoBot } from "@/lib/agents/EchoBot";

interface EnhancedProfileViewProps {
    myId: string | null;
    viewPeerId?: string | null; // If null, show own profile
}

type ProfileTab = "WALL" | "TRUST" | "BOTS";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THE TRUST SCORE RING
// A dynamic SVG ring that fills based on trust score (0-100)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TrustRing({ score }: { score: number }) {
    const radius = 54;
    const circ = 2 * Math.PI * radius;
    const fill = (score / 100) * circ;

    const color =
        score >= 80 ? "#10B981" :
            score >= 50 ? "#06B6D4" :
                score >= 25 ? "#F59E0B" : "#F43F5E";

    return (
        <svg width="128" height="128" viewBox="0 0 128 128" className="drop-shadow-[0_0_24px_rgba(16,185,129,0.3)]">
            {/* Track */}
            <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
            {/* Fill */}
            <motion.circle
                cx="64" cy="64" r={radius}
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - fill }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                transform="rotate(-90 64 64)"
                style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
            {/* Score Label */}
            <text x="64" y="60" textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="monospace">{score}</text>
            <text x="64" y="76" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontWeight="700" fontFamily="monospace" letterSpacing="3">TRUST</text>
        </svg>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VOUCH CONSTELLATION
// Renders the vouch graph as a mini constellation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function VouchConstellation({ vouches }: { vouches: string[] }) {
    if (vouches.length === 0) return (
        <div className="flex items-center justify-center py-8 opacity-20">
            <Shield className="w-8 h-8 text-zinc-600" />
            <span className="ml-3 text-xs font-mono text-zinc-600 uppercase tracking-widest">No vouches yet</span>
        </div>
    );

    return (
        <div className="flex flex-wrap gap-2 py-2">
            {vouches.map((peerId, i) => (
                <motion.div
                    key={peerId}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 400, damping: 25 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 group hover:border-emerald-500/50 transition-all"
                >
                    <div className="w-5 h-5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                        <span className="text-[9px] font-mono text-emerald-400">{peerId.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 group-hover:text-emerald-400 transition-colors tracking-wider">{peerId.substring(0, 10)}…</span>
                    <Shield className="w-2.5 h-2.5 text-emerald-500/40" />
                </motion.div>
            ))}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PERSONAL WALL POST CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function WallCard({ post }: { post: SocialPost }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.03] hover:border-white/[0.07] transition-colors group"
        >
            <p className="text-[14px] text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">{post.text}</p>
            <div className="flex items-center gap-3 mt-4">
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                    {new Date(post.timestamp).toLocaleDateString()} · {new Date(post.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <div className="flex items-center gap-1 ml-auto px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <Zap className="w-2.5 h-2.5 text-emerald-500" />
                    <span className="text-[9px] font-mono text-emerald-400 font-black">{post.vibeCount || 0}</span>
                </div>
            </div>
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function EnhancedProfileView({ myId, viewPeerId }: EnhancedProfileViewProps) {
    const [tab, setTab] = useState<ProfileTab>("WALL");
    const [isVouching, setIsVouching] = useState(false);
    const [echoBotRunning, setEchoBotRunning] = useState(false);
    const echoBotRef = useRef<EchoBot | null>(null);

    const targetId = viewPeerId || myId;
    const isMe = targetId === myId;

    // Live data
    const contact = useLiveQuery(() => targetId ? db.contacts.get(targetId) : undefined, [targetId]);
    const myProfile = useLiveQuery(() => db.settings.get("profile"), []);
    const wallPosts = useLiveQuery<SocialPost[]>(
        () => targetId
            ? db.posts.where("authorId").equals(targetId).reverse().sortBy("timestamp") as unknown as Promise<SocialPost[]>
            : Promise.resolve<SocialPost[]>([]),
        [targetId]
    );

    const displayName = isMe
        ? (myProfile?.value?.username || `user-${myId?.substring(0, 6)}`)
        : (contact?.nickname || `nandix-${targetId?.substring(0, 6)}`);

    const trustScore = isMe ? 100 : (contact?.trustScore || 10);
    const vouches = contact?.vouchedBy || [];
    const postCount = wallPosts?.length || 0;

    const handleVouch = async () => {
        if (!targetId || !myId || isMe) return;
        setIsVouching(true);
        const level = 7; // Default trust level
        mesh.vouchForPeer(targetId, level);
        setTimeout(() => setIsVouching(false), 1500);
    };

    const handleEchoBotToggle = () => {
        if (!myId) return;
        if (echoBotRunning) {
            echoBotRef.current?.stop();
            setEchoBotRunning(false);
        } else {
            if (!echoBotRef.current) {
                echoBotRef.current = new EchoBot(myId, "echo-bot");
            }
            echoBotRef.current.start(10000); // Post every 10 seconds
            setEchoBotRunning(true);
        }
    };

    const tabs: ProfileTab[] = ["WALL", "TRUST", "BOTS"];
    const tabIcons: Record<ProfileTab, React.ReactNode> = {
        WALL: <ScrollText className="w-3 h-3" />,
        TRUST: <Shield className="w-3 h-3" />,
        BOTS: <Zap className="w-3 h-3" />,
    };

    return (
        <div className="w-full h-full flex flex-col items-center max-w-2xl mx-auto px-4 md:px-0 overflow-y-auto no-scrollbar pb-36">

            {/* ── Identity Card ────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="w-full mt-4 p-8 rounded-[2rem] bg-[#0A0A0A]/90 border border-white/[0.04] relative overflow-hidden"
            >
                {/* Gradient glow */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

                <div className="relative z-10 flex gap-8 items-center">
                    {/* Trust Ring as Avatar */}
                    <div className="flex-shrink-0">
                        <TrustRing score={trustScore} />
                    </div>

                    {/* Identity Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-black text-white tracking-tight truncate">@{displayName}</h2>
                            {isMe && <span className="px-2 py-0.5 rounded-lg text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest font-black flex-shrink-0">Sovereign</span>}
                        </div>
                        <div className="font-mono text-[11px] text-zinc-600 mb-4 truncate">{targetId?.substring(0, 32)}…</div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white">{postCount}</span>
                                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Signals</span>
                            </div>
                            <div className="w-px h-8 bg-white/5" />
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white">{vouches.length}</span>
                                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Vouches</span>
                            </div>
                            <div className="w-px h-8 bg-white/5" />
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white">{trustScore}</span>
                                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Trust Pts</span>
                            </div>
                        </div>

                        {/* Vouch Action (only for peers) */}
                        {!isMe && (
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={handleVouch}
                                disabled={isVouching}
                                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all disabled:opacity-50"
                            >
                                <Shield className="w-3.5 h-3.5" />
                                {isVouching ? "Vouch Transmitted" : "Forge Vouch Shard"}
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ── Profile Tabs ──────────────────────────────────────────── */}
            <div className="w-full flex gap-2 my-5">
                {tabs.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${tab === t ? "bg-white/10 text-white" : "text-zinc-600 hover:text-zinc-400"}`}
                    >
                        {tabIcons[t]}
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ───────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30, duration: 0.2 }}
                    className="w-full flex flex-col gap-4"
                >
                    {/* WALL Tab */}
                    {tab === "WALL" && (
                        wallPosts && wallPosts.length > 0 ? (
                            wallPosts.map(post => <WallCard key={post.id} post={post} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 opacity-25">
                                <ScrollText className="w-10 h-10 text-zinc-700 mb-4" />
                                <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">No signals on this wall yet.</p>
                            </div>
                        )
                    )}

                    {/* TRUST Tab */}
                    {tab === "TRUST" && (
                        <div className="p-6 rounded-[2rem] bg-[#0A0A0A]/90 border border-white/[0.04] space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.04] flex flex-col items-center">
                                    <Star className="w-5 h-5 text-amber-400 mb-2" />
                                    <span className="text-3xl font-black text-white">{trustScore}</span>
                                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider mt-1">Trust Score</span>
                                </div>
                                <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.04] flex flex-col items-center">
                                    <Award className="w-5 h-5 text-emerald-400 mb-2" />
                                    <span className="text-3xl font-black text-white">{vouches.length}</span>
                                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider mt-1">Vouches</span>
                                </div>
                            </div>

                            {/* Vouch Constellation */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.3em]">Vouched By</span>
                                </div>
                                <VouchConstellation vouches={vouches} />
                            </div>
                        </div>
                    )}

                    {/* BOTS Tab */}
                    {tab === "BOTS" && (
                        <div className="flex flex-col gap-4">
                            {/* EchoBot Card */}
                            <div className="p-6 rounded-[2rem] bg-[#0A0A0A]/90 border border-white/[0.04] flex items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${echoBotRunning ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "bg-white/[0.02] border-white/[0.05]"}`}>
                                        <Activity className={`w-5 h-5 transition-colors ${echoBotRunning ? "text-emerald-400" : "text-zinc-600"}`} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white">Echo Bot</div>
                                        <div className="text-[10px] font-mono text-zinc-600 mt-0.5">Posts a heartbeat signal every 10 seconds.</div>
                                        <div className={`text-[9px] font-mono mt-1 uppercase tracking-widest font-black ${echoBotRunning ? "text-emerald-400" : "text-zinc-700"}`}>
                                            {echoBotRunning ? "● TRANSMITTING" : "○ DORMANT"}
                                        </div>
                                    </div>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleEchoBotToggle}
                                    className={`p-3 rounded-2xl border transition-all ${echoBotRunning ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"}`}
                                >
                                    <Power className="w-5 h-5" />
                                </motion.button>
                            </div>

                            {/* More bots placeholder */}
                            <div className="p-5 rounded-[1.5rem] bg-white/[0.01] border border-white/[0.03] flex items-center gap-4 opacity-30">
                                <Zap className="w-8 h-8 text-zinc-700" />
                                <div>
                                    <div className="text-xs font-black text-zinc-600">More Bot Shards</div>
                                    <div className="text-[10px] font-mono text-zinc-700">Coming in Stage 6 — Agentic Civilization.</div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

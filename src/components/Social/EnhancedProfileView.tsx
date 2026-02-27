"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, User, Star, Award, ArrowRight, ScrollText, Power, Activity } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, SocialPost } from "@/lib/db/NandixDB";
import { mesh } from "@/lib/p2p/NandixMesh";
import { EchoBot } from "@/lib/agents/EchoBot";

/* ══════════════════════════════════════════════════════════════
   ENHANCED PROFILE VIEW — Billion Dollar Design
   Void + Teal. Card classes. Typography tokens.
══════════════════════════════════════════════════════════════ */

interface EnhancedProfileViewProps {
    myId: string | null;
    viewPeerId?: string | null;
}

type ProfileTab = "WALL" | "TRUST" | "BOTS";

function TrustRing({ score }: { score: number }) {
    const radius = 54;
    const circ = 2 * Math.PI * radius;
    const fill = (score / 100) * circ;

    const color = "var(--teal)";
    const bg = "var(--bg-border)";

    return (
        <svg width="128" height="128" viewBox="0 0 128 128" className="drop-shadow-[0_0_32px_rgba(6,182,212,0.3)] relative z-10">
            <circle cx="64" cy="64" r={radius} fill="none" stroke={bg} strokeWidth="6" strokeOpacity="0.2" />
            <motion.circle
                cx="64" cy="64" r={radius}
                fill="none"
                stroke="url(#aurora-gradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - fill }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                transform="rotate(-90 64 64)"
            />
            <defs>
                <linearGradient id="aurora-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--cyan)" />
                    <stop offset="100%" stopColor="var(--teal)" />
                </linearGradient>
            </defs>
            <text x="64" y="60" textAnchor="middle" fill="white" className="font-display font-medium text-2xl">{score}</text>
            <text x="64" y="78" textAnchor="middle" fill="var(--cyan)" className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase">STATUS</text>
        </svg>
    );
}

function VouchConstellation({ vouches }: { vouches: string[] }) {
    if (vouches.length === 0) return (
        <div className="flex items-center justify-center py-8 opacity-40">
            <Shield className="w-8 h-8 text-[var(--text-muted)]" />
            <span className="ml-3 label-data !m-0">No vouches minted</span>
        </div>
    );

    return (
        <div className="flex flex-wrap gap-2 py-2">
            {vouches.map((peerId, i) => (
                <motion.div
                    key={peerId}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 400, damping: 25 }}
                    className="flex items-center gap-2 px-3 py-1.5 glass-panel group rounded-xl"
                >
                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="font-display font-medium text-[10px] text-cyan-400">{peerId.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="font-mono text-[10px] font-medium text-zinc-400 group-hover:text-white transition-colors tracking-wider">{peerId.substring(0, 8)}...</span>
                    <Shield className="w-2.5 h-2.5 text-cyan-500/50" />
                </motion.div>
            ))}
        </div>
    );
}

function WallCard({ post }: { post: SocialPost }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="glass-panel p-6 group rounded-3xl relative overflow-hidden"
        >
            <div className="absolute left-0 top-0 w-1 h-0 bg-cyan-500 group-hover:h-full transition-all duration-300" />
            <p className="text-[14px] text-white leading-relaxed whitespace-pre-wrap font-medium">{post.text}</p>
            <div className="flex items-center gap-3 mt-4">
                <span className="label-data !m-0">
                    {new Date(post.timestamp).toLocaleDateString()} · {new Date(post.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <div className="flex items-center gap-1.5 ml-auto px-2 py-1 rounded-sm border border-[var(--teal-border)] bg-[rgba(0,217,165,0.05)]">
                    <Zap className="w-2.5 h-2.5 text-teal" />
                    <span className="font-mono text-[10px] text-teal font-bold">{post.vibeCount || 0}</span>
                </div>
            </div>
        </motion.div>
    );
}

export function EnhancedProfileView({ myId, viewPeerId }: EnhancedProfileViewProps) {
    const [tab, setTab] = useState<ProfileTab>("WALL");
    const [isVouching, setIsVouching] = useState(false);
    const [echoBotRunning, setEchoBotRunning] = useState(false);
    const echoBotRef = useRef<EchoBot | null>(null);

    const targetId = viewPeerId || myId;
    const isMe = targetId === myId;

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
        : (contact?.nickname || `node-${targetId?.substring(0, 6)}`);

    const trustScore = isMe ? 100 : (contact?.trustScore || 10);
    const vouches = contact?.vouchedBy || [];
    const postCount = wallPosts?.length || 0;

    const handleVouch = async () => {
        if (!targetId || !myId || isMe) return;
        setIsVouching(true);
        mesh.vouchForPeer(targetId, 7);
        setTimeout(() => setIsVouching(false), 1500);
    };

    const handleEchoBotToggle = () => {
        if (!myId) return;
        if (echoBotRunning) {
            echoBotRef.current?.stop();
            setEchoBotRunning(false);
        } else {
            if (!echoBotRef.current) echoBotRef.current = new EchoBot(myId, "echo-bot");
            echoBotRef.current.start(10000);
            setEchoBotRunning(true);
        }
    };

    const tabs: ProfileTab[] = ["WALL", "TRUST", "BOTS"];
    const tabIcons: Record<ProfileTab, React.ReactNode> = {
        WALL: <ScrollText className="w-3.5 h-3.5" />,
        TRUST: <Shield className="w-3.5 h-3.5" />,
        BOTS: <Activity className="w-3.5 h-3.5" />,
    };

    return (
        <div className="w-full h-full flex flex-col items-center max-w-3xl mx-auto px-4 md:px-0 py-4 overflow-y-auto no-scrollbar pb-36 font-inter">

            {/* ── Main ID Card ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="w-full mt-4 glass-panel p-8 relative overflow-hidden rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: "linear-gradient(90deg, transparent, var(--violet-glow), transparent)" }} />

                <div className="relative z-10 flex gap-8 items-center flex-col md:flex-row">
                    <div className="flex-shrink-0">
                        <TrustRing score={trustScore} />
                    </div>

                    <div className="flex-1 min-w-0 text-center md:text-left">
                        <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                            <h2 className="display-md text-white truncate">@{displayName}</h2>
                            {isMe && <span className="label-data border border-teal text-teal px-1.5 py-0.5 rounded-sm bg-[rgba(0,217,165,0.05)]">Sovereign</span>}
                        </div>
                        <div className="label-data mb-6 truncate">{targetId}</div>

                        <div className="flex items-center gap-8 justify-center md:justify-start">
                            <div className="flex flex-col">
                                <span className="font-display font-medium text-2xl text-white">{postCount}</span>
                                <span className="label-data !m-0">Signals</span>
                            </div>
                            <div className="w-px h-8 bg-[var(--bg-border)]" />
                            <div className="flex flex-col">
                                <span className="font-display font-medium text-2xl text-white">{vouches.length}</span>
                                <span className="label-data !m-0">Vouches</span>
                            </div>
                            <div className="w-px h-8 bg-[var(--bg-border)]" />
                            <div className="flex flex-col">
                                <span className="font-display font-medium text-2xl text-white">{trustScore}</span>
                                <span className="label-data !m-0">Trust</span>
                            </div>
                        </div>

                        {!isMe && (
                            <motion.button
                                whileTap={{ scale: 0.96 }} onClick={handleVouch} disabled={isVouching}
                                className="mt-6 btn-outline"
                            >
                                <Shield className="w-3.5 h-3.5 text-teal" />
                                <span className="label-data !m-0">{isVouching ? "Vouch Stamped" : "Forge Trust Link"}</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ── Tabs ── */}
            <div className="w-full flex gap-2 mb-6 mt-6 border-b pb-2 border-[var(--bg-border)] justify-center md:justify-start">
                {tabs.map((t) => (
                    <button
                        key={t} onClick={() => setTab(t)}
                        className={`btn-ghost ${tab === t ? "text-primary !bg-[var(--bg-border)]" : ""}`}
                    >
                        {React.cloneElement(tabIcons[t] as React.ReactElement, { className: "w-3.5 h-3.5 text-teal" })}
                        <span className="label-data !text-[11px] !m-0" style={{ color: "var(--text-primary)" }}>{t}</span>
                    </button>
                ))}
            </div>

            {/* ── Content ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30, duration: 0.2 }}
                    className="w-full flex flex-col gap-4"
                >
                    {tab === "WALL" && (
                        wallPosts && wallPosts.length > 0 ? (
                            wallPosts.map(post => <WallCard key={post.id} post={post} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                <ScrollText className="w-10 h-10 text-[var(--text-muted)] mb-4" />
                                <p className="label-data">The wall is empty.</p>
                            </div>
                        )
                    )}

                    {tab === "TRUST" && (
                        <div className="card-elevated p-8">
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="card border-dashed flex flex-col items-center justify-center py-8">
                                    <Shield className="w-6 h-6 text-teal mb-3" />
                                    <span className="font-display font-medium text-3xl text-white">{trustScore}</span>
                                    <span className="label-data mt-1">Network Trust</span>
                                </div>
                                <div className="card border-dashed flex flex-col items-center justify-center py-8">
                                    <Award className="w-6 h-6 text-teal mb-3" />
                                    <span className="font-display font-medium text-3xl text-white">{vouches.length}</span>
                                    <span className="label-data mt-1">Total Vouches</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-4 h-4 text-teal" />
                                    <span className="eyebrow text-teal">Sovereigns Trusting</span>
                                </div>
                                <VouchConstellation vouches={vouches} />
                            </div>
                        </div>
                    )}

                    {tab === "BOTS" && (
                        <div className="flex flex-col gap-4">
                            <div className="card-elevated p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all" style={{ border: echoBotRunning ? "1px solid var(--teal-border)" : "1px solid var(--bg-border)" }}>
                                <div className="flex items-center gap-5 w-full md:w-auto">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${echoBotRunning ? "bg-[rgba(0,217,165,0.1)] border border-[var(--teal-border)] shadow-[0_0_15px_rgba(0,217,165,0.2)]" : "card"}`}>
                                        <Activity className={`w-5 h-5 ${echoBotRunning ? "text-teal" : "text-silver"}`} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="font-medium text-white text-[15px]">Echo Bot Shard</div>
                                        <div className="text-[12px] text-silver mt-1">Emits a sovereign heartbeat signal every 10 seconds.</div>
                                        <div className="label-data mt-2 flex items-center gap-1.5" style={{ color: echoBotRunning ? "var(--teal)" : "var(--text-muted)" }}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${echoBotRunning ? "bg-teal animate-pulse" : "bg-[var(--text-muted)]"}`} />
                                            {echoBotRunning ? "TRANSMITTING" : "DORMANT"}
                                        </div>
                                    </div>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleEchoBotToggle}
                                    className={`px-5 py-2.5 rounded-sm font-mono text-[11px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 border w-full md:w-auto justify-center ${echoBotRunning ? "bg-[rgba(244,63,94,0.1)] border-[rgba(244,63,94,0.3)] text-rose-500 hover:bg-[rgba(244,63,94,0.15)]" : "bg-[rgba(0,217,165,0.1)] border-[var(--teal-border)] text-teal hover:bg-[rgba(0,217,165,0.15)]"}`}
                                >
                                    <Power className="w-3.5 h-3.5" />
                                    {echoBotRunning ? "Halt Shard" : "Activate Shard"}
                                </motion.button>
                            </div>

                            <div className="card border-dashed p-6 flex items-center gap-5 opacity-40">
                                <div className="w-12 h-12 rounded-lg card-elevated flex items-center justify-center shadow-none flex-shrink-0">
                                    <Zap className="w-5 h-5 text-[var(--text-muted)]" />
                                </div>
                                <div>
                                    <div className="font-medium text-white text-[14px]">More Bot Shards</div>
                                    <div className="label-data !m-0 mt-1">Awaiting the Singularity Protocol.</div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

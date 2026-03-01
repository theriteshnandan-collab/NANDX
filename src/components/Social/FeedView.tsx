"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Zap, User, MessageSquare, Heart, TrendingUp, RefreshCw, Sparkles, Radio } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, SocialPost, SocialVibe } from "@/lib/db/NandixDB";
import { mesh } from "@/lib/p2p/NandixMesh";
import { useBrowserAI } from "@/hooks/useBrowserAI";
import { ReplyThread } from "@/components/Social/ReplyThread";

/* ══════════════════════════════════════════════════════════════
   FEED VIEW (SIGNAL) — Billion Dollar Design
   Void + Teal. Card classes. Typography tokens.
══════════════════════════════════════════════════════════════ */

interface FeedViewProps {
    myId: string | null;
    connectedPeers?: number;
}

type FeedTab = "LATEST" | "TRENDING";

export function FeedView({ myId, connectedPeers = 0 }: FeedViewProps) {
    const [composeText, setComposeText] = useState("");
    const [tab, setTab] = useState<FeedTab>("LATEST");
    const [isSyncing, setIsSyncing] = useState(false);
    const [summaries, setSummaries] = useState<Record<string, string>>({});
    const [summarizing, setSummarizing] = useState<Record<string, boolean>>({});
    const { summarize, status: aiStatus } = useBrowserAI();

    // Live feeds
    const latestPosts = useLiveQuery(() => db.posts.orderBy("timestamp").reverse().toArray(), []);
    const trendingPosts = useLiveQuery(() => db.posts.orderBy("vibeCount").reverse().limit(20).toArray(), []);
    const displayPosts = tab === "TRENDING" ? trendingPosts : latestPosts;

    useEffect(() => {
        if (connectedPeers > 0) mesh.requestAllPeerSync();
    }, [connectedPeers]);

    const handleRefresh = useCallback(async () => {
        setIsSyncing(true);
        mesh.requestAllPeerSync();
        await new Promise(r => setTimeout(r, 1200));
        setIsSyncing(false);
    }, []);

    const handlePost = async () => {
        if (!composeText.trim() || !myId) return;
        const myProfile = await db.settings.get("profile");
        const authorName = myProfile?.value?.username || `user-${myId.substring(0, 4)}`;
        const newPost: SocialPost = {
            id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            authorId: myId,
            authorName,
            text: composeText.trim(),
            timestamp: Date.now(),
            vibeCount: 0,
        };
        await db.posts.put(newPost);
        mesh.broadcastSocialPost(newPost);
        setComposeText("");
    };

    const handleSummarize = async (post: SocialPost) => {
        if (summaries[post.id] || summarizing[post.id]) return;
        setSummarizing(prev => ({ ...prev, [post.id]: true }));
        try {
            const summary = await summarize(post.text);
            setSummaries(prev => ({ ...prev, [post.id]: summary }));
        } catch {
            setSummaries(prev => ({ ...prev, [post.id]: "Summary unavailable." }));
        } finally {
            setSummarizing(prev => ({ ...prev, [post.id]: false }));
        }
    };

    const handleVibe = async (post: SocialPost) => {
        if (!myId) return;
        const vibeId = `vibe-${post.id}-${myId}`;
        const existing = await db.vibes.get(vibeId);
        if (existing) return; // one vibe per peer
        const newVibe: SocialVibe = {
            id: vibeId,
            postId: post.id,
            peerId: myId,
            emoji: "⚡",
            timestamp: Date.now(),
        };
        await db.vibes.put(newVibe);
        await db.posts.update(post.id, { vibeCount: (post.vibeCount || 0) + 1 });
        mesh.broadcastSocialVibe(newVibe);
    };

    return (
        <div className="w-full h-full flex flex-col items-center max-w-2xl mx-auto px-4 md:px-0 py-4 relative">

            {/* ── Status Bar ── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="w-full flex items-center justify-between mb-4 mt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/5 bg-white/40 backdrop-blur-xl">
                    <div className={connectedPeers > 0 ? "status-online" : "status-offline"} />
                    <span className="label-data">
                        {connectedPeers > 0 ? `${connectedPeers} node${connectedPeers !== 1 ? 's' : ''} connected` : "Scanning mesh..."}
                    </span>
                </div>
                <button onClick={handleRefresh} disabled={isSyncing} className="btn-ghost">
                    <motion.div animate={{ rotate: isSyncing ? 360 : 0 }} transition={{ duration: 1, repeat: isSyncing ? Infinity : 0, ease: "linear" }}>
                        <RefreshCw className="w-3.5 h-3.5" />
                    </motion.div>
                </button>
            </motion.div>

            {/* ── Compose Card ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="w-full mb-6 glass-panel rounded-2xl p-5 relative overflow-hidden group focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/30 transition-all border border-transparent">
                <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: "linear-gradient(90deg, transparent, var(--violet-glow), transparent)" }} />

                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 bg-white border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 flex flex-col pt-1">
                        <textarea
                            className="w-full bg-transparent text-slate-900 placeholder-slate-400 outline-none resize-none text-[15px] min-h-[60px]"
                            placeholder="Broadcast a signal to the mesh..."
                            value={composeText}
                            onChange={(e) => setComposeText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePost(); }
                            }}
                        />
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
                            <div className="label-data flex items-center gap-1.5 text-blue-600">
                                <Radio className="w-3.5 h-3.5" /> P2P Encrypted
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePost}
                                disabled={!composeText.trim() || !myId || isSyncing}
                                className="btn-teal !py-2 !px-4 !text-[13px] !bg-blue-600 !text-white hover:!bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(37,99,235,0.25)] flex items-center gap-2">
                                {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                {isSyncing ? "Broadcasting..." : "Transmit"}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Tabs ── */}
            <div className="w-full flex gap-2 mb-6 border-b pb-2" style={{ borderColor: "var(--bg-border)" }}>
                {(["LATEST", "TRENDING"] as FeedTab[]).map(t => (
                    <motion.button key={t}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTab(t)}
                        className={`btn-ghost !px-4 !py-2 ${tab === t ? "text-primary !bg-[var(--bg-border)]" : ""}`}>
                        {t === "TRENDING" ? <TrendingUp className={`w-3.5 h-3.5 ${tab === t ? "text-teal" : "text-silver"}`} /> : <Zap className={`w-3.5 h-3.5 ${tab === t ? "text-teal" : "text-silver"}`} />}
                        <span className={`label-data !text-[12px] !m-0 !p-0 ${tab === t ? "font-bold text-slate-900" : "font-medium"}`}>{t}</span>
                    </motion.button>
                ))}
            </div>

            {/* ── Stream ── */}
            <div className="w-full flex-1 overflow-y-auto no-scrollbar pb-32 flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                    {isSyncing && (!displayPosts || displayPosts.length === 0) ? (
                        // Shimmer Skeleton
                        [1, 2, 3].map(i => (
                            <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="w-full h-40 bg-slate-50 border border-black/[0.03] rounded-[2.5rem] p-6 space-y-4 animate-shimmer" />
                        ))
                    ) : (
                        displayPosts?.map((post, i) => (
                            <motion.div key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: Math.min(i * 0.05, 0.5)
                                }}
                                layout
                                className="glass-panel p-6 w-full rounded-[2.5rem] relative group overflow-hidden shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="absolute top-0 left-0 w-[2px] h-0 bg-gradient-to-b from-cyan-400 to-violet-500 group-hover:h-full transition-all duration-500" />

                                {/* Head */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white border border-black/10 shadow-sm flex items-center justify-center font-mono text-[13px] text-slate-800 font-bold">
                                            {post.authorName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-900 text-[14px]">@{post.authorName}</span>
                                                {post.authorId === myId && <span className="label-data px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">You</span>}
                                            </div>
                                            <div className="label-data flex items-center gap-1 mt-0.5">
                                                <span>{post.authorId.substring(0, 8)}</span>
                                                <span style={{ color: "var(--bg-border)" }}>•</span>
                                                <span>{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={post.authorId !== myId ? "w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.4)]" : "w-1.5 h-1.5 rounded-full bg-slate-300"} />
                                </div>

                                {/* Body */}
                                <p className="text-[14px] leading-relaxed text-slate-700 whitespace-pre-wrap ml-12 mb-4">
                                    {post.text}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-3 ml-12 mb-2">
                                    <button onClick={() => handleVibe(post)} className="btn-ghost !px-2 !py-1 text-silver hover:text-teal group/vibe">
                                        <Heart className="w-4 h-4 transition-transform group-active/vibe:scale-75" />
                                        <span className="font-mono text-[11px]">{post.vibeCount || 0}</span>
                                    </button>
                                    <button onClick={() => handleSummarize(post)} disabled={summarizing[post.id]}
                                        className="btn-ghost !px-2 !py-1 ml-auto text-silver hover:text-teal">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span className="label-data !m-0">{summarizing[post.id] ? "..." : "AI"}</span>
                                    </button>
                                </div>

                                {/* AI Summary Panel */}
                                <AnimatePresence>
                                    {summaries[post.id] && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                            className="ml-12 mb-4 overflow-hidden">
                                            <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                                <div className="label-data flex items-center gap-1.5 text-blue-600 mb-2">
                                                    <Sparkles className="w-3.5 h-3.5" /> Ghost Summary
                                                </div>
                                                <p className="text-[13px] text-slate-600 leading-relaxed font-body">{summaries[post.id]}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Replies */}
                                <div className="ml-12 border-t pt-3 mt-2" style={{ borderColor: "var(--bg-border)" }}>
                                    <ReplyThread post={post} myId={myId} />
                                </div>
                            </motion.div>
                        ))
                    )}

                    {/* Empty State */}
                    {displayPosts?.length === 0 && !isSyncing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="w-full py-20 flex flex-col items-center justify-center text-center opacity-50">
                            <Radio className="w-8 h-8 text-[var(--text-muted)] mb-4" />
                            <div className="eyebrow mb-2">Empty Void</div>
                            <p className="label-data">
                                {connectedPeers > 0 ? "Listening for signals..." : "Connect to the mesh to receive signals."}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

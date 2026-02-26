"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Zap, User, MessageSquare, Heart, TrendingUp, RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, SocialPost, SocialVibe } from "@/lib/db/NandixDB";
import { mesh } from "@/lib/p2p/NandixMesh";
import { useBrowserAI } from "@/hooks/useBrowserAI";
import { ReplyThread } from "@/components/Social/ReplyThread";

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
    const { summarize, status: aiStatus, progress: aiProgress } = useBrowserAI();

    // Live post feeds from local sovereign DB
    const latestPosts = useLiveQuery(() => db.posts.orderBy("timestamp").reverse().toArray(), []);
    const trendingPosts = useLiveQuery(() => db.posts.orderBy("vibeCount").reverse().limit(20).toArray(), []);
    const displayPosts = tab === "TRENDING" ? trendingPosts : latestPosts;

    // Auto-sync with all peers when a new peer joins
    useEffect(() => {
        if (connectedPeers > 0) {
            mesh.requestAllPeerSync();
        }
    }, [connectedPeers]);

    // Manual pull-to-refresh
    const handleRefresh = useCallback(async () => {
        setIsSyncing(true);
        mesh.requestAllPeerSync();
        await new Promise(r => setTimeout(r, 1200));
        setIsSyncing(false);
    }, []);

    // Create and broadcast a new post
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

    // AI summarization — runs entirely in browser via Transformers.js
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
        if (existing) return;
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
        <div className="w-full h-full flex flex-col items-center max-w-2xl mx-auto px-4 md:px-0 relative">

            {/* ── Connection Status Bar ──────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-3 mb-2 flex items-center justify-between px-4 py-2 rounded-2xl bg-white/[0.02] border border-white/[0.03]"
            >
                <div className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all ${connectedPeers > 0 ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-700"}`} />
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-500">
                        {connectedPeers > 0 ? `${connectedPeers} Peer${connectedPeers > 1 ? "s" : ""} in Mesh` : "Scanning Void\u2026"}
                    </span>
                </div>
                <button onClick={handleRefresh} disabled={isSyncing} className="text-zinc-600 hover:text-emerald-400 transition-colors disabled:opacity-30">
                    <motion.div animate={{ rotate: isSyncing ? 360 : 0 }} transition={{ duration: 1.2, repeat: isSyncing ? Infinity : 0, ease: "linear" }}>
                        <RefreshCw className="w-3.5 h-3.5" />
                    </motion.div>
                </button>
            </motion.div>

            {/* ── Compose Block ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-5 rounded-[2rem] bg-[#0A0A0A]/90 border border-white/[0.04] backdrop-blur-2xl shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-950 border border-white/[0.05] flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                        <textarea
                            className="w-full bg-transparent text-white placeholder-zinc-600 outline-none resize-none text-[15px] min-h-[70px] font-medium"
                            placeholder="Broadcast your signal to the Sovereign Mesh…"
                            value={composeText}
                            onChange={(e) => setComposeText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePost(); }
                            }}
                        />
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/[0.02]">
                            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Zero-Server P2P Broadcast</span>
                            </div>
                            <button
                                onClick={handlePost}
                                disabled={!composeText.trim()}
                                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-95"
                            >
                                <Send className="w-3.5 h-3.5" /> Transmit
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Feed Tabs ─────────────────────────────────────────────── */}
            <div className="w-full flex gap-2 my-4">
                {(["LATEST", "TRENDING"] as FeedTab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${tab === t ? "bg-white/10 text-white" : "text-zinc-600 hover:text-zinc-400"}`}
                    >
                        {t === "TRENDING" ? <TrendingUp className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Signal Stream ─────────────────────────────────────────── */}
            <div className="w-full flex-1 overflow-y-auto pb-40 no-scrollbar flex flex-col gap-4">
                <AnimatePresence initial={false} mode="popLayout">
                    {displayPosts?.map((post) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, scale: 0.96, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                            layout
                            className="w-full p-6 rounded-[2rem] bg-[#0A0A0A]/90 border border-white/[0.03] group hover:border-white/[0.07] transition-colors"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full bg-zinc-950 border border-white/5 flex items-center justify-center">
                                        <span className="text-zinc-400 font-mono text-sm font-black">{post.authorName.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[15px] text-white">@{post.authorName}</span>
                                            {post.authorId === myId && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 text-zinc-400 uppercase tracking-widest font-black">You</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono mt-0.5">
                                            <span>{post.authorId.substring(0, 8)}…</span>
                                            <span className="opacity-40">·</span>
                                            <span>{new Date(post.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${post.authorId !== myId ? "bg-emerald-500/50 group-hover:bg-emerald-400 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "bg-zinc-700"}`} />
                            </div>

                            {/* Content */}
                            <p className="text-[#E4E4E4] text-[15px] leading-relaxed whitespace-pre-wrap pl-[3.75rem] font-medium">
                                {post.text}
                            </p>

                            {/* Interactions */}
                            <div className="flex items-center gap-4 mt-4 pl-[3.75rem]">
                                <motion.button
                                    whileTap={{ scale: 0.8 }}
                                    onClick={() => handleVibe(post)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-zinc-900 text-zinc-500 transition-colors group/vibe"
                                >
                                    <Heart className="w-4 h-4 group-hover/vibe:text-emerald-400 group-hover/vibe:fill-emerald-400/20 transition-all" />
                                    <span className="text-xs font-black font-mono group-hover/vibe:text-emerald-400">{post.vibeCount || 0}</span>
                                </motion.button>
                                <button
                                    onClick={() => handleSummarize(post)}
                                    disabled={summarizing[post.id]}
                                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-zinc-900 text-zinc-600 hover:text-violet-400 transition-colors text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {summarizing[post.id] ? "..." : "AI"}
                                </button>
                            </div>

                            {/* AI Summary */}
                            <AnimatePresence>
                                {summaries[post.id] && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 ml-[3.75rem] px-4 py-3 rounded-xl bg-violet-500/5 border border-violet-500/10"
                                    >
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Sparkles className="w-3 h-3 text-violet-400" />
                                            <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">AI Summary</span>
                                        </div>
                                        <p className="text-[12px] text-zinc-400 leading-relaxed">{summaries[post.id]}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ── Reply Thread ── */}
                            <ReplyThread post={post} myId={myId} />
                        </motion.div>
                    ))}

                    {displayPosts?.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 opacity-30">
                            <Zap className="w-12 h-12 text-zinc-700 mb-5" />
                            <p className="text-zinc-500 font-mono text-[11px] font-black uppercase tracking-[0.2em]">No signals in the void.</p>
                            <p className="text-zinc-700 font-mono text-[10px] mt-1 tracking-wider">
                                {connectedPeers > 0 ? "Syncing from peers\u2026" : "Connect to peers to receive the signal."}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

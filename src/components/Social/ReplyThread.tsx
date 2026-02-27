"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, SocialPost, SocialReply } from "@/lib/db/NandixDB";
import { mesh } from "@/lib/p2p/NandixMesh";

interface ReplyThreadProps {
    post: SocialPost;
    myId: string | null;
}

export function ReplyThread({ post, myId }: ReplyThreadProps) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");

    const replies = useLiveQuery<SocialReply[]>(
        () => db.replies.where("postId").equals(post.id).sortBy("timestamp") as unknown as Promise<SocialReply[]>,
        [post.id]
    );

    const replyCount = replies?.length || 0;

    const handleReply = async () => {
        if (!text.trim() || !myId) return;
        const myProfile = await db.settings.get("profile");
        const authorName = myProfile?.value?.username || `user-${myId.substring(0, 4)}`;

        const reply: SocialReply = {
            id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            postId: post.id,
            authorId: myId,
            authorName,
            text: text.trim(),
            timestamp: Date.now(),
        };

        await db.replies.put(reply);
        // Update post reply count
        await db.posts.update(post.id, { replyCount: replyCount + 1 });
        // Broadcast to mesh
        mesh.broadcastSocialReply(reply);
        setText("");
    };

    return (
        <div className="mt-2 ml-[3.75rem]">
            {/* Toggle Button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 text-zinc-500 hover:text-cyan-400 transition-all text-[10px] font-mono font-bold uppercase tracking-widest py-1 group"
            >
                <div className="p-1 rounded-md bg-white/5 border border-white/5 group-hover:border-cyan-500/30 transition-all">
                    <MessageSquare className="w-3 h-3" />
                </div>
                {replyCount > 0 ? `${replyCount} Repl${replyCount === 1 ? "y" : "ies"}` : "Reply"}
                {replyCount > 0 && (open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
            </button>

            {/* Thread Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 space-y-3 border-l border-white/[0.04] pl-4">
                            {/* Existing Replies */}
                            {replies?.map((reply) => (
                                <motion.div
                                    key={reply.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                                        <span className="text-[10px] font-mono text-cyan-400 font-bold">{reply.authorName.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[11px] font-black text-white">@{reply.authorName}</span>
                                            {reply.authorId === myId && (
                                                <span className="text-[8px] bg-white/5 text-zinc-500 px-1 rounded uppercase tracking-widest">you</span>
                                            )}
                                            <span className="text-[9px] text-zinc-700 font-mono ml-auto">
                                                {new Date(reply.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-zinc-400 leading-relaxed">{reply.text}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Compose Reply */}
                            <div className="flex gap-3 pt-2">
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                    <User className="w-3.5 h-3.5 text-cyan-400" />
                                </div>
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-[13px] text-white placeholder-zinc-600 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all"
                                        placeholder="Reply to the signal…"
                                        value={text}
                                        onChange={e => setText(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") { e.preventDefault(); handleReply(); }
                                        }}
                                    />
                                    <button
                                        onClick={handleReply}
                                        disabled={!text.trim()}
                                        className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-20"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

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
                className="flex items-center gap-1.5 text-zinc-600 hover:text-white transition-colors text-[10px] font-mono font-black uppercase tracking-widest py-1"
            >
                <MessageSquare className="w-3 h-3" />
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
                                    <div className="w-7 h-7 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[9px] font-mono text-zinc-400 font-black">{reply.authorName.charAt(0).toUpperCase()}</span>
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
                            <div className="flex gap-3 pt-1">
                                <div className="w-7 h-7 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center flex-shrink-0">
                                    <User className="w-3 h-3 text-emerald-500" />
                                </div>
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2 text-[13px] text-white placeholder-zinc-700 outline-none focus:border-emerald-500/30 transition-colors"
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
                                        className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-20"
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
